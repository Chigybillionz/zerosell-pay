import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ==========================================
// 1. Program ID & Network
// ==========================================
export const ZEROSELL_PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || "3TKiwrS9LNA3H2gnpfTVDyujP48PbCBo93w18q4ddZDv"
);

export const DEVNET_USDC_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

// ==========================================
// 2. PDA Seeds & Buffers
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
// 3. PDA Derivation Functions
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
// 4. IDL Loading
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const idlPathInDist = path.resolve(__dirname, "../idl/zerosell_vault.json");
const idlPathInSrc = path.resolve(__dirname, "../../src/idl/zerosell_vault.json");
const targetIdlPath = fs.existsSync(idlPathInSrc) ? idlPathInSrc : idlPathInDist;
export const idl = JSON.parse(fs.readFileSync(targetIdlPath, "utf-8"));

export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
export const connection = new Connection(SOLANA_RPC_URL, {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000,
});

export const PROGRAM_ID = ZEROSELL_PROGRAM_ID;

// ==========================================
// 5. Relayer Keypair (Gasless Sponsor)
// ==========================================
export let relayerKeypair: Keypair;
try {
  if (process.env.RELAYER_KEYPAIR) {
    const raw = JSON.parse(process.env.RELAYER_KEYPAIR);
    relayerKeypair = Keypair.fromSecretKey(Uint8Array.from(raw));
  } else {
    relayerKeypair = Keypair.generate();
    console.warn("Generated temporary ephemeral Relayer Keypair:", relayerKeypair.publicKey.toBase58());
  }
} catch (e) {
  console.warn("Failed to parse RELAYER_KEYPAIR, generating fallback keypair:", e);
  relayerKeypair = Keypair.generate();
}

console.log("ZeroSell Gasless Relayer Address:", relayerKeypair.publicKey.toBase58());

// Anchor Provider & Program
export const relayerWallet = new Wallet(relayerKeypair);
export const provider = new AnchorProvider(connection, relayerWallet, {
  commitment: "confirmed",
  preflightCommitment: "confirmed",
});

export const program = new Program(idl, provider);

// Token Mints
export const USDC_MINT = process.env.USDC_MINT ? new PublicKey(process.env.USDC_MINT) : DEVNET_USDC_MINT;
export const WSOL_MINT = process.env.WSOL_MINT ? new PublicKey(process.env.WSOL_MINT) : WRAPPED_SOL_MINT;
