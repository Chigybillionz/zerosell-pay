use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::GlobalPool;
use crate::constants::GLOBAL_POOL_SEED;

#[derive(Accounts)]
pub struct DepositLiquidity<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        seeds = [GLOBAL_POOL_SEED],
        bump = global_pool.bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        mut,
        constraint = depositor_usdc_ata.mint == global_pool.usdc_mint
    )]
    pub depositor_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = global_pool.usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<DepositLiquidity>, amount_usdc: u64) -> Result<()> {
    require!(amount_usdc > 0, crate::errors::ZeroSellError::ZeroMerchantAmount);

    let cpi_accounts = Transfer {
        from: ctx.accounts.depositor_usdc_ata.to_account_info(),
        to: ctx.accounts.usdc_vault.to_account_info(),
        authority: ctx.accounts.depositor.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token::transfer(cpi_ctx, amount_usdc)?;

    msg!("Deposited {} USDC to ZeroSell Liquidity Vault", amount_usdc);
    Ok(())
}

