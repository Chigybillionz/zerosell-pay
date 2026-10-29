pub const GLOBAL_POOL_SEED: &[u8] = b"global_pool";
pub const POSITION_SEED: &[u8] = b"position";
pub const COLLATERAL_VAULT_SEED: &[u8] = b"collateral_vault";

pub const DEFAULT_MAX_LTV_BPS: u16 = 5000;               // 50.00% initial max LTV
pub const DEFAULT_LIQUIDATION_THRESHOLD_BPS: u16 = 7500;  // 75.00% liquidation threshold
pub const DEFAULT_ORIGINATION_FEE_BPS: u16 = 50;         // 0.50% origination fee
pub const LIQUIDATION_BONUS_BPS: u16 = 500;              // 5.00% liquidator incentive
pub const BPS_DIVISOR: u64 = 10000;

pub const PRICE_DECIMALS: u32 = 6;                       // Scaled to 10^6 ($1.00 = 1_000_000)
pub const PYTH_SOL_USD_FEED_ID: &str = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

