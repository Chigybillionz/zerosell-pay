use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};
use crate::state::{GlobalPool, UserPosition, POSITION_STATUS_ACTIVE, POSITION_STATUS_LIQUIDATED};
use crate::constants::{GLOBAL_POOL_SEED, POSITION_SEED, COLLATERAL_VAULT_SEED, BPS_DIVISOR};
use crate::errors::ZeroSellError;

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct LiquidatePosition<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,

    /// CHECK: Target borrower whose position is in liquidation
    pub borrower: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_POOL_SEED],
        bump = global_pool.bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        mut,
        seeds = [
            POSITION_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump = user_position.bump,
        has_one = borrower @ ZeroSellError::Unauthorized
    )]
    pub user_position: Account<'info, UserPosition>,

    pub collateral_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = liquidator_usdc_ata.mint == global_pool.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = liquidator_usdc_ata.owner == liquidator.key() @ ZeroSellError::Unauthorized
    )]
    pub liquidator_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = global_pool.usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = liquidator_collateral_account.mint == user_position.collateral_mint @ ZeroSellError::CollateralMintMismatch,
        constraint = liquidator_collateral_account.owner == liquidator.key() @ ZeroSellError::Unauthorized
    )]
    pub liquidator_collateral_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            COLLATERAL_VAULT_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<LiquidatePosition>,
    invoice_id: u64,
    current_oracle_price_usd: u64,
) -> Result<()> {
    require!(current_oracle_price_usd > 0, ZeroSellError::InvalidOraclePrice);

    let position = &mut ctx.accounts.user_position;
    require!(position.status == POSITION_STATUS_ACTIVE, ZeroSellError::PositionNotActive);

    let pool = &mut ctx.accounts.global_pool;
    let decimals = ctx.accounts.collateral_mint.decimals as u32;
    let factor = 10u128.checked_pow(decimals).ok_or(ZeroSellError::MathOverflow)?;

    // Calculate current collateral value in USDC atomic units
    let current_collateral_val_usdc = (position.collateral_amount as u128)
        .checked_mul(current_oracle_price_usd as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(factor)
        .ok_or(ZeroSellError::MathOverflow)?;

    require!(current_collateral_val_usdc > 0, ZeroSellError::MathOverflow);

    // Current LTV in BPS: (debt_usdc * 10000) / collateral_val
    let current_ltv_bps = (position.debt_usdc_amount as u128)
        .checked_mul(BPS_DIVISOR as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(current_collateral_val_usdc)
        .ok_or(ZeroSellError::MathOverflow)?;

    // Only allow liquidation if current LTV >= liquidation_threshold_bps (e.g. 75%)
    require!(
        current_ltv_bps >= (pool.liquidation_threshold_bps as u128),
        ZeroSellError::PositionHealthy
    );

    let debt_amount = position.debt_usdc_amount;
    let collateral_amount = position.collateral_amount;
    let borrower_key = ctx.accounts.borrower.key();
    let invoice_bytes = invoice_id.to_le_bytes();

    // 1. Liquidator repays the debt to usdc_vault
    let transfer_usdc_cpi = Transfer {
        from: ctx.accounts.liquidator_usdc_ata.to_account_info(),
        to: ctx.accounts.usdc_vault.to_account_info(),
        authority: ctx.accounts.liquidator.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_usdc_cpi,
        ),
        debt_amount,
    )?;

    // 2. Liquidator seizes the borrower's collateral from collateral_vault
    let position_seeds: &[&[u8]] = &[
        POSITION_SEED,
        borrower_key.as_ref(),
        invoice_bytes.as_ref(),
        &[position.bump],
    ];
    let signer = &[position_seeds];

    let transfer_collateral_cpi = Transfer {
        from: ctx.accounts.collateral_vault.to_account_info(),
        to: ctx.accounts.liquidator_collateral_account.to_account_info(),
        authority: position.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_collateral_cpi,
            signer,
        ),
        collateral_amount,
    )?;

    // 3. Close the collateral vault
    let close_cpi = CloseAccount {
        account: ctx.accounts.collateral_vault.to_account_info(),
        destination: ctx.accounts.liquidator.to_account_info(),
        authority: position.to_account_info(),
    };
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_cpi,
        signer,
    ))?;

    // 4. Update metrics and status
    pool.total_usdc_lent = pool.total_usdc_lent.saturating_sub(debt_amount);
    position.status = POSITION_STATUS_LIQUIDATED;

    msg!(
        "Position Liquidated! Invoice: {}, LTV: {} bps, Liquidator Repaid: {} USDC, Seized: {}",
        invoice_id,
        current_ltv_bps,
        debt_amount,
        collateral_amount
    );

    Ok(())
}

