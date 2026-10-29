import { PublicKey } from "@solana/web3.js";

// ==========================================
// 1. Program ID & Network
// ==========================================
export const ZEROSELL_PROGRAM_ID = new PublicKey(
  "3TKiwrS9LNA3H2gnpfTVDyujP48PbCBo93w18q4ddZDv"
);

export const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";

// ==========================================
// 2. PDA Seeds (Centralized Single Source of Truth)
// ==========================================
export const PROTOCOL_CONFIG_SEED = "protocol_config";
export const USER_POSITION_SEED = "user_position";
export const LIQUIDITY_VAULT_SEED = "liquidity_vault";
export const COLLATERAL_VAULT_SEED = "collateral_vault";

const encoder = new TextEncoder();
export const PROTOCOL_CONFIG_SEED_BUFFER = encoder.encode(PROTOCOL_CONFIG_SEED);
export const USER_POSITION_SEED_BUFFER = encoder.encode(USER_POSITION_SEED);
export const LIQUIDITY_VAULT_SEED_BUFFER = encoder.encode(LIQUIDITY_VAULT_SEED);
export const COLLATERAL_VAULT_SEED_BUFFER = encoder.encode(COLLATERAL_VAULT_SEED);

// ==========================================
// 3. Supported Token Mints (Devnet)
// ==========================================
export const DEVNET_USDC_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const TOKEN_DECIMALS = {
  USDC: 6,
  SOL: 9,
  NVDAx: 6,
} as const;

// ==========================================
// 4. Pyth Hermes Oracle Price Feeds
// ==========================================
export const PYTH_HERMES_ENDPOINT = "https://hermes.pyth.network";

export const PYTH_FEED_IDS = {
  SOL_USD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  NVDA_USD: "0x600f727827ddab7a34aa8ce74b97d1ec39009eb05085eec56c708170aa4d59bc",
  BTC_USD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH_USD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
} as const;

// ==========================================
// 5. Financial Risk & LTV Guardrails
// ==========================================
export const DEFAULT_MAX_LTV_BPS = 5000;              // 50.00% Maximum initial Loan-to-Value
export const DEFAULT_LIQUIDATION_THRESHOLD_BPS = 7500; // 75.00% Liquidation threshold
export const DEFAULT_PROTOCOL_FEE_BPS = 30;           // 0.30% Flat protocol fee to treasury
export const LIQUIDATION_BONUS_BPS = 500;             // 5.00% Keeper incentive bonus
export const BPS_DIVISOR = 10000;

export const MAX_ORACLE_STALENESS_SECONDS = 60;       // Max allowable Pyth price lag
export const MAX_ORACLE_CONFIDENCE_PERCENT = 2.0;     // Max allowable confidence interval (2% of price)
export const PRICE_DECIMALS = 6;                      // USD prices scaled by 10^6 ($1.00 = 1_000_000)

