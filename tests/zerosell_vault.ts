import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";

describe("zerosell_vault protocol tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load IDL
  const idl = require("../frontend/src/idl/zerosell_vault.json");
  const programId = new PublicKey("3TKiwrS9LNA3H2gnpfTVDyujP48PbCBo93w18q4ddZDv");
  const program = new Program(idl, programId, provider);

  const authority = (provider.wallet as any).payer as Keypair;
  const merchant = Keypair.generate();
  const borrower = Keypair.generate();

  let usdcMint: PublicKey;
  let collateralMint: PublicKey;

  let globalPoolPda: PublicKey;
  let usdcVaultPda: PublicKey;

  let depositorUsdcAta: PublicKey;
  let merchantUsdcAta: PublicKey;
  let borrowerUsdcAta: PublicKey;
  let borrowerCollateralAta: PublicKey;

  const invoiceId = new anchor.BN(984321);
  const oraclePriceUsd = new anchor.BN(150_000_000); // $150.00 SOL price scaled by 10^6
  const collateralAmount = new anchor.BN(1_000_000_000); // 1.0 SOL (9 decimals)
  const merchantUsdcAmount = new anchor.BN(50_000_000); // 50.00 USDC (6 decimals)

  before(async () => {
    // Airdrop SOL to test actors
    const airdrop1 = await provider.connection.requestAirdrop(
      borrower.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop1);

    const airdrop2 = await provider.connection.requestAirdrop(
      merchant.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop2);

    // Create Mock USDC mint (6 decimals)
    usdcMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      6
    );

    // Create Mock Collateral mint (e.g., wSOL or NVDAx - 9 decimals)
    collateralMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9
    );

    // Derive Global PDAs
    [globalPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_pool")],
      program.programId
    );

    [usdcVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("usdc_vault")],
      program.programId
    );

    // Setup Token Accounts
    depositorUsdcAta = await createAccount(
      provider.connection,
      authority,
      usdcMint,
      authority.publicKey
    );

    merchantUsdcAta = await createAccount(
      provider.connection,
      authority,
      usdcMint,
      merchant.publicKey
    );

    borrowerUsdcAta = await createAccount(
      provider.connection,
      authority,
      usdcMint,
      borrower.publicKey
    );

    borrowerCollateralAta = await createAccount(
      provider.connection,
      authority,
      collateralMint,
      borrower.publicKey
    );

    // Mint test liquidity to LP / authority (10,000 USDC)
    await mintTo(
      provider.connection,
      authority,
      usdcMint,
      depositorUsdcAta,
      authority,
      10_000_000_000
    );

    // Mint 5.0 SOL collateral to borrower
    await mintTo(
      provider.connection,
      authority,
      collateralMint,
      borrowerCollateralAta,
      authority,
      5_000_000_000
    );

    // Mint some USDC to borrower to test repayment later (100 USDC)
    await mintTo(
      provider.connection,
      authority,
      usdcMint,
      borrowerUsdcAta,
      authority,
      100_000_000
    );
  });

  it("1. Initializes the GlobalPool & USDC Vault", async () => {
    const maxLtvBps = 5000; // 50.00%
    const liquidationThresholdBps = 7500; // 75.00%
    const originationFeeBps = 50; // 0.50%

    const tx = await program.methods
      .initializePool(maxLtvBps, liquidationThresholdBps, originationFeeBps)
      .accounts({
        authority: authority.publicKey,
        usdcMint,
        globalPool: globalPoolPda,
        usdcVault: usdcVaultPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("GlobalPool initialized with tx:", tx);

    const poolAccount: any = await program.account.globalPool.fetch(globalPoolPda);
    expect(poolAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(poolAccount.maxLtvBps).to.equal(5000);
    expect(poolAccount.originationFeeBps).to.equal(50);
  });

  it("2. Deposits USDC liquidity into the protocol vault", async () => {
    const depositAmount = new anchor.BN(5_000_000_000); // 5,000 USDC

    const tx = await program.methods
      .depositLiquidity(depositAmount)
      .accounts({
        depositor: authority.publicKey,
        globalPool: globalPoolPda,
        depositorUsdcAta,
        usdcVault: usdcVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Deposited liquidity with tx:", tx);

    const vaultAccount = await getAccount(provider.connection, usdcVaultPda);
    expect(Number(vaultAccount.amount)).to.equal(5_000_000_000);
  });

  it("3. Executes atomic LockAndPay: locks collateral and instantly disburses USDC to merchant", async () => {
    // Derive user position PDA
    const invoiceBuffer = invoiceId.toArrayLike(Buffer, "le", 8);
    const [userPositionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), borrower.publicKey.toBuffer(), invoiceBuffer],
      program.programId
    );

    // Derive collateral vault PDA
    const [collateralVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("collateral_vault"), borrower.publicKey.toBuffer(), invoiceBuffer],
      program.programId
    );

    const tx = await program.methods
      .lockAndPay(invoiceId, collateralAmount, merchantUsdcAmount, oraclePriceUsd)
      .accounts({
        borrower: borrower.publicKey,
        merchant: merchant.publicKey,
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
      .signers([borrower])
      .rpc();

    console.log("LockAndPay executed with tx:", tx);

    // Verify merchant received exact 50.00 USDC
    const merchantAtaInfo = await getAccount(provider.connection, merchantUsdcAta);
    expect(Number(merchantAtaInfo.amount)).to.equal(50_000_000);

    // Verify collateral is locked in collateral_vault
    const collateralVaultInfo = await getAccount(provider.connection, collateralVaultPda);
    expect(Number(collateralVaultInfo.amount)).to.equal(1_000_000_000);

    // Verify UserPosition record: debt = 50 USDC + 0.50% fee ($0.25) = $50.25 USDC
    const positionAccount: any = await program.account.userPosition.fetch(userPositionPda);
    expect(positionAccount.borrower.toBase58()).to.equal(borrower.publicKey.toBase58());
    expect(positionAccount.merchant.toBase58()).to.equal(merchant.publicKey.toBase58());
    expect(positionAccount.status).to.equal(0); // 0 = Active
    expect(Number(positionAccount.debtUsdcAmount)).to.equal(50_250_000);
  });

  it("4. Repays debt and unlocks collateral back to borrower", async () => {
    const invoiceBuffer = invoiceId.toArrayLike(Buffer, "le", 8);
    const [userPositionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), borrower.publicKey.toBuffer(), invoiceBuffer],
      program.programId
    );

    const [collateralVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("collateral_vault"), borrower.publicKey.toBuffer(), invoiceBuffer],
      program.programId
    );

    const borrowerCollateralBefore = await getAccount(
      provider.connection,
      borrowerCollateralAta
    );

    const tx = await program.methods
      .repayPosition(invoiceId)
      .accounts({
        borrower: borrower.publicKey,
        globalPool: globalPoolPda,
        userPosition: userPositionPda,
        borrowerUsdcAta,
        usdcVault: usdcVaultPda,
        borrowerCollateralAccount: borrowerCollateralAta,
        collateralVault: collateralVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([borrower])
      .rpc();

    console.log("RepayPosition executed with tx:", tx);

    // Verify position status updated to 1 (Repaid)
    const positionAccount: any = await program.account.userPosition.fetch(userPositionPda);
    expect(positionAccount.status).to.equal(1);

    // Verify collateral returned to borrower
    const borrowerCollateralAfter = await getAccount(
      provider.connection,
      borrowerCollateralAta
    );
    expect(Number(borrowerCollateralAfter.amount)).to.equal(
      Number(borrowerCollateralBefore.amount) + 1_000_000_000
    );
  });
});

