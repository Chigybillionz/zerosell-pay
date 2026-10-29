use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::ProtocolConfig;
use crate::constants::{PROTOCOL_CONFIG_SEED, LIQUIDITY_VAULT_SEED};

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Protocol fee treasury recipient wallet
    pub treasury: AccountInfo<'info>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        space = ProtocolConfig::LEN,
        seeds = [PROTOCOL_CONFIG_SEED],
        bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = admin,
        token::mint = usdc_mint,
        token::authority = protocol_config,
        seeds = [LIQUIDITY_VAULT_SEED],
        bump
    )]
    pub liquidity_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeProtocol>,
    max_ltv_bps: u16,
    liquidation_threshold_bps: u16,
    protocol_fee_bps: u16,
) -> Result<()> {
    let config = &mut ctx.accounts.protocol_config;
    config.admin = ctx.accounts.admin.key();
    config.treasury = ctx.accounts.treasury.key();
    config.usdc_mint = ctx.accounts.usdc_mint.key();
    config.liquidity_vault = ctx.accounts.liquidity_vault.key();
    config.max_ltv_bps = max_ltv_bps;
    config.liquidation_threshold_bps = liquidation_threshold_bps;
    config.protocol_fee_bps = protocol_fee_bps;
    config.total_usdc_lent = 0;
    config.paused = false;
    config.bump = ctx.bumps.protocol_config;

    msg!(
        "ZeroSell Protocol Initialized. Max LTV: {} bps, Liq Threshold: {} bps, Fee: {} bps",
        max_ltv_bps,
        liquidation_threshold_bps,
        protocol_fee_bps
    );
    Ok(())
}
