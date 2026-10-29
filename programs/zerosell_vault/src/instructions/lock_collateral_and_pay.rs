use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::{ProtocolConfig, UserLoanPosition, POSITION_STATUS_ACTIVE};
use crate::constants::{PROTOCOL_CONFIG_SEED, USER_POSITION_SEED, COLLATERAL_VAULT_SEED};
use crate::errors::ZeroSellError;
use crate::utils::{
    get_validated_pyth_price,
    calculate_collateral_value_usdc,
    calculate_max_borrow_usdc,
    calculate_protocol_fee,
};

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct LockCollateralAndPay<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    /// CHECK: Merchant recipient address
    pub merchant: AccountInfo<'info>,

    /// CHECK: Protocol treasury wallet matching config
    #[account(
        constraint = treasury.key() == protocol_config.treasury @ ZeroSellError::InvalidTreasury
    )]
    pub treasury: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_CONFIG_SEED],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = borrower,
        space = UserLoanPosition::LEN,
        seeds = [
            USER_POSITION_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub user_loan_position: Account<'info, UserLoanPosition>,

    pub collateral_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = borrower_collateral_ata.mint == collateral_mint.key() @ ZeroSellError::InvalidCollateralAccount,
        constraint = borrower_collateral_ata.owner == borrower.key() @ ZeroSellError::Unauthorized
    )]
    pub borrower_collateral_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = borrower,
        token::mint = collateral_mint,
        token::authority = user_loan_position,
        seeds = [
            COLLATERAL_VAULT_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = protocol_config.liquidity_vault @ ZeroSellError::InvalidCollateralAccount
    )]
    pub liquidity_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = merchant_usdc_ata.mint == protocol_config.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = merchant_usdc_ata.owner == merchant.key() @ ZeroSellError::Unauthorized
    )]
    pub merchant_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = treasury_usdc_ata.mint == protocol_config.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = treasury_usdc_ata.owner == treasury.key() @ ZeroSellError::InvalidTreasury
    )]
    pub treasury_usdc_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<LockCollateralAndPay>,
    invoice_id: u64,
    collateral_amount: u64,
    merchant_usdc_amount: u64,
    oracle_price_usd: u64,
    oracle_confidence_usd: u64,
    oracle_publish_time: i64,
) -> Result<()> {
    require!(invoice_id > 0, ZeroSellError::InvalidInvoiceId);
    require!(collateral_amount > 0, ZeroSellError::ZeroCollateral);
    require!(merchant_usdc_amount > 0, ZeroSellError::ZeroBorrowAmount);

    let config = &mut ctx.accounts.protocol_config;
    let clock = Clock::get()?;

    // 1. CHECKS: Validate Pyth Oracle price, staleness, and confidence
    let validated_price = get_validated_pyth_price(
        oracle_price_usd,
        oracle_confidence_usd,
        oracle_publish_time,
        clock.unix_timestamp,
    )?;

    // Calculate collateral USD valuation in USDC atomic units
    let collateral_val_usdc = calculate_collateral_value_usdc(
        collateral_amount,
        validated_price,
        ctx.accounts.collateral_mint.decimals,
    )?;

    // Calculate maximum permitted borrow at protocol's max LTV (50%)
    let max_borrow_usdc = calculate_max_borrow_usdc(
        collateral_val_usdc,
        config.max_ltv_bps,
    )?;

    require!(
        merchant_usdc_amount <= max_borrow_usdc,
        ZeroSellError::LtvLimitExceeded
    );

    // Calculate 0.30% flat protocol fee routed to treasury
    let fee = calculate_protocol_fee(merchant_usdc_amount, config.protocol_fee_bps)?;
    let total_disbursed = merchant_usdc_amount
        .checked_add(fee)
        .ok_or(ZeroSellError::MathOverflow)?;

    require!(
        ctx.accounts.liquidity_vault.amount >= total_disbursed,
        ZeroSellError::InsufficientLiquidity
    );

    // 2. EFFECTS (State mutations before external CPIs): CEI Pattern
    config.total_usdc_lent = config
        .total_usdc_lent
        .checked_add(total_disbursed)
        .ok_or(ZeroSellError::MathOverflow)?;

    let position = &mut ctx.accounts.user_loan_position;
    position.borrower = ctx.accounts.borrower.key();
    position.merchant = ctx.accounts.merchant.key();
    position.invoice_id = invoice_id;
    position.collateral_mint = ctx.accounts.collateral_mint.key();
    position.collateral_locked = collateral_amount;
    position.debt_usdc_amount = total_disbursed;
    position.entry_price_usd = validated_price;
    position.created_at = clock.unix_timestamp;
    position.status = POSITION_STATUS_ACTIVE;
    position.bump = ctx.bumps.user_loan_position;

    // 3. INTERACTIONS: CPI token transfers
    // Transfer collateral from borrower to collateral_vault
    let transfer_collateral_cpi = Transfer {
        from: ctx.accounts.borrower_collateral_ata.to_account_info(),
        to: ctx.accounts.collateral_vault.to_account_info(),
        authority: ctx.accounts.borrower.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_collateral_cpi,
        ),
        collateral_amount,
    )?;

    // Transfer USDC directly to merchant from liquidity vault using protocol_config PDA signer
    let config_bump = config.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[
        PROTOCOL_CONFIG_SEED,
        &[config_bump],
    ]];

    let transfer_merchant_cpi = Transfer {
        from: ctx.accounts.liquidity_vault.to_account_info(),
        to: ctx.accounts.merchant_usdc_ata.to_account_info(),
        authority: config.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_merchant_cpi,
            signer_seeds,
        ),
        merchant_usdc_amount,
    )?;

    // Transfer protocol fee to treasury ATA
    if fee > 0 {
        let transfer_fee_cpi = Transfer {
            from: ctx.accounts.liquidity_vault.to_account_info(),
            to: ctx.accounts.treasury_usdc_ata.to_account_info(),
            authority: config.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_fee_cpi,
                signer_seeds,
            ),
            fee,
        )?;
    }

    msg!(
        "LockCollateralAndPay Success! Inv: {}, Collateral: {}, Paid: {} USDC, Fee: {} USDC",
        invoice_id,
        collateral_amount,
        merchant_usdc_amount,
        fee
    );

    Ok(())
}

