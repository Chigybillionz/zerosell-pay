use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};
use crate::state::{ProtocolConfig, UserLoanPosition, POSITION_STATUS_ACTIVE, POSITION_STATUS_LIQUIDATED};
use crate::constants::{PROTOCOL_CONFIG_SEED, USER_POSITION_SEED, COLLATERAL_VAULT_SEED};
use crate::errors::ZeroSellError;
use crate::utils::{
    get_validated_pyth_price,
    calculate_collateral_value_usdc,
    calculate_current_ltv_bps,
};

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct LiquidateOrSettle<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,

    /// CHECK: Target borrower in default / underwater position
    pub borrower: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_CONFIG_SEED],
        bump = protocol_config.bump
    )]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,

    #[account(
        mut,
        seeds = [
            USER_POSITION_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump = user_loan_position.bump,
        has_one = borrower @ ZeroSellError::Unauthorized
    )]
    pub user_loan_position: Box<Account<'info, UserLoanPosition>>,

    pub collateral_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = liquidator_usdc_ata.mint == protocol_config.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = liquidator_usdc_ata.owner == liquidator.key() @ ZeroSellError::Unauthorized
    )]
    pub liquidator_usdc_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        address = protocol_config.liquidity_vault @ ZeroSellError::InvalidCollateralAccount
    )]
    pub liquidity_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = liquidator_collateral_ata.mint == user_loan_position.collateral_mint @ ZeroSellError::CollateralMintMismatch,
        constraint = liquidator_collateral_ata.owner == liquidator.key() @ ZeroSellError::Unauthorized
    )]
    pub liquidator_collateral_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            COLLATERAL_VAULT_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub collateral_vault: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<LiquidateOrSettle>,
    invoice_id: u64,
    oracle_price_usd: u64,
    oracle_confidence_usd: u64,
    oracle_publish_time: i64,
) -> Result<()> {
    let position = &mut ctx.accounts.user_loan_position;
    require!(
        position.status == POSITION_STATUS_ACTIVE,
        ZeroSellError::PositionNotActive
    );

    let config = &mut ctx.accounts.protocol_config;
    let clock = Clock::get()?;

    // 1. CHECKS: Validate oracle price and calculate current LTV
    let validated_price = get_validated_pyth_price(
        oracle_price_usd,
        oracle_confidence_usd,
        oracle_publish_time,
        clock.unix_timestamp,
    )?;

    let current_collateral_val_usdc = calculate_collateral_value_usdc(
        position.collateral_locked,
        validated_price,
        ctx.accounts.collateral_mint.decimals,
    )?;

    let current_ltv_bps = calculate_current_ltv_bps(
        position.debt_usdc_amount,
        current_collateral_val_usdc,
    )?;

    // Liquidation permitted only when LTV >= liquidation_threshold_bps (75.00%)
    require!(
        current_ltv_bps >= config.liquidation_threshold_bps,
        ZeroSellError::PositionHealthy
    );

    let debt_to_repay = position.debt_usdc_amount;
    let collateral_to_seize = position.collateral_locked;
    let borrower_key = ctx.accounts.borrower.key();
    let invoice_bytes = invoice_id.to_le_bytes();

    // 2. EFFECTS: Update state before external CPIs (CEI Pattern)
    config.total_usdc_lent = config.total_usdc_lent.saturating_sub(debt_to_repay);
    position.debt_usdc_amount = 0;
    position.collateral_locked = 0;
    position.status = POSITION_STATUS_LIQUIDATED;

    // 3. INTERACTIONS: CPI token transfers
    // Liquidator repays the borrowed debt into liquidity_vault
    let transfer_usdc_cpi = Transfer {
        from: ctx.accounts.liquidator_usdc_ata.to_account_info(),
        to: ctx.accounts.liquidity_vault.to_account_info(),
        authority: ctx.accounts.liquidator.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_usdc_cpi,
        ),
        debt_to_repay,
    )?;

    // Liquidator seizes collateral from collateral_vault signed by user_loan_position PDA
    let position_bump = position.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[
        USER_POSITION_SEED,
        borrower_key.as_ref(),
        invoice_bytes.as_ref(),
        &[position_bump],
    ]];

    let transfer_collateral_cpi = Transfer {
        from: ctx.accounts.collateral_vault.to_account_info(),
        to: ctx.accounts.liquidator_collateral_ata.to_account_info(),
        authority: position.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_collateral_cpi,
            signer_seeds,
        ),
        collateral_to_seize,
    )?;

    // Close collateral vault account and return rent to liquidator
    let close_cpi = CloseAccount {
        account: ctx.accounts.collateral_vault.to_account_info(),
        destination: ctx.accounts.liquidator.to_account_info(),
        authority: position.to_account_info(),
    };
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_cpi,
        signer_seeds,
    ))?;

    msg!(
        "LiquidateOrSettle: Inv: {}, LTV: {} bps, Repaid: {} USDC, Seized: {}",
        invoice_id,
        current_ltv_bps,
        debt_to_repay,
        collateral_to_seize
    );

    Ok(())
}

