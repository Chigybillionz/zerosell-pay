import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createMint, createAccount, mintTo, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  ZEROSELL_PROGRAM_ID,
  getProtocolConfigPda,
  getLiquidityVaultPda,
} from "../packages/shared/src/index.js";

export interface TestContext {
  provider: anchor.AnchorProvider;
  authority: Keypair;
  borrower: Keypair;
  merchant: Keypair;
  treasury: Keypair;
  liquidator: Keypair;
  usdcMint: PublicKey;
  collateralMint: PublicKey;
  protocolConfigPda: PublicKey;
  liquidityVaultPda: PublicKey;
  funderUsdcAta: PublicKey;
  merchantUsdcAta: PublicKey;
  treasuryUsdcAta: PublicKey;
  borrowerUsdcAta: PublicKey;
  borrowerCollateralAta: PublicKey;
  liquidatorUsdcAta: PublicKey;
  liquidatorCollateralAta: PublicKey;
  isLiveRpcAvailable: boolean;
}

/**
 * DRY Test Setup Fixture: Initializes devnet accounts, mints, and token accounts once.
 * Seamlessly adapts to live funded RPC or offline instruction simulation mode.
 */
export async function setupTestContext(provider: anchor.AnchorProvider): Promise<TestContext> {
  const authority = (provider.wallet as any).payer as Keypair;
  const borrower = Keypair.generate();
  const merchant = Keypair.generate();
  const treasury = Keypair.generate();
  const liquidator = Keypair.generate();

  // Centralized PDA Derivations from @zerosell/shared
  const [protocolConfigPda] = getProtocolConfigPda(ZEROSELL_PROGRAM_ID);
  const [liquidityVaultPda] = getLiquidityVaultPda(ZEROSELL_PROGRAM_ID);

  let isLiveRpcAvailable = false;
  try {
    const bal = await provider.connection.getBalance(authority.publicKey);
    if (bal > 100_000_000) { // > 0.1 SOL
      isLiveRpcAvailable = true;
    }
  } catch {
    isLiveRpcAvailable = false;
  }

  if (isLiveRpcAvailable) {
    // Airdrop SOL to test actors (devnet faucet or local validator)
    try {
      await Promise.all([
        provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(borrower.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
        ),
        provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(merchant.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL)
        ),
        provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(liquidator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
        ),
      ]);
    } catch (airdropErr: any) {
      console.warn(
        `  [Notice] Faucet airdrop skipped (${airdropErr.message || "faucet unavailable"}). Using prefunded balances.`
      );
    }

    // Create Mock USDC mint (6 decimals)
    const usdcMint = await createMint(provider.connection, authority, authority.publicKey, null, 6);

    // Create Mock Collateral mint (e.g., SOL / wSOL - 9 decimals)
    const collateralMint = await createMint(provider.connection, authority, authority.publicKey, null, 9);

    // Create Associated Token Accounts
    const funderUsdcAta = await createAccount(provider.connection, authority, usdcMint, authority.publicKey);
    const merchantUsdcAta = await createAccount(provider.connection, authority, usdcMint, merchant.publicKey);
    const treasuryUsdcAta = await createAccount(provider.connection, authority, usdcMint, treasury.publicKey);
    const borrowerUsdcAta = await createAccount(provider.connection, authority, usdcMint, borrower.publicKey);
    const borrowerCollateralAta = await createAccount(provider.connection, authority, collateralMint, borrower.publicKey);
    const liquidatorUsdcAta = await createAccount(provider.connection, authority, usdcMint, liquidator.publicKey);
    const liquidatorCollateralAta = await createAccount(provider.connection, authority, collateralMint, liquidator.publicKey);

    // Mint test liquidity to funder (10,000 USDC)
    await mintTo(provider.connection, authority, usdcMint, funderUsdcAta, authority, 10_000_000_000);

    // Mint 5.0 SOL collateral to borrower
    await mintTo(provider.connection, authority, collateralMint, borrowerCollateralAta, authority, 5_000_000_000);

    // Mint some USDC to borrower to test repayment (200 USDC)
    await mintTo(provider.connection, authority, usdcMint, borrowerUsdcAta, authority, 200_000_000);

    // Mint USDC to liquidator (500 USDC)
    await mintTo(provider.connection, authority, usdcMint, liquidatorUsdcAta, authority, 500_000_000);

    return {
      provider,
      authority,
      borrower,
      merchant,
      treasury,
      liquidator,
      usdcMint,
      collateralMint,
      protocolConfigPda,
      liquidityVaultPda,
      funderUsdcAta,
      merchantUsdcAta,
      treasuryUsdcAta,
      borrowerUsdcAta,
      borrowerCollateralAta,
      liquidatorUsdcAta,
      liquidatorCollateralAta,
      isLiveRpcAvailable: true,
    };
  } else {
    console.log(
      "  [ZeroSell Test Runner] Running in Anchor Offline Simulation Mode (Authority has 0 SOL on devnet)."
    );
    const usdcMint = Keypair.generate().publicKey;
    const collateralMint = Keypair.generate().publicKey;

    const funderUsdcAta = getAssociatedTokenAddressSync(usdcMint, authority.publicKey, true);
    const merchantUsdcAta = getAssociatedTokenAddressSync(usdcMint, merchant.publicKey, true);
    const treasuryUsdcAta = getAssociatedTokenAddressSync(usdcMint, treasury.publicKey, true);
    const borrowerUsdcAta = getAssociatedTokenAddressSync(usdcMint, borrower.publicKey, true);
    const borrowerCollateralAta = getAssociatedTokenAddressSync(collateralMint, borrower.publicKey, true);
    const liquidatorUsdcAta = getAssociatedTokenAddressSync(usdcMint, liquidator.publicKey, true);
    const liquidatorCollateralAta = getAssociatedTokenAddressSync(collateralMint, liquidator.publicKey, true);

    return {
      provider,
      authority,
      borrower,
      merchant,
      treasury,
      liquidator,
      usdcMint,
      collateralMint,
      protocolConfigPda,
      liquidityVaultPda,
      funderUsdcAta,
      merchantUsdcAta,
      treasuryUsdcAta,
      borrowerUsdcAta,
      borrowerCollateralAta,
      liquidatorUsdcAta,
      liquidatorCollateralAta,
      isLiveRpcAvailable: false,
    };
  }
}

