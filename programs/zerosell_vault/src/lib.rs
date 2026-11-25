use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("FrjqMc7Cmz79KiZ4BXDqMVwRvutAM1jfc9PL3MTaAUCs");

#[macro_export]
macro_rules! assert_not_paused {
    ($config:expr) => {
        require!(!$config.paused, $crate::errors::ZeroSellError::ProtocolPaused);
    };
}

#[program]
pub mod zerosell_vault {
    use super::*;

    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        max_ltv_bps: u16,
        liquidation_threshold_bps: u16,
        protocol_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_protocol::handler(ctx, max_ltv_bps, liquidation_threshold_bps, protocol_fee_bps)
    }

    pub fn fund_liquidity(ctx: Context<FundLiquidity>, amount_usdc: u64) -> Result<()> {
        assert_not_paused!(ctx.accounts.protocol_config);
        instructions::fund_liquidity::handler(ctx, amount_usdc)
    }

    pub fn lock_collateral_and_pay(
        ctx: Context<LockCollateralAndPay>,
        invoice_id: u64,
        collateral_amount: u64,
        merchant_usdc_amount: u64,
        oracle_price_usd: u64,
        oracle_confidence_usd: u64,
        oracle_publish_time: i64,
    ) -> Result<()> {
        assert_not_paused!(ctx.accounts.protocol_config);
        instructions::lock_collateral_and_pay::handler(
            ctx, invoice_id, collateral_amount, merchant_usdc_amount, oracle_price_usd, oracle_confidence_usd, oracle_publish_time
        )
    }

    pub fn repay_and_unlock(ctx: Context<RepayAndUnlock>, invoice_id: u64, repay_amount_usdc: u64) -> Result<()> {
        assert_not_paused!(ctx.accounts.protocol_config);
        instructions::repay_and_unlock::handler(ctx, invoice_id, repay_amount_usdc)
    }

    pub fn liquidate_or_settle(
        ctx: Context<LiquidateOrSettle>,
        invoice_id: u64,
        oracle_price_usd: u64,
        oracle_confidence_usd: u64,
        oracle_publish_time: i64,
    ) -> Result<()> {
        assert_not_paused!(ctx.accounts.protocol_config);
        instructions::liquidate_or_settle::handler(ctx, invoice_id, oracle_price_usd, oracle_confidence_usd, oracle_publish_time)
    }
}
