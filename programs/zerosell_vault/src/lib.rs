use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("3TKiwrS9LNA3H2gnpfTVDyujP48PbCBo93w18q4ddZDv");

#[program]
pub mod zerosell_vault {
    use super::*;

    /// Initialize the ZeroSell protocol global pool and USDC vault
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        max_ltv_bps: u16,
        liquidation_threshold_bps: u16,
        origination_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_pool::handler(
            ctx,
            max_ltv_bps,
            liquidation_threshold_bps,
            origination_fee_bps,
        )
    }

    /// Deposit USDC liquidity into the protocol vault
    pub fn deposit_liquidity(ctx: Context<DepositLiquidity>, amount_usdc: u64) -> Result<()> {
        instructions::deposit_liquidity::handler(ctx, amount_usdc)
    }

    /// Core atomic instruction: lock collateral, verify LTV against Pyth oracle,
    /// disburse USDC directly to merchant, and record UserPosition PDA
    pub fn lock_and_pay(
        ctx: Context<LockAndPay>,
        invoice_id: u64,
        collateral_amount: u64,
        merchant_usdc_amount: u64,
        oracle_price_usd: u64,
    ) -> Result<()> {
        instructions::lock_and_pay::handler(
            ctx,
            invoice_id,
            collateral_amount,
            merchant_usdc_amount,
            oracle_price_usd,
        )
    }

    /// Repay borrowed USDC + flat origination fee and unlock collateral back to borrower
    pub fn repay_position(ctx: Context<RepayPosition>, invoice_id: u64) -> Result<()> {
        instructions::repay_position::handler(ctx, invoice_id)
    }

    /// Liquidate an unhealthy position when LTV exceeds liquidation threshold (default 75%)
    pub fn liquidate_position(
        ctx: Context<LiquidatePosition>,
        invoice_id: u64,
        current_oracle_price_usd: u64,
    ) -> Result<()> {
        instructions::liquidate::handler(ctx, invoice_id, current_oracle_price_usd)
    }
}

