import { PublicKey } from "@solana/web3.js";

// ==========================================
// 1. Program ID & Network
// ==========================================
export const ZEROSELL_PROGRAM_ID = new PublicKey(
  "3TKiwrS9LNA3H2gnpfTVDyujP48PbCBo93w18q4ddZDv"
);

export const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";

// ==========================================
// 2. PDA Seeds
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
} as const;

// ==========================================
// 5. PDA Derivation Functions
// ==========================================
export function getProtocolConfigPda(programId: PublicKey = ZEROSELL_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([PROTOCOL_CONFIG_SEED_BUFFER], programId);
}

export function getLiquidityVaultPda(programId: PublicKey = ZEROSELL_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([LIQUIDITY_VAULT_SEED_BUFFER], programId);
}

export function getInvoiceBuffer(invoiceId: number | bigint): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigUint64(0, BigInt(invoiceId), true);
  return buf;
}

export function getUserLoanPositionPda(
  borrower: PublicKey,
  invoiceId: number | bigint,
  programId: PublicKey = ZEROSELL_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [USER_POSITION_SEED_BUFFER, borrower.toBytes(), getInvoiceBuffer(invoiceId)],
    programId
  );
}

export function getCollateralVaultPda(
  borrower: PublicKey,
  invoiceId: number | bigint,
  programId: PublicKey = ZEROSELL_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [COLLATERAL_VAULT_SEED_BUFFER, borrower.toBytes(), getInvoiceBuffer(invoiceId)],
    programId
  );
}

