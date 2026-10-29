import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { expect } from "chai";
import { setupTestContext, TestContext } from "./setup.js";
import {
  ZEROSELL_PROGRAM_ID,
  DEFAULT_MAX_LTV_BPS,
  DEFAULT_LIQUIDATION_THRESHOLD_BPS,
  DEFAULT_PROTOCOL_FEE_BPS,
  getUserLoanPositionPda,
  getCollateralVaultPda,
} from "../packages/shared/src/index.js";

describe("zerosell_vault protocol end-to-end tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = require("../packages/shared/src/idl/zerosell_vault.json");
  const program = new Program(idl, ZEROSELL_PROGRAM_ID, provider);

  let ctx: TestContext;
  const invoiceId = new anchor.BN(984321);
  const oraclePriceUsd = new anchor.BN(150_000_000); // $150.00 SOL in 10^6
  const oracleConfidenceUsd = new anchor.BN(1_500_000); // $1.50 confidence (1% of price <= 2%)
  const collateralAmount = new anchor.BN(1_000_000_000); // 1.0 SOL (9 decimals)
  const merchantUsdcAmount = new anchor.BN(50_000_000); // 50.00 USDC (6 decimals)

  before(async () => {
    ctx = await setupTestContext(provider);
  });

  it("1. Initializes Protocol Config & Liquidity Vault", async () => {
    const tx = await program.methods
      .initializeProtocol(
        DEFAULT_MAX_LTV_BPS,
        DEFAULT_LIQUIDATION_THRESHOLD_BPS,
        DEFAULT_PROTOCOL_FEE_BPS
      )
      .accounts({
        admin: ctx.authority.publicKey,
        treasury: ctx.treasury.publicKey,
        usdcMint: ctx.usdcMint,
        protocolConfig: ctx.protocolConfigPda,
        liquidityVault: ctx.liquidityVaultPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("initialize_protocol tx:", tx);

    const configAccount: any = await program.account.protocolConfig.fetch(ctx.protocolConfigPda);
    expect(configAccount.admin.toBase58()).to.equal(ctx.authority.publicKey.toBase58());
    expect(configAccount.maxLtvBps).to.equal(5000);
    expect(configAccount.protocolFeeBps).to.equal(30);
  });

  it("2. Funds liquidity vault with USDC", async () => {
    const fundAmount = new anchor.BN(5_000_000_000); // 5,000 USDC

    const tx = await program.methods
      .fundLiquidity(fundAmount)
      .accounts({
        funder: ctx.authority.publicKey,
        protocolConfig: ctx.protocolConfigPda,
        funderUsdcAta: ctx.funderUsdcAta,
        liquidityVault: ctx.liquidityVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("fund_liquidity tx:", tx);

    const vaultAccount = await getAccount(provider.connection, ctx.liquidityVaultPda);
    expect(Number(vaultAccount.amount)).to.equal(5_000_000_000);
  });

  it("3. Atomic Lock & Pay: locks collateral, routes 0.30% fee to treasury, and pays merchant USDC", async () => {
    const [userLoanPositionPda] = getUserLoanPositionPda(ctx.borrower.publicKey, invoiceId.toNumber());
    const [collateralVaultPda] = getCollateralVaultPda(ctx.borrower.publicKey, invoiceId.toNumber());
    const publishTime = new anchor.BN(Math.floor(Date.now() / 1000));

    const tx = await program.methods
      .lockCollateralAndPay(
        invoiceId,
        collateralAmount,
        merchantUsdcAmount,
        oraclePriceUsd,
        oracleConfidenceUsd,
        publishTime
      )
      .accounts({
        borrower: ctx.borrower.publicKey,
        merchant: ctx.merchant.publicKey,
        treasury: ctx.treasury.publicKey,
        protocolConfig: ctx.protocolConfigPda,
        userLoanPosition: userLoanPositionPda,
        collateralMint: ctx.collateralMint,
        borrowerCollateralAta: ctx.borrowerCollateralAta,
        collateralVault: collateralVaultPda,
        liquidityVault: ctx.liquidityVaultPda,
        merchantUsdcAta: ctx.merchantUsdcAta,
        treasuryUsdcAta: ctx.treasuryUsdcAta,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([ctx.borrower])
      .rpc();

    console.log("lock_collateral_and_pay tx:", tx);

    // Verify merchant received exact 50.00 USDC
    const merchantAta = await getAccount(provider.connection, ctx.merchantUsdcAta);
    expect(Number(merchantAta.amount)).to.equal(50_000_000);

    // Verify treasury received 0.30% protocol fee ($0.15 USDC)
    const treasuryAta = await getAccount(provider.connection, ctx.treasuryUsdcAta);
    expect(Number(treasuryAta.amount)).to.equal(150_000);

    // Verify collateral locked
    const collateralVault = await getAccount(provider.connection, collateralVaultPda);
    expect(Number(collateralVault.amount)).to.equal(1_000_000_000);
  });

  it("4. Adversarial Test: Reject borrow exceeding 50% max LTV", async () => {
    const invalidInvoiceId = new anchor.BN(112233);
    const [userLoanPositionPda] = getUserLoanPositionPda(ctx.borrower.publicKey, invalidInvoiceId.toNumber());
    const [collateralVaultPda] = getCollateralVaultPda(ctx.borrower.publicKey, invalidInvoiceId.toNumber());
    const publishTime = new anchor.BN(Math.floor(Date.now() / 1000));

    // Requesting $120 USDC borrow on 1 SOL ($150 value) = 80% LTV (exceeds 50% limit)
    const excessiveBorrow = new anchor.BN(120_000_000);

    try {
      await program.methods
        .lockCollateralAndPay(
          invalidInvoiceId,
          collateralAmount,
          excessiveBorrow,
          oraclePriceUsd,
          oracleConfidenceUsd,
          publishTime
        )
        .accounts({
          borrower: ctx.borrower.publicKey,
          merchant: ctx.merchant.publicKey,
          treasury: ctx.treasury.publicKey,
          protocolConfig: ctx.protocolConfigPda,
          userLoanPosition: userLoanPositionPda,
          collateralMint: ctx.collateralMint,
          borrowerCollateralAta: ctx.borrowerCollateralAta,
          collateralVault: collateralVaultPda,
          liquidityVault: ctx.liquidityVaultPda,
          merchantUsdcAta: ctx.merchantUsdcAta,
          treasuryUsdcAta: ctx.treasuryUsdcAta,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([ctx.borrower])
        .rpc();

      expect.fail("Should have thrown LtvLimitExceeded error");
    } catch (err: any) {
      expect(err.toString()).to.include("LtvLimitExceeded");
    }
  });

  it("5. Adversarial Test: Reject stale Pyth oracle price (> 60 seconds old)", async () => {
    const staleInvoiceId = new anchor.BN(445566);
    const [userLoanPositionPda] = getUserLoanPositionPda(ctx.borrower.publicKey, staleInvoiceId.toNumber());
    const [collateralVaultPda] = getCollateralVaultPda(ctx.borrower.publicKey, staleInvoiceId.toNumber());
    // Stale timestamp (120 seconds in the past)
    const stalePublishTime = new anchor.BN(Math.floor(Date.now() / 1000) - 120);

    try {
      await program.methods
        .lockCollateralAndPay(
          staleInvoiceId,
          collateralAmount,
          merchantUsdcAmount,
          oraclePriceUsd,
          oracleConfidenceUsd,
          stalePublishTime
        )
        .accounts({
          borrower: ctx.borrower.publicKey,
          merchant: ctx.merchant.publicKey,
          treasury: ctx.treasury.publicKey,
          protocolConfig: ctx.protocolConfigPda,
          userLoanPosition: userLoanPositionPda,
          collateralMint: ctx.collateralMint,
          borrowerCollateralAta: ctx.borrowerCollateralAta,
          collateralVault: collateralVaultPda,
          liquidityVault: ctx.liquidityVaultPda,
          merchantUsdcAta: ctx.merchantUsdcAta,
          treasuryUsdcAta: ctx.treasuryUsdcAta,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([ctx.borrower])
        .rpc();

      expect.fail("Should have thrown OraclePriceStale error");
    } catch (err: any) {
      expect(err.toString()).to.include("OraclePriceStale");
    }
  });

  it("6. Repays debt and unlocks collateral back to borrower", async () => {
    const [userLoanPositionPda] = getUserLoanPositionPda(ctx.borrower.publicKey, invoiceId.toNumber());
    const [collateralVaultPda] = getCollateralVaultPda(ctx.borrower.publicKey, invoiceId.toNumber());

    const borrowerCollateralBefore = await getAccount(provider.connection, ctx.borrowerCollateralAta);

    // Full repayment ($50.15 USDC debt)
    const fullRepayAmount = new anchor.BN(50_150_000);

    const tx = await program.methods
      .repayAndUnlock(invoiceId, fullRepayAmount)
      .accounts({
        borrower: ctx.borrower.publicKey,
        protocolConfig: ctx.protocolConfigPda,
        userLoanPosition: userLoanPositionPda,
        borrowerUsdcAta: ctx.borrowerUsdcAta,
        liquidityVault: ctx.liquidityVaultPda,
        borrowerCollateralAta: ctx.borrowerCollateralAta,
        collateralVault: collateralVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([ctx.borrower])
      .rpc();

    console.log("repay_and_unlock tx:", tx);

    const positionAccount: any = await program.account.userLoanPosition.fetch(userLoanPositionPda);
    expect(positionAccount.status).to.equal(1); // 1 = Repaid

    const borrowerCollateralAfter = await getAccount(provider.connection, ctx.borrowerCollateralAta);
    expect(Number(borrowerCollateralAfter.amount)).to.equal(
      Number(borrowerCollateralBefore.amount) + 1_000_000_000
    );
  });
});
