use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::GlobalPool;
use crate::constants::GLOBAL_POOL_SEED;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = GlobalPool::LEN,
        seeds = [GLOBAL_POOL_SEED],
        bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = global_pool,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializePool>,
    max_ltv_bps: u16,
    liquidation_threshold_bps: u16,
    origination_fee_bps: u16,
) -> Result<()> {
    let pool = &mut ctx.accounts.global_pool;
    pool.authority = ctx.accounts.authority.key();
    pool.usdc_mint = ctx.accounts.usdc_mint.key();
    pool.usdc_vault = ctx.accounts.usdc_vault.key();
    pool.max_ltv_bps = max_ltv_bps;
    pool.liquidation_threshold_bps = liquidation_threshold_bps;
    pool.origination_fee_bps = origination_fee_bps;
    pool.total_usdc_lent = 0;
    pool.bump = ctx.bumps.global_pool;

    msg!(
        "ZeroSell Global Pool Initialized. Max LTV: {} bps, Liq Threshold: {} bps, Fee: {} bps",
        max_ltv_bps,
        liquidation_threshold_bps,
        origination_fee_bps
    );
    Ok(())
}

