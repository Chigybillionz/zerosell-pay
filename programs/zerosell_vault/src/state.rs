use anchor_lang::prelude::*;

pub const POSITION_STATUS_ACTIVE: u8 = 0;
pub const POSITION_STATUS_REPAID: u8 = 1;
pub const POSITION_STATUS_LIQUIDATED: u8 = 2;

#[account]
pub struct GlobalPool {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub usdc_vault: Pubkey,
    pub max_ltv_bps: u16,
    pub liquidation_threshold_bps: u16,
    pub origination_fee_bps: u16,
    pub total_usdc_lent: u64,
    pub bump: u8,
}

impl GlobalPool {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // usdc_mint
        32 + // usdc_vault
        2 +  // max_ltv_bps
        2 +  // liquidation_threshold_bps
        2 +  // origination_fee_bps
        8 +  // total_usdc_lent
        1 +  // bump
        32;  // reserved padding
}

#[account]
pub struct UserPosition {
    pub borrower: Pubkey,
    pub merchant: Pubkey,
    pub invoice_id: u64,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub debt_usdc_amount: u64,
    pub entry_price_usd: u64, // Scaled by 10^6 ($1 = 1_000_000)
    pub created_at: i64,
    pub status: u8,            // 0: Active, 1: Repaid, 2: Liquidated
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 8 + // discriminator
        32 + // borrower
        32 + // merchant
        8 +  // invoice_id
        32 + // collateral_mint
        8 +  // collateral_amount
        8 +  // debt_usdc_amount
        8 +  // entry_price_usd
        8 +  // created_at
        1 +  // status
        1 +  // bump
        32;  // reserved padding
}