// ==========================================
// 6. Anchor IDL
// ==========================================
export const IDL = {
  address: "3TKiwrS9LNA3H2gnpfTVDyujP48PbCBo93w18q4ddZDv",
  metadata: {
    name: "zerosell_vault",
    version: "0.1.0",
    spec: "0.1.0",
    description: "ZeroSell Pay - Spend Assets Without Selling on Solana",
  },
  instructions: [
    {
      name: "initialize_protocol",
      discriminator: [95, 180, 10, 172, 84, 173, 99, 244],
      accounts: [
        { name: "admin", writable: true, signer: true },
        { name: "treasury", writable: false, signer: false },
        { name: "usdc_mint", writable: false, signer: false },
        { name: "protocol_config", writable: true, signer: false, pda: { seeds: [{ kind: "const", value: [112, 114, 111, 116, 111, 99, 111, 108, 95, 99, 111, 110, 102, 105, 103] }] } },
        { name: "liquidity_vault", writable: true, signer: false, pda: { seeds: [{ kind: "const", value: [108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117, 108, 116] }] } },
        { name: "system_program", address: "11111111111111111111111111111111" },
        { name: "token_program", address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { name: "rent", address: "SysvarRent111111111111111111111111111111111" },
      ],
      args: [
        { name: "max_ltv_bps", type: "u16" },
        { name: "liquidation_threshold_bps", type: "u16" },
        { name: "protocol_fee_bps", type: "u16" },
      ],
    },
    {
      name: "fund_liquidity",
      discriminator: [35, 14, 187, 85, 252, 91, 111, 237],
      accounts: [
        { name: "funder", writable: true, signer: true },
        { name: "protocol_config", writable: false, signer: false },
        { name: "funder_usdc_ata", writable: true, signer: false },
        { name: "liquidity_vault", writable: true, signer: false },
        { name: "token_program", address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
      ],
      args: [{ name: "amount_usdc", type: "u64" }],
    },
    {
      name: "lock_collateral_and_pay",
      discriminator: [121, 62, 161, 74, 98, 203, 14, 219],
      accounts: [
        { name: "borrower", writable: true, signer: true },
        { name: "merchant", writable: false, signer: false },
        { name: "treasury", writable: false, signer: false },
        { name: "protocol_config", writable: true, signer: false },
        { name: "user_loan_position", writable: true, signer: false },
        { name: "collateral_mint", writable: false, signer: false },
        { name: "borrower_collateral_ata", writable: true, signer: false },
        { name: "collateral_vault", writable: true, signer: false },
        { name: "liquidity_vault", writable: true, signer: false },
        { name: "merchant_usdc_ata", writable: true, signer: false },
        { name: "treasury_usdc_ata", writable: true, signer: false },
        { name: "system_program", address: "11111111111111111111111111111111" },
        { name: "token_program", address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { name: "rent", address: "SysvarRent111111111111111111111111111111111" },
      ],
      args: [
        { name: "invoice_id", type: "u64" },
        { name: "collateral_amount", type: "u64" },
        { name: "merchant_usdc_amount", type: "u64" },
        { name: "oracle_price_usd", type: "u64" },
        { name: "oracle_confidence_usd", type: "u64" },
        { name: "oracle_publish_time", type: "i64" },
      ],
    },
    {
      name: "repay_and_unlock",
      discriminator: [211, 18, 117, 197, 246, 172, 89, 73],
      accounts: [
        { name: "borrower", writable: true, signer: true },
        { name: "protocol_config", writable: true, signer: false },
        { name: "user_loan_position", writable: true, signer: false },
        { name: "borrower_usdc_ata", writable: true, signer: false },
        { name: "liquidity_vault", writable: true, signer: false },
        { name: "borrower_collateral_ata", writable: true, signer: false },
        { name: "collateral_vault", writable: true, signer: false },
        { name: "token_program", address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
      ],
      args: [
        { name: "invoice_id", type: "u64" },
        { name: "repay_amount_usdc", type: "u64" },
      ],
    },
    {
      name: "liquidate_or_settle",
      discriminator: [116, 219, 119, 172, 191, 101, 151, 115],
      accounts: [
        { name: "liquidator", writable: true, signer: true },
        { name: "borrower", writable: false, signer: false },
        { name: "protocol_config", writable: true, signer: false },
        { name: "user_loan_position", writable: true, signer: false },
        { name: "collateral_mint", writable: false, signer: false },
        { name: "liquidator_usdc_ata", writable: true, signer: false },
        { name: "liquidity_vault", writable: true, signer: false },
        { name: "liquidator_collateral_ata", writable: true, signer: false },
        { name: "collateral_vault", writable: true, signer: false },
        { name: "token_program", address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
      ],
      args: [
        { name: "invoice_id", type: "u64" },
        { name: "oracle_price_usd", type: "u64" },
        { name: "oracle_confidence_usd", type: "u64" },
        { name: "oracle_publish_time", type: "i64" },
      ],
    },
  ],
  accounts: [
    {
      name: "ProtocolConfig",
      discriminator: [128, 155, 76, 211, 233, 18, 142, 60],
    },
    {
      name: "UserLoanPosition",
      discriminator: [201, 161, 91, 153, 137, 189, 75, 109],
    },
  ],
  types: [
    {
      name: "ProtocolConfig",
      type: {
        kind: "struct",
        fields: [
          { name: "admin", type: "pubkey" },
          { name: "treasury", type: "pubkey" },
          { name: "usdc_mint", type: "pubkey" },
          { name: "liquidity_vault", type: "pubkey" },
          { name: "max_ltv_bps", type: "u16" },
          { name: "liquidation_threshold_bps", type: "u16" },
          { name: "protocol_fee_bps", type: "u16" },
          { name: "total_usdc_lent", type: "u64" },
          { name: "paused", type: "bool" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "UserLoanPosition",
      type: {
        kind: "struct",
        fields: [
          { name: "borrower", type: "pubkey" },
          { name: "merchant", type: "pubkey" },
          { name: "invoice_id", type: "u64" },
          { name: "collateral_mint", type: "pubkey" },
          { name: "collateral_locked", type: "u64" },
          { name: "debt_usdc_amount", type: "u64" },
          { name: "entry_price_usd", type: "u64" },
          { name: "created_at", type: "i64" },
          { name: "status", type: "u8" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "OraclePriceStale", msg: "Pyth oracle price is stale (> 60 seconds old)." },
    { code: 6001, name: "OracleConfidenceTooWide", msg: "Oracle confidence interval exceeds 2% of price." },
    { code: 6002, name: "LtvLimitExceeded", msg: "Requested borrow amount exceeds maximum LTV threshold (Max 50%)." },
    { code: 6003, name: "ProtocolPaused", msg: "ZeroSell Protocol operations are currently paused by admin." },
    { code: 6004, name: "MathOverflow", msg: "Math calculation overflow occurred." },
    { code: 6005, name: "InvalidRepaymentAmount", msg: "Invalid repayment amount specified." },
    { code: 6006, name: "PositionNotActive", msg: "User position is already repaid or liquidated." },
    { code: 6007, name: "PositionHealthy", msg: "Position is healthy and cannot be liquidated (LTV below threshold)." },
    { code: 6008, name: "InsufficientLiquidity", msg: "Protocol liquidity vault has insufficient USDC balance." },
    { code: 6009, name: "Unauthorized", msg: "Caller is not authorized to perform this operation." },
    { code: 6010, name: "InvalidInvoiceId", msg: "Invoice ID must be non-zero." },
  ],
};

export default IDL;
