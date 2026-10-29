use anchor_lang::prelude::*;
use crate::constants::BPS_DIVISOR;
use crate::errors::ZeroSellError;

/**
 * Calculates Collateral USD value scaled to 6-decimal atomic units (USDC):
 * value = (collateral_amount * price_usd) / 10^decimals
 */
pub fn calculate_collateral_value_usdc(
    collateral_amount: u64,
    price_usd: u64,
    collateral_decimals: u8,
) -> Result<u64> {
    let factor = 10u128
        .checked_pow(collateral_decimals as u32)
        .ok_or(ZeroSellError::MathOverflow)?;

    let value = (collateral_amount as u128)
        .checked_mul(price_usd as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(factor)
        .ok_or(ZeroSellError::MathOverflow)?;

    Ok(value as u64)
}

/**
 * Calculates Maximum allowed borrow at pool's max LTV:
 * max_borrow = (collateral_val_usdc * max_ltv_bps) / 10000
 */
pub fn calculate_max_borrow_usdc(
    collateral_val_usdc: u64,
    max_ltv_bps: u16,
) -> Result<u64> {
    let max_borrow = (collateral_val_usdc as u128)
        .checked_mul(max_ltv_bps as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(BPS_DIVISOR as u128)
        .ok_or(ZeroSellError::MathOverflow)?;

    Ok(max_borrow as u64)
}

/**
 * Calculates protocol origination fee:
 * fee = (amount_usdc * fee_bps) / 10000
 */
pub fn calculate_protocol_fee(amount_usdc: u64, fee_bps: u16) -> Result<u64> {
    let fee = (amount_usdc as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(BPS_DIVISOR as u128)
        .ok_or(ZeroSellError::MathOverflow)?;

    Ok(fee as u64)
}

/**
 * Calculates current position LTV in basis points (1% = 100 bps):
 * ltv_bps = (debt_usdc * 10000) / collateral_val_usdc
 */
pub fn calculate_current_ltv_bps(
    debt_usdc: u64,
    collateral_val_usdc: u64,
) -> Result<u16> {
    require!(collateral_val_usdc > 0, ZeroSellError::MathOverflow);

    let ltv = (debt_usdc as u128)
        .checked_mul(BPS_DIVISOR as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(collateral_val_usdc as u128)
        .ok_or(ZeroSellError::MathOverflow)?;

    Ok(ltv as u16)
}

