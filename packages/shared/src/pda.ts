import { PublicKey } from "@solana/web3.js";
import {
  ZEROSELL_PROGRAM_ID,
  PROTOCOL_CONFIG_SEED_BUFFER,
  LIQUIDITY_VAULT_SEED_BUFFER,
  USER_POSITION_SEED_BUFFER,
  COLLATERAL_VAULT_SEED_BUFFER,
} from "./constants.js";

/**
 * Derives the global ProtocolConfig PDA
 */
export function getProtocolConfigPda(programId: PublicKey = ZEROSELL_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([PROTOCOL_CONFIG_SEED_BUFFER], programId);
}

/**
 * Derives the protocol USDC Liquidity Vault PDA
 */
export function getLiquidityVaultPda(programId: PublicKey = ZEROSELL_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([LIQUIDITY_VAULT_SEED_BUFFER], programId);
}

/**
 * Helper to serialize invoiceId as little-endian 64-bit Uint8Array
 */
export function getInvoiceBuffer(invoiceId: number | bigint): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigUint64(0, BigInt(invoiceId), true);
  return buf;
}

/**
 * Derives the UserLoanPosition PDA
 */
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

/**
 * Derives the isolated Collateral Vault PDA
 */
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

