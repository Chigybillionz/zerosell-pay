pub const PROTOCOL_CONFIG_SEED: &[u8] = b"protocol_config";
pub const USER_POSITION_SEED: &[u8] = b"user_position";
pub const LIQUIDITY_VAULT_SEED: &[u8] = b"liquidity_vault";
pub const COLLATERAL_VAULT_SEED: &[u8] = b"collateral_vault";

pub const DEFAULT_MAX_LTV_BPS: u16 = 5000;              // 50.00% initial max LTV
pub const DEFAULT_LIQUIDATION_THRESHOLD_BPS: u16 = 7500; // 75.00% liquidation threshold
pub const DEFAULT_PROTOCOL_FEE_BPS: u16 = 30;           // 0.30% flat protocol fee routed to treasury
pub const LIQUIDATION_BONUS_BPS: u16 = 500;             // 5.00% liquidator incentive
pub const BPS_DIVISOR: u64 = 10000;

pub const MAX_ORACLE_STALENESS_SECONDS: i64 = 60;       // Max allowable Pyth price staleness
pub const MAX_ORACLE_CONFIDENCE_PERCENT: u64 = 2;       // Max 2% confidence interval width
pub const PRICE_DECIMALS: u32 = 6;                      // Scaled to 10^6 ($1.00 = 1_000_000)
pub const PYTH_SOL_USD_FEED_ID: &str = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
