import { Router, Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createActionHeaders,
} from "@solana/actions";
import { invoicesStore, Invoice } from "./checkout.routes.js";
import { RelayerService } from "../services/relayer.service.js";
import { PythService, PYTH_FEED_IDS } from "../services/pyth.service.js";

const router = Router();
const actionHeaders = createActionHeaders({
  chainId: "devnet",
  actionVersion: "2.2.1",
});

const isValidPubkey = (val: string): boolean => {
  try {
    new PublicKey(val);
    return true;
  } catch {
    return false;
  }
};

const BlinkPostSchema = z.object({
  account: z.string().refine(isValidPubkey, "Invalid borrower public key"),
});

/**
 * Resolves or generates fallback invoice metadata
 */
function resolveInvoice(invoiceId: number): Invoice {
  return (
    invoicesStore.get(invoiceId) || {
      id: invoiceId,
      title: "Cloud GPU Compute Invoice",
      description: "Pay with ZeroSell to preserve your long-term crypto upside.",
      merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
      usdcAmount: 50.0,
      status: "pending",
      createdAt: Date.now(),
    }
  );
}

/**
 * OPTIONS CORS pre-flight handlers
 */
router.options("/actions/pay/:invoiceId", (_req: Request, res: Response) => {
  res.set(actionHeaders).status(200).end();
});
router.options("/actions/checkout", (_req: Request, res: Response) => {
  res.set(actionHeaders).status(200).end();
});

/**
 * GET /api/actions/pay/:invoiceId
 */
router.get("/actions/pay/:invoiceId", async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.invoiceId);
    const invoice = resolveInvoice(invoiceId);

    const { priceUsd } = await PythService.getLatestPrice(PYTH_FEED_IDS.SOL_USD);
    const estimatedSol = ((invoice.usdcAmount * 2) / priceUsd).toFixed(3);

    const payload: ActionGetResponse = {
      type: "action",
      icon: "https://raw.githubusercontent.com/solana-developers/solana-bounty-board/main/logo.png",
      title: `ZeroSell Pay: ${invoice.title} ($${invoice.usdcAmount.toFixed(2)} USDC)`,
      description: `Atomic Collateralized Payment: Lock ~${estimatedSol} SOL at 50% LTV ($${(invoice.usdcAmount * 2).toFixed(2)} value). Merchant receives $${invoice.usdcAmount} USDC instantly. Keep 100% of your SOL upside! Sponsored gasless transaction.`,
      label: `Pay $${invoice.usdcAmount} USDC (ZeroSell)`,
      links: {
        actions: [
          {
            type: "transaction",
            label: `Pay $${invoice.usdcAmount} USDC (Lock ${estimatedSol} SOL)`,
            href: `/api/actions/pay/${invoiceId}`,
          },
        ],
      },
    };

    res.set(actionHeaders).json(payload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error handling action request";
    res.set(actionHeaders).status(500).json({ error: msg });
  }
});

/**
 * POST /api/actions/pay/:invoiceId
 */
router.post("/actions/pay/:invoiceId", async (req: Request, res: Response) => {
  const parseResult = BlinkPostSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.set(actionHeaders).status(400).json({
      error: parseResult.error.errors[0]?.message || "Missing or invalid account",
    });
  }

  try {
    const invoiceId = Number(req.params.invoiceId);
    const invoice = resolveInvoice(invoiceId);

    const result = await RelayerService.buildLockAndPayTransaction({
      borrowerPubkey: parseResult.data.account,
      merchantPubkey: invoice.merchantPubkey,
      usdcAmount: invoice.usdcAmount,
      invoiceId,
    });

    const responsePayload: ActionPostResponse = {
      type: "transaction",
      transaction: result.transactionBase64,
      message: `Locking ${result.requiredCollateral.toFixed(3)} SOL in ZeroSell Vault. Disbursing $${result.merchantUsdcAmount} USDC to merchant instantly!`,
    };

    return res.set(actionHeaders).json(responsePayload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error generating transaction";
    console.error("[actions post error]:", msg);
    return res.set(actionHeaders).status(500).json({ error: msg });
  }
});

/**
 * GET & POST aliases for general checkout
 */
router.get("/actions/checkout", async (_req: Request, res: Response) => {
  res.redirect("/api/actions/pay/984321");
});

router.post("/actions/checkout", async (req: Request, res: Response) => {
  req.params.invoiceId = "984321";
  const parseResult = BlinkPostSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.set(actionHeaders).status(400).json({
      error: parseResult.error.errors[0]?.message || "Missing account",
    });
  }
  const result = await RelayerService.buildLockAndPayTransaction({
    borrowerPubkey: parseResult.data.account,
    merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
    usdcAmount: 50.0,
    invoiceId: 984321,
  });
  return res.set(actionHeaders).json({
    type: "transaction",
    transaction: result.transactionBase64,
    message: "ZeroSell Checkout: 50 USDC payment sponsored by Gasless Relayer",
  });
});

export default router;
