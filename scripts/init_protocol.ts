import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// 1. Program ID & Tokens
const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || "3TKiwrS9LNA3H2gnpfTVDyujP48PbCBo93w18q4ddZDv"
);
const DEVNET_USDC_MINT = new PublicKey(
  process.env.USDC_MINT || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

// 2. PDA Derivations
const PROTOCOL_CONFIG_SEED = Buffer.from("protocol_config");
const LIQUIDITY_VAULT_SEED = Buffer.from("liquidity_vault");

function getProtocolConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([PROTOCOL_CONFIG_SEED], PROGRAM_ID);
}

function getLiquidityVaultPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([LIQUIDITY_VAULT_SEED], PROGRAM_ID);
}

// 3. Load Keypair
function loadDeployerKeypair(): Keypair {
  if (process.env.DEPLOYER_KEYPAIR) {
    try {
      const raw = JSON.parse(process.env.DEPLOYER_KEYPAIR);
      return Keypair.fromSecretKey(Uint8Array.from(raw));
    } catch {
      // not json, try file
    }
  }

  const possiblePaths = [
    process.env.ANCHOR_WALLET,
    path.join(os.homedir(), ".config", "solana", "id.json"),
    path.join(process.cwd(), "deployer-keypair.json"),
    path.join(process.cwd(), "target", "deploy", "zerosell_vault-keypair.json"),
  ].filter(Boolean) as string[];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
      return Keypair.fromSecretKey(Uint8Array.from(raw));
    }
  }

  console.log("⚠️ No deployer keypair found. Generating ephemeral keypair...");
  return Keypair.generate();
}

// 4. Main Initialization Logic
async function main() {
  console.log("=======================================================");
  console.log("🚀 ZeroSell Pay - Smart Contract Protocol Initializer");
  console.log("=======================================================");
  console.log(`📡 Network: ${RPC_URL}`);
  console.log(`🔑 Program ID: ${PROGRAM_ID.toBase58()}`);

  const connection = new Connection(RPC_URL, "confirmed");
  const deployer = loadDeployerKeypair();
  console.log(`👤 Deployer Address: ${deployer.publicKey.toBase58()}`);

  const balance = await connection.getBalance(deployer.publicKey);
  console.log(`💰 Deployer Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

  // Verify Program is deployed on Devnet
  const programAccount = await connection.getAccountInfo(PROGRAM_ID);
  if (!programAccount) {
    console.error(`❌ Program ${PROGRAM_ID.toBase58()} is NOT deployed on Devnet yet!`);
    console.error(`👉 Run 'anchor build && anchor deploy' or trigger the GitHub Action first.`);
    process.exit(1);
  }
  console.log(`✅ Program Verified on Devnet (Executable: ${programAccount.executable})`);

  // Load IDL
  const idlPath = path.resolve(process.cwd(), "backend/src/idl/zerosell_vault.json");
  if (!fs.existsSync(idlPath)) {
    console.error(`❌ IDL file not found at ${idlPath}`);
    process.exit(1);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

  const provider = new AnchorProvider(connection, new Wallet(deployer), {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  const program = new Program(idl, provider);

  const [protocolConfigPda, configBump] = getProtocolConfigPda();
  const [liquidityVaultPda, vaultBump] = getLiquidityVaultPda();
  console.log(`📦 ProtocolConfig PDA: ${protocolConfigPda.toBase58()} (bump: ${configBump})`);
  console.log(`🏦 LiquidityVault PDA: ${liquidityVaultPda.toBase58()} (bump: ${vaultBump})`);

  // Check if Protocol is already initialized
  const configAccount = await connection.getAccountInfo(protocolConfigPda);
  if (configAccount) {
    console.log(`🎉 Protocol is ALREADY INITIALIZED on-chain!`);
    console.log(`🔗 Solscan Explorer: https://solscan.io/account/${protocolConfigPda.toBase58()}?cluster=devnet`);
    return;
  }

  console.log("⚡ Protocol not initialized yet. Submitting initialize_protocol transaction...");

  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.log("Requesting Devnet airdrop for deployment rent...");
    try {
      const airdropSig = await connection.requestAirdrop(deployer.publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSig, "confirmed");
      console.log("✅ Airdrop confirmed: 2 SOL");
    } catch (e: any) {
      console.warn("⚠️ Airdrop request failed (rate limit). Please fund wallet at https://faucet.solana.com");
    }
  }

  const maxLtvBps = 5000; // 50.0%
  const liquidationThresholdBps = 7500; // 75.0%
  const protocolFeeBps = 30; // 0.30%

  try {
    const tx = await (program.methods as any)
      .initializeProtocol(maxLtvBps, liquidationThresholdBps, protocolFeeBps)
      .accounts({
        admin: deployer.publicKey,
        treasury: deployer.publicKey,
        usdcMint: DEVNET_USDC_MINT,
        protocolConfig: protocolConfigPda,
        liquidityVault: liquidityVaultPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([deployer])
      .rpc();

    console.log("=======================================================");
    console.log("🎉 Protocol Successfully Initialized on Solana Devnet!");
    console.log(`Tx Signature: ${tx}`);
    console.log(`🔗 Transaction: https://solscan.io/tx/${tx}?cluster=devnet`);
    console.log(`🔗 ProtocolConfig: https://solscan.io/account/${protocolConfigPda.toBase58()}?cluster=devnet`);
    console.log(`🔗 LiquidityVault: https://solscan.io/account/${liquidityVaultPda.toBase58()}?cluster=devnet`);
    console.log("=======================================================");
  } catch (err: any) {
    console.error("❌ Initialization Failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
