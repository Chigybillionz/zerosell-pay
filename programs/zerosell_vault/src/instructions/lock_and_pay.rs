use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::{GlobalPool, UserPosition, POSITION_STATUS_ACTIVE};
use crate::constants::{GLOBAL_POOL_SEED, POSITION_SEED, COLLATERAL_VAULT_SEED, BPS_DIVISOR};
use crate::errors::ZeroSellError;

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct LockAndPay<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    /// CHECK: Validated as the recipient merchant account
    pub merchant: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_POOL_SEED],
        bump = global_pool.bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        init,
        payer = borrower,
        space = UserPosition::LEN,
        seeds = [
            POSITION_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    pub collateral_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = borrower_collateral_account.mint == collateral_mint.key() @ ZeroSellError::InvalidCollateralAccount,
        constraint = borrower_collateral_account.owner == borrower.key() @ ZeroSellError::Unauthorized
    )]
    pub borrower_collateral_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = borrower,
        token::mint = collateral_mint,
        token::authority = user_position,
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
        address = global_pool.usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = merchant_usdc_ata.mint == global_pool.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = merchant_usdc_ata.owner == merchant.key() @ ZeroSellError::Unauthorized
    )]
    pub merchant_usdc_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<LockAndPay>,
    invoice_id: u64,
    collateral_amount: u64,
    merchant_usdc_amount: u64,
    oracle_price_usd: u64, // Price scaled by 10^6 ($1 = 1_000_000)
) -> Result<()> {
    require!(invoice_id > 0, ZeroSellError::InvalidInvoiceId);
    require!(collateral_amount > 0, ZeroSellError::ZeroCollateral);
    require!(merchant_usdc_amount > 0, ZeroSellError::ZeroMerchantAmount);
    require!(oracle_price_usd > 0, ZeroSellError::InvalidOraclePrice);

    let pool = &mut ctx.accounts.global_pool;

    // Verify sufficient liquidity in the USDC vault
    require!(
        ctx.accounts.usdc_vault.amount >= merchant_usdc_amount,
        ZeroSellError::InsufficientVaultLiquidity
    );

    // Calculate Collateral Value in USDC atomic units (6 decimals):
    // collateral_value = (collateral_amount * oracle_price_usd) / 10^decimals
    let decimals = ctx.accounts.collateral_mint.decimals as u32;
    let factor = 10u128.checked_pow(decimals).ok_or(ZeroSellError::MathOverflow)?;

    let collateral_val_usdc = (collateral_amount as u128)
        .checked_mul(oracle_price_usd as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(factor)
        .ok_or(ZeroSellError::MathOverflow)?;

    // Max allowed borrow at pool's max_ltv_bps
    let max_borrow = collateral_val_usdc
        .checked_mul(pool.max_ltv_bps as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(BPS_DIVISOR as u128)
        .ok_or(ZeroSellError::MathOverflow)?;

    require!(
        (merchant_usdc_amount as u128) <= max_borrow,
        ZeroSellError::LtvExceeded
    );

    // Calculate origination fee: fee = (merchant_usdc * origination_fee_bps) / 10000
    let fee = (merchant_usdc_amount as u128)
        .checked_mul(pool.origination_fee_bps as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(BPS_DIVISOR as u128)
        .ok_or(ZeroSellError::MathOverflow)? as u64;

    let debt_usdc_amount = merchant_usdc_amount
        .checked_add(fee)
        .ok_or(ZeroSellError::MathOverflow)?;

    // 1. Transfer collateral from borrower to collateral_vault
    let transfer_collateral_cpi = Transfer {
        from: ctx.accounts.borrower_collateral_account.to_account_info(),
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

    // 2. Transfer USDC directly from usdc_vault to merchant_usdc_ata using global_pool PDA seeds
    let pool_bump = pool.bump;
    let pool_seeds: &[&[u8]] = &[
        GLOBAL_POOL_SEED,
        &[pool_bump],
    ];
    let signer = &[pool_seeds];

    let transfer_usdc_cpi = Transfer {
        from: ctx.accounts.usdc_vault.to_account_info(),
        to: ctx.accounts.merchant_usdc_ata.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_usdc_cpi,
            signer,
        ),
        merchant_usdc_amount,
    )?;

    // 3. Update global pool metrics
    pool.total_usdc_lent = pool
        .total_usdc_lent
        .checked_add(merchant_usdc_amount)
        .ok_or(ZeroSellError::MathOverflow)?;

    // 4. Initialize UserPosition record
    let position = &mut ctx.accounts.user_position;
    position.borrower = ctx.accounts.borrower.key();
    position.merchant = ctx.accounts.merchant.key();
    position.invoice_id = invoice_id;
    position.collateral_mint = ctx.accounts.collateral_mint.key();
    position.collateral_amount = collateral_amount;
    position.debt_usdc_amount = debt_usdc_amount;
    position.entry_price_usd = oracle_price_usd;
    position.created_at = Clock::get()?.unix_timestamp;
    position.status = POSITION_STATUS_ACTIVE;
    position.bump = ctx.bumps.user_position;

    msg!(
        "LockAndPay Success! Invoice: {}, Collateral: {}, Lent: {} USDC, Total Debt: {} USDC",
        invoice_id,
        collateral_amount,
        merchant_usdc_amount,
        debt_usdc_amount
    );

    Ok(())
}
