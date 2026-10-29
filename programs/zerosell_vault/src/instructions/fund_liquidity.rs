use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::ProtocolConfig;
use crate::constants::PROTOCOL_CONFIG_SEED;
use crate::errors::ZeroSellError;

#[derive(Accounts)]
pub struct FundLiquidity<'info> {
    #[account(mut)]
    pub funder: Signer<'info>,

    #[account(
        seeds = [PROTOCOL_CONFIG_SEED],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        constraint = funder_usdc_ata.mint == protocol_config.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = funder_usdc_ata.owner == funder.key() @ ZeroSellError::Unauthorized
    )]
    pub funder_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = protocol_config.liquidity_vault @ ZeroSellError::InvalidCollateralAccount
    )]
    pub liquidity_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<FundLiquidity>, amount_usdc: u64) -> Result<()> {
    require!(amount_usdc > 0, ZeroSellError::ZeroBorrowAmount);

    let cpi_accounts = Transfer {
        from: ctx.accounts.funder_usdc_ata.to_account_info(),
        to: ctx.accounts.liquidity_vault.to_account_info(),
        authority: ctx.accounts.funder.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token::transfer(cpi_ctx, amount_usdc)?;

    msg!("Funded {} USDC into ZeroSell Protocol Liquidity Vault", amount_usdc);
    Ok(())
}

