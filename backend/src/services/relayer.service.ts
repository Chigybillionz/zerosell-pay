import {
  Transaction,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import {
  connection,
  program,
  relayerKeypair,
  USDC_MINT,
  WSOL_MINT,
  getGlobalPoolPda,
  getUserPositionPda,
  getCollateralVaultPda,
  getUsdcVaultPda,
} from "../config/solana.js";
import { PythService, PYTH_FEED_IDS } from "./pyth.service.js";

export interface BuildTxParams {
  borrowerPubkey: string;
  merchantPubkey: string;
  usdcAmount: number; // e.g. 50.00
  collateralMint?: string;
  invoiceId?: number;
}

export class RelayerService {
  /**
   * Constructs an atomic, gasless LockAndPay transaction sponsored by the Relayer
   */
  public static async buildLockAndPayTransaction(params: BuildTxParams): Promise<{
    transactionBase64: string;
    invoiceId: number;
    requiredCollateral: number;
    collateralUnits: string;
    collateralValueUsd: number;
    merchantUsdcAmount: number;
    oraclePriceUsd: number;
    ltvPercent: number;
    feePayer: string;
  }> {
    const borrower = new PublicKey(params.borrowerPubkey);
    const merchant = new PublicKey(params.merchantPubkey);
    const collateralMint = params.collateralMint ? new PublicKey(params.collateralMint) : WSOL_MINT;
    const invoiceId = params.invoiceId || Math.floor(100000 + Math.random() * 900000);

    // Fetch live Pyth Oracle price
    const { priceUsd, scaledPrice } = await PythService.getLatestPrice(PYTH_FEED_IDS.SOL_USD);

    // Convert USDC amount to atomic units (6 decimals)
    const usdcDecimals = 6;
    const merchantAtomicUsdc = BigInt(Math.round(params.usdcAmount * Math.pow(10, usdcDecimals)));

    // Calculate required collateral for 50% LTV
    // CollateralValue = USDC * 2
    // CollateralUnits = (USDC * 2) / priceUsd
    const collateralDecimals = 9; // SOL decimals
    const requiredCollateralUnitsFloat = (params.usdcAmount * 2.0) / priceUsd;
    const collateralAtomicUnits = BigInt(
      Math.round(requiredCollateralUnitsFloat * Math.pow(10, collateralDecimals))
    );

    // PDAs
    const [globalPoolPda] = getGlobalPoolPda();
    const [usdcVaultPda] = getUsdcVaultPda();
    const [userPositionPda] = getUserPositionPda(borrower, invoiceId);
    const [collateralVaultPda] = getCollateralVaultPda(borrower, invoiceId);

    // Token ATAs
    const borrowerCollateralAta = getAssociatedTokenAddressSync(collateralMint, borrower);
    const merchantUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, merchant);

    // Transaction
    const transaction = new Transaction();

    // 1. Ensure merchant USDC ATA exists (relayer pays rent for merchant ATA if needed!)
    const createMerchantAtaIx = createAssociatedTokenAccountIdempotentInstruction(
      relayerKeypair.publicKey, // Relayer sponsors the ATA creation!
      merchantUsdcAta,
      merchant,
      USDC_MINT
    );
    transaction.add(createMerchantAtaIx);

    // 2. Build program instruction lock_and_pay
    const lockAndPayIx = await (program as any).methods
      .lockAndPay(
        new anchor.BN(invoiceId),
        new anchor.BN(collateralAtomicUnits.toString()),
        new anchor.BN(merchantAtomicUsdc.toString()),
        new anchor.BN(scaledPrice.toString())
      )
      .accounts({
        borrower,
        merchant,
        globalPool: globalPoolPda,
        userPosition: userPositionPda,
        collateralMint,
        borrowerCollateralAccount: borrowerCollateralAta,
        collateralVault: collateralVaultPda,
        usdcVault: usdcVaultPda,
        merchantUsdcAta,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .instruction();

    transaction.add(lockAndPayIx);

    // Set Relayer as feePayer for 100% gasless transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = relayerKeypair.publicKey;

    // Relayer partially signs as feePayer
    transaction.partialSign(relayerKeypair);

    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      transactionBase64: serialized.toString("base64"),
      invoiceId,
      requiredCollateral: requiredCollateralUnitsFloat,
      collateralUnits: collateralAtomicUnits.toString(),
      collateralValueUsd: params.usdcAmount * 2.0,
      merchantUsdcAmount: params.usdcAmount,
      oraclePriceUsd: priceUsd,
      ltvPercent: 50.0,
      feePayer: relayerKeypair.publicKey.toBase58(),
    };
  }

  /**
   * Broadcasts a fully-signed transaction to Devnet
   */
  public static async broadcastTransaction(base64Tx: string): Promise<{
    signature: string;
    confirmed: boolean;
    solscanUrl: string;
  }> {
    const txBuffer = Buffer.from(base64Tx, "base64");
    const transaction = Transaction.from(txBuffer);

    // If relayer signature is missing for any reason, sign as feePayer
    const hasRelayerSignature = transaction.signatures.some(
      (sig) => sig.publicKey.equals(relayerKeypair.publicKey) && sig.signature !== null
    );
    if (!hasRelayerSignature) {
      transaction.partialSign(relayerKeypair);
    }

    const rawTx = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: transaction.recentBlockhash!,
        lastValidBlockHeight: transaction.lastValidBlockHeight!,
      },
      "confirmed"
    );

    return {
      signature,
      confirmed: !confirmation.value.err,
      solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    };
  }
}
