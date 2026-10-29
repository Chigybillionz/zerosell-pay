import {
  Transaction,
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  ComputeBudgetProgram,
  TransactionInstruction,
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
  PROGRAM_ID,
  relayerKeypair,
  USDC_MINT,
  WSOL_MINT,
  getProtocolConfigPda,
  getUserLoanPositionPda,
  getCollateralVaultPda,
  getLiquidityVaultPda,
} from "../config/solana.js";
import { PythService, PYTH_FEED_IDS } from "./pyth.service.js";

export interface BuildLockAndPayOptions {
  borrowerPubkey: string;
  merchantPubkey: string;
  usdcAmount: number;
  collateralMint?: string;
  invoiceId?: number;
}

export interface BuildLockAndPayResult {
  transactionBase64: string;
  invoiceId: number;
  requiredCollateral: number;
  collateralUnits: string;
  collateralValueUsd: number;
  merchantUsdcAmount: number;
  oraclePriceUsd: number;
  ltvPercent: number;
  feePayer: string;
}

export class TransactionBuilderService {
  /**
   * Builds compute budget instructions for fast Devnet inclusion
   */
  public static createComputeBudgetInstructions(): TransactionInstruction[] {
    return [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }),
    ];
  }

  /**
   * Calculates required collateral for a target 50% LTV borrow
   */
  public static calculateCollateral(usdcAmount: number, priceUsd: number, decimals: number = 9): {
    requiredCollateralFloat: number;
    collateralAtomicUnits: bigint;
  } {
    const requiredCollateralFloat = (usdcAmount * 2.0) / priceUsd;
    const collateralAtomicUnits = BigInt(
      Math.round(requiredCollateralFloat * Math.pow(10, decimals))
    );
    return { requiredCollateralFloat, collateralAtomicUnits };
  }

  /**
   * Prepares rent grant instruction if borrower has insufficient native SOL for account rent
   * Only adds transfer if relayer has sufficient balance to fund it.
   */
  public static async createRentGrantInstructionIfNeeded(
    borrower: PublicKey,
    minLamportsNeeded: number = 5_000_000
  ): Promise<TransactionInstruction | null> {
    try {
      const [borrowerBalance, relayerBalance] = await Promise.all([
        connection.getBalance(borrower),
        connection.getBalance(relayerKeypair.publicKey),
      ]);
      if (borrowerBalance < minLamportsNeeded && relayerBalance >= minLamportsNeeded) {
        return SystemProgram.transfer({
          fromPubkey: relayerKeypair.publicKey,
          toPubkey: borrower,
          lamports: minLamportsNeeded - borrowerBalance,
        });
      }
    } catch (e) {
      console.warn("[RentGrant] Balance check fallback:", e);
    }
    return null;
  }

  /**
   * Resolves the protocol treasury address from on-chain config or relayer fallback
   */
  public static async getTreasuryPubkey(): Promise<PublicKey> {
    try {
      const [configPda] = getProtocolConfigPda();
      const configAccount = await (program.account as Record<string, { fetch: (pda: PublicKey) => Promise<{ treasury: PublicKey }> }>).protocolConfig.fetch(configPda);
      if (configAccount && configAccount.treasury && !configAccount.treasury.equals(PROGRAM_ID)) {
        return configAccount.treasury;
      }
    } catch {
      // Fallback to relayer keypair during initial bootstrap
    }
    if (!relayerKeypair.publicKey.equals(PROGRAM_ID)) {
      return relayerKeypair.publicKey;
    }
    return Keypair.generate().publicKey;
  }

  /**
   * Constructs the full lock_collateral_and_pay instruction
   */
  public static async createLockAndPayInstruction(
    borrower: PublicKey,
    merchant: PublicKey,
    treasury: PublicKey,
    collateralMint: PublicKey,
    invoiceId: number,
    collateralAtomicUnits: bigint,
    merchantAtomicUsdc: bigint,
    scaledPrice: bigint,
    scaledConfidence: bigint,
    publishTime: number
  ): Promise<TransactionInstruction> {
    const [protocolConfigPda] = getProtocolConfigPda();
    const [liquidityVaultPda] = getLiquidityVaultPda();
    const [userLoanPositionPda] = getUserLoanPositionPda(borrower, invoiceId);
    const [collateralVaultPda] = getCollateralVaultPda(borrower, invoiceId);

    const borrowerCollateralAta = getAssociatedTokenAddressSync(collateralMint, borrower, true);
    const merchantUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, merchant, true);
    const treasuryUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, treasury, true);

    const programAny = program as any;

    return await programAny.methods
      .lockCollateralAndPay(
        new anchor.BN(invoiceId),
        new anchor.BN(collateralAtomicUnits.toString()),
        new anchor.BN(merchantAtomicUsdc.toString()),
        new anchor.BN(scaledPrice.toString()),
        new anchor.BN(scaledConfidence.toString()),
        new anchor.BN(publishTime)
      )
      .accounts({
        borrower,
        merchant,
        treasury,
        protocolConfig: protocolConfigPda,
        userLoanPosition: userLoanPositionPda,
        collateralMint,
        borrowerCollateralAta,
        collateralVault: collateralVaultPda,
        liquidityVault: liquidityVaultPda,
        merchantUsdcAta,
        treasuryUsdcAta,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .instruction();
  }

  /**
   * Main orchestrator: builds, partially signs, and serializes the gasless transaction
   */
  public static async buildLockAndPayTx(
    options: BuildLockAndPayOptions
  ): Promise<BuildLockAndPayResult> {
    const borrower = new PublicKey(options.borrowerPubkey);
    const merchant = new PublicKey(options.merchantPubkey);
    const collateralMint = options.collateralMint ? new PublicKey(options.collateralMint) : WSOL_MINT;
    const invoiceId = options.invoiceId || Math.floor(100000 + Math.random() * 900000);

    const { priceUsd, scaledPrice, confidence, publishTime } = await PythService.getLatestPrice(
      PYTH_FEED_IDS.SOL_USD
    );

    const merchantAtomicUsdc = BigInt(Math.round(options.usdcAmount * 1_000_000));
    const { requiredCollateralFloat, collateralAtomicUnits } = this.calculateCollateral(
      options.usdcAmount,
      priceUsd
    );

    const treasury = await this.getTreasuryPubkey();
    const transaction = new Transaction();

    // 1. Add compute budget
    this.createComputeBudgetInstructions().forEach((ix) => transaction.add(ix));

    // Check if the Anchor on-chain program is deployed on the cluster
    let isProgramDeployed = false;
    try {
      const progInfo = await connection.getAccountInfo(PROGRAM_ID);
      isProgramDeployed = progInfo !== null && progInfo.executable;
    } catch {
      isProgramDeployed = false;
    }

    // Check if relayer has sufficient balance to sponsor transaction fees
    let isRelayerFunded = false;
    try {
      const relayerBal = await connection.getBalance(relayerKeypair.publicKey);
      isRelayerFunded = relayerBal >= 10_000;
    } catch {
      isRelayerFunded = false;
    }

    const effectiveFeePayer = isRelayerFunded ? relayerKeypair.publicKey : borrower;

    if (isProgramDeployed) {
      // 2. Prepend rent grant if user has 0 SOL (and relayer is funded)
      const rentGrantIx = await this.createRentGrantInstructionIfNeeded(borrower);
      if (rentGrantIx) transaction.add(rentGrantIx);

      // 3. Ensure merchant and treasury ATAs exist (sponsored by feePayer)
      const merchantUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, merchant, true);
      const treasuryUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, treasury, true);
      transaction.add(
        createAssociatedTokenAccountIdempotentInstruction(effectiveFeePayer, merchantUsdcAta, merchant, USDC_MINT),
        createAssociatedTokenAccountIdempotentInstruction(effectiveFeePayer, treasuryUsdcAta, treasury, USDC_MINT)
      );

      // 4. Program lock_collateral_and_pay instruction
      const scaledConfidence = BigInt(Math.round(confidence * 1_000_000));
      const lockIx = await this.createLockAndPayInstruction(
        borrower,
        merchant,
        treasury,
        collateralMint,
        invoiceId,
        collateralAtomicUnits,
        merchantAtomicUsdc,
        scaledPrice,
        scaledConfidence,
        publishTime
      );
      transaction.add(lockIx);
    } else {
      // Demo / Showcase Mode: Valid on-chain transaction with Solana Memo Program
      const memoPayload = JSON.stringify({
        protocol: "ZeroSell Pay",
        action: "LOCK_COLLATERAL_AND_PAY",
        invoiceId,
        merchant: merchant.toBase58(),
        usdcAmount: options.usdcAmount,
        requiredCollateralSol: requiredCollateralFloat,
        ltvPercent: 50.0,
        oraclePriceUsd: priceUsd,
      });

      transaction.add(
        new TransactionInstruction({
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
          keys: [{ pubkey: borrower, isSigner: true, isWritable: true }],
          data: Buffer.from(memoPayload),
        })
      );
    }

    // 5. Fee-payer & blockhash setup
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = effectiveFeePayer;

    if (isRelayerFunded) {
      transaction.partialSign(relayerKeypair);
    }

    const serialized = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });

    return {
      transactionBase64: serialized.toString("base64"),
      invoiceId,
      requiredCollateral: requiredCollateralFloat,
      collateralUnits: collateralAtomicUnits.toString(),
      collateralValueUsd: options.usdcAmount * 2.0,
      merchantUsdcAmount: options.usdcAmount,
      oraclePriceUsd: priceUsd,
      ltvPercent: 50.0,
      feePayer: effectiveFeePayer.toBase58(),
    };
  }
}
