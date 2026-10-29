import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

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

export const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || idl.address
);

// Load or generate Relayer Keypair for gasless transaction sponsorship
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

// Constants & Mints
export const USDC_MINT = new PublicKey(
  process.env.USDC_MINT || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
export const WSOL_MINT = new PublicKey(
  process.env.WSOL_MINT || "So11111111111111111111111111111111111111112"
);

// PDA Derivation Helpers
export function getGlobalPoolPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("global_pool")],
    PROGRAM_ID
  );
}

export function getUsdcVaultPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("usdc_vault")],
    PROGRAM_ID
  );
}

export function getUserPositionPda(borrower: PublicKey, invoiceId: number | bigint): [PublicKey, number] {
  const invBuf = Buffer.alloc(8);
  invBuf.writeBigUInt64LE(BigInt(invoiceId));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), borrower.toBuffer(), invBuf],
    PROGRAM_ID
  );
}

export function getCollateralVaultPda(borrower: PublicKey, invoiceId: number | bigint): [PublicKey, number] {
  const invBuf = Buffer.alloc(8);
  invBuf.writeBigUInt64LE(BigInt(invoiceId));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("collateral_vault"), borrower.toBuffer(), invBuf],
    PROGRAM_ID
  );
}
