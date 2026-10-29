import { describe, it } from "node:test";
import assert from "node:assert";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  ZEROSELL_PROGRAM_ID,
  DEFAULT_MAX_LTV_BPS,
  DEFAULT_LIQUIDATION_THRESHOLD_BPS,
  DEFAULT_PROTOCOL_FEE_BPS,
  LIQUIDATION_BONUS_BPS,
  BPS_DIVISOR,
  MAX_ORACLE_STALENESS_SECONDS,
  MAX_ORACLE_CONFIDENCE_PERCENT,
  getProtocolConfigPda,
  getLiquidityVaultPda,
  getUserLoanPositionPda,
  getCollateralVaultPda,
  IDL,
} from "../packages/shared/src/index.js";

describe("ZeroSell Pay Protocol Security & Mathematical Guardrails", () => {
  const dummyBorrower = Keypair.generate().publicKey;
  const invoiceId = 984321;

  // =========================================================================
  // 1. PDA Derivations
  // =========================================================================
  describe("PDA Derivations", () => {
    it("derives deterministic Protocol Config PDA", () => {
      const [pda, bump] = getProtocolConfigPda(ZEROSELL_PROGRAM_ID);
      assert.ok(PublicKey.isOnCurve(pda.toBytes()) === false, "PDA must be off-curve");
      assert.ok(bump >= 0 && bump <= 255, "Bump must be valid u8");
    });

    it("derives deterministic Liquidity Vault PDA", () => {
      const [pda, bump] = getLiquidityVaultPda(ZEROSELL_PROGRAM_ID);
      assert.ok(PublicKey.isOnCurve(pda.toBytes()) === false, "PDA must be off-curve");
      assert.ok(bump >= 0 && bump <= 255, "Bump must be valid u8");
    });

    it("derives unique User Loan Position PDA per invoice and borrower", () => {
      const [pda1] = getUserLoanPositionPda(dummyBorrower, invoiceId);
      const [pda2] = getUserLoanPositionPda(dummyBorrower, invoiceId + 1);
      const otherBorrower = Keypair.generate().publicKey;
      const [pda3] = getUserLoanPositionPda(otherBorrower, invoiceId);

      assert.notStrictEqual(pda1.toBase58(), pda2.toBase58(), "Different invoices must have distinct PDAs");
      assert.notStrictEqual(pda1.toBase58(), pda3.toBase58(), "Different borrowers must have distinct PDAs");
    });

    it("derives unique Collateral Vault PDA per invoice and borrower", () => {
      const [vaultPda, bump] = getCollateralVaultPda(dummyBorrower, invoiceId);
      assert.ok(vaultPda instanceof PublicKey);
      assert.ok(bump >= 0 && bump <= 255);
    });
  });

  // =========================================================================
  // 2. LTV & Collateral Calculations
  // =========================================================================
  describe("LTV & Collateral Calculations", () => {
    const solPriceUsd = 150.0; // $150.00
    const solCollateral = 1.0; // 1.0 SOL

    it("calculates max borrow amount at 50% LTV", () => {
      const collateralValueUsd = solCollateral * solPriceUsd; // $150
      const maxBorrowUsd = (collateralValueUsd * DEFAULT_MAX_LTV_BPS) / BPS_DIVISOR;
      assert.strictEqual(maxBorrowUsd, 75.0, "1 SOL ($150) at 50% LTV must permit max $75 USDC borrow");
    });

    it("calculates required collateral for a $50 USDC invoice at 50% LTV", () => {
      const invoiceUsdc = 50.0;
      // required_value = invoice / 0.50 = 100 USD. At $150/SOL = 100/150 = 0.666667 SOL
      const requiredValueUsd = (invoiceUsdc * BPS_DIVISOR) / DEFAULT_MAX_LTV_BPS;
      const requiredSol = requiredValueUsd / solPriceUsd;
      assert.strictEqual(requiredValueUsd, 100.0);
      assert.ok(Math.abs(requiredSol - 0.6666666666666666) < 1e-9);
    });

    it("detects and rejects over-leveraged borrow requests (> 50% LTV)", () => {
      const requestedBorrowUsd = 80.0; // Greater than 75 USD max
      const collateralValueUsd = solCollateral * solPriceUsd;
      const currentLtvBps = (requestedBorrowUsd / collateralValueUsd) * BPS_DIVISOR;
      const isLtvAllowed = currentLtvBps <= DEFAULT_MAX_LTV_BPS;
      assert.strictEqual(isLtvAllowed, false, "Borrow exceeding 50% LTV must be flagged invalid");
    });
  });

  // =========================================================================
  // 3. Protocol Fee Calculation (30 bps)
  // =========================================================================
  describe("Protocol Fee Invariants", () => {
    it("calculates exact 0.30% fee on merchant payout", () => {
      const merchantUsdc = 50_000_000n; // 50.00 USDC in 10^6
      const feeBps = BigInt(DEFAULT_PROTOCOL_FEE_BPS); // 30
      const divisor = BigInt(BPS_DIVISOR); // 10000

      const fee = (merchantUsdc * feeBps) / divisor;
      const totalDebt = merchantUsdc + fee;

      assert.strictEqual(fee, 150_000n, "0.30% of $50 is $0.15 USDC (150,000 units)");
      assert.strictEqual(totalDebt, 50_150_000n, "Total debt recorded is 50.15 USDC");
    });
  });

  // =========================================================================
  // 4. Pyth Oracle Guardrails
  // =========================================================================
  describe("Pyth Oracle Guardrails", () => {
    it("accepts fresh oracle price published within 60 seconds", () => {
      const now = Math.floor(Date.now() / 1000);
      const publishTime = now - 15; // 15 seconds old
      const isStale = now - publishTime > MAX_ORACLE_STALENESS_SECONDS;
      assert.strictEqual(isStale, false, "Price under 60 seconds old must be accepted");
    });

    it("rejects stale oracle price published over 60 seconds ago", () => {
      const now = Math.floor(Date.now() / 1000);
      const publishTime = now - 65; // 65 seconds old
      const isStale = now - publishTime > MAX_ORACLE_STALENESS_SECONDS;
      assert.strictEqual(isStale, true, "Price older than 60 seconds must be rejected");
    });

    it("accepts price when confidence interval is within 2% threshold", () => {
      const price = 150_000_000n; // $150.00
      const confidence = 1_500_000n; // $1.50 (1.0% <= 2.0%)
      const confidencePercent = (Number(confidence) / Number(price)) * 100;
      assert.ok(confidencePercent <= MAX_ORACLE_CONFIDENCE_PERCENT);
    });

    it("rejects price when confidence interval exceeds 2% threshold", () => {
      const price = 150_000_000n; // $150.00
      const wideConfidence = 4_500_000n; // $4.50 (3.0% > 2.0%)
      const confidencePercent = (Number(wideConfidence) / Number(price)) * 100;
      assert.ok(confidencePercent > MAX_ORACLE_CONFIDENCE_PERCENT);
    });
  });

  // =========================================================================
  // 5. Liquidation Mechanics
  // =========================================================================
  describe("Liquidation Mechanics (75% Threshold & 5% Bonus)", () => {
    it("flags position as healthy above liquidation threshold", () => {
      const collateralValueUsd = 100.0;
      const debtUsdc = 50.15;
      const currentHealthRatioBps = (debtUsdc / collateralValueUsd) * BPS_DIVISOR;
      const isLiquidatable = currentHealthRatioBps >= DEFAULT_LIQUIDATION_THRESHOLD_BPS;
      assert.strictEqual(isLiquidatable, false, "50.15% debt ratio is well below 75% liquidation threshold");
    });

    it("flags position as liquidatable when price drops below 75% threshold", () => {
      // If collateral value crashes to $60, debt $50.15 represents 83.58% LTV
      const crashedCollateralUsd = 60.0;
      const debtUsdc = 50.15;
      const currentHealthRatioBps = (debtUsdc / crashedCollateralUsd) * BPS_DIVISOR;
      const isLiquidatable = currentHealthRatioBps >= DEFAULT_LIQUIDATION_THRESHOLD_BPS;
      assert.strictEqual(isLiquidatable, true, "83.58% debt ratio must trigger liquidation");
    });

    it("awards 5% liquidation bonus to liquidators", () => {
      const debtRepaid = 50_000_000n;
      const bonusBps = BigInt(LIQUIDATION_BONUS_BPS); // 500 = 5%
      const bonusAmount = (debtRepaid * bonusBps) / BigInt(BPS_DIVISOR);
      assert.strictEqual(bonusAmount, 2_500_000n, "5% bonus on 50 USDC is 2.50 USDC equivalent");
    });
  });

  // =========================================================================
  // 6. IDL Completeness & Program ID
  // =========================================================================
  describe("Anchor IDL Integrity", () => {
    it("declares zerosell_vault program ID and all 5 instructions", () => {
      assert.strictEqual(IDL.metadata.name, "zerosell_vault");
      assert.strictEqual(IDL.address, ZEROSELL_PROGRAM_ID.toBase58());
      const instructionNames = IDL.instructions.map((ix: any) => ix.name);
      assert.ok(instructionNames.includes("initialize_protocol"));
      assert.ok(instructionNames.includes("fund_liquidity"));
      assert.ok(instructionNames.includes("lock_collateral_and_pay"));
      assert.ok(instructionNames.includes("repay_and_unlock"));
      assert.ok(instructionNames.includes("liquidate_or_settle"));
    });
  });
});
