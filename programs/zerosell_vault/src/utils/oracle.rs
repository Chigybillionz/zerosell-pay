use anchor_lang::prelude::*;
use crate::constants::{MAX_ORACLE_STALENESS_SECONDS, MAX_ORACLE_CONFIDENCE_PERCENT};
use crate::errors::ZeroSellError;

/**
 * Validates Pyth oracle price data:
 * 1. Confirms price is strictly positive
 * 2. Checks staleness: current_time - publish_time <= 60 seconds
 * 3. Confirms confidence interval is within 2% of the price
 */
pub fn get_validated_pyth_price(
    price_usd: u64,
    conf_usd: u64,
    publish_time: i64,
    current_time: i64,
) -> Result<u64> {
    require!(price_usd > 0, ZeroSellError::OraclePriceStale);

    // Verify oracle staleness (clock.unix_timestamp - publish_time <= 60s)
    let age = current_time
        .checked_sub(publish_time)
        .ok_or(ZeroSellError::OraclePriceStale)?;

    require!(
        age >= -5 && age <= MAX_ORACLE_STALENESS_SECONDS,
        ZeroSellError::OraclePriceStale
    );

    // Verify confidence interval is under 2% of price
    let max_allowed_conf = (price_usd as u128)
        .checked_mul(MAX_ORACLE_CONFIDENCE_PERCENT as u128)
        .ok_or(ZeroSellError::MathOverflow)?
        .checked_div(100)
        .ok_or(ZeroSellError::MathOverflow)?;

    require!(
        (conf_usd as u128) <= max_allowed_conf,
        ZeroSellError::OracleConfidenceTooWide
    );

    Ok(price_usd)
}

