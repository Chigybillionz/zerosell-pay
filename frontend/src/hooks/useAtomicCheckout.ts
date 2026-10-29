import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { z } from "zod";

export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:4000";

const isValidPubkey = (val: string): boolean => {
  try {
    new PublicKey(val);
    return true;
  } catch {
    return false;
  }
};

const CheckoutParamsSchema = z.object({
  merchantPubkey: z.string().refine(isValidPubkey, "Invalid merchant Solana address"),
  usdcAmount: z.number().positive("USDC amount must be greater than zero"),
  invoiceId: z.number().int().positive().optional(),
  collateralMint: z.string().refine(isValidPubkey, "Invalid collateral mint address").optional(),
});

export type CheckoutParams = z.infer<typeof CheckoutParamsSchema>;

export interface CheckoutResult {
  signature: string;
  solscanUrl: string;
  invoiceId: number;
  requiredCollateral: number;
}

export type CheckoutStep = "idle" | "building" | "simulating" | "signing" | "confirming" | "success" | "error";

export function useAtomicCheckout() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [step, setStep] = useState<CheckoutStep>("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Step 1: Requests Gasless Relayer to build and partially sign the transaction
   */
  const requestBuildTransaction = async (params: CheckoutParams, borrower: PublicKey) => {
    const response = await fetch(`${BACKEND_URL}/api/checkout/build-tx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        borrowerPubkey: borrower.toBase58(),
        merchantPubkey: params.merchantPubkey,
        usdcAmount: params.usdcAmount,
        invoiceId: params.invoiceId,
        collateralMint: params.collateralMint,
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.error || "Failed to build transaction with Relayer");
    }

    return await response.json();
  };

  /**
   * Step 2: Simulates the transaction on Devnet before prompting wallet signature
   */
  const simulateBeforeSign = async (transaction: Transaction) => {
    try {
      const simulation = await connection.simulateTransaction(transaction);
      if (simulation.value.err) {
        console.warn("[ZeroSell] Simulation warning:", simulation.value.err);
      }
    } catch (simErr) {
      console.warn("[ZeroSell] Non-blocking simulation warning:", simErr);
    }
  };

  /**
   * Step 3: Broadcasts borrower-signed transaction via Gasless Relayer
   */
  const broadcastViaRelayer = async (signedTxBase64: string, invoiceId: number) => {
    const response = await fetch(`${BACKEND_URL}/api/checkout/submit-tx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedTx: signedTxBase64, invoiceId }),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.error || "Relayer broadcast failed");
    }

    return await response.json();
  };

  /**
   * Executes atomic LockAndPay flow end-to-end
   */
  const executeCheckout = useCallback(
    async (params: CheckoutParams): Promise<CheckoutResult> => {
      const validation = CheckoutParamsSchema.safeParse(params);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Invalid checkout parameters");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Please connect your Solana wallet first");
      }

      setError(null);
      setStep("building");

      try {
        const buildData = await requestBuildTransaction(validation.data, publicKey);
        const txBuffer = Buffer.from(buildData.transactionBase64, "base64");
        const transaction = Transaction.from(txBuffer);

        setStep("simulating");
        await simulateBeforeSign(transaction);

        setStep("signing");
        const signedTx = await signTransaction(transaction);
        const signedBase64 = signedTx.serialize().toString("base64");

        setStep("confirming");
        const submitData = await broadcastViaRelayer(signedBase64, buildData.invoiceId);

        setStep("success");
        return {
          signature: submitData.signature,
          solscanUrl: submitData.solscanUrl,
          invoiceId: buildData.invoiceId,
          requiredCollateral: buildData.requiredCollateral,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Checkout transaction failed";
        setError(msg);
        setStep("error");
        throw new Error(msg);
      }
    },
    [publicKey, signTransaction, connection]
  );

  return {
    executeCheckout,
    step,
    error,
    reset: () => {
      setStep("idle");
      setError(null);
    },
  };
}
