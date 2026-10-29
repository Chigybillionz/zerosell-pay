import { Router, Request, Response } from "express";
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createActionHeaders,
} from "@solana/actions";
import { invoicesStore } from "./checkout.routes.js";
import { RelayerService } from "../services/relayer.service.js";
import { PythService, PYTH_FEED_IDS } from "../services/pyth.service.js";

const router = Router();
const actionHeaders = createActionHeaders({
  chainId: "devnet",
  actionVersion: "2.2.1",
});

/**
 * GET /actions.json
 * Action discovery manifest conforming to Solana Actions standard
 */
router.get("/actions.json", (_req: Request, res: Response) => {
  res.set(ACTIONS_CORS_HEADERS).json({
    rules: [
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  });
});

/**
 * OPTIONS /api/actions/pay/:invoiceId
 */
router.options("/actions/pay/:invoiceId", (_req: Request, res: Response) => {
  res.set(actionHeaders).status(200).end();
});

/**
 * GET /api/actions/pay/:invoiceId
 * Action metadata endpoint rendering the interactive Blink card
 */
router.get("/actions/pay/:invoiceId", async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.invoiceId);
    const invoice = invoicesStore.get(invoiceId) || {
      id: invoiceId,
      title: "Cloud GPU Compute Invoice",
      description: "Pay with ZeroSell to preserve your long-term crypto upside.",
      merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
      usdcAmount: 50.0,
      status: "pending",
      createdAt: Date.now(),
    };

    const { priceUsd } = await PythService.getLatestPrice(PYTH_FEED_IDS.SOL_USD);
    const estimatedSol = ((invoice.usdcAmount * 2) / priceUsd).toFixed(3);

    const payload: ActionGetResponse = {
      type: "action",
      icon: "https://raw.githubusercontent.com/solana-developers/solana-bounty-board/main/logo.png",
      title: `ZeroSell Pay: ${invoice.title} ($${invoice.usdcAmount.toFixed(2)} USDC)`,
      description: `Atomic Collateralized Payment: Lock ~${estimatedSol} SOL at 50% LTV ($${(invoice.usdcAmount * 2).toFixed(2)} value). Merchant receives $${invoice.usdcAmount} USDC instantly. Keep 100% of your SOL upside! Sponosored 0% gas.`,
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
  } catch (err: any) {
    res.set(actionHeaders).status(500).json({ error: err.message });
  }
});

/**
 * POST /api/actions/pay/:invoiceId
 * Builds the atomic LockAndPay transaction for the Blink signer
 */
router.post("/actions/pay/:invoiceId", async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.invoiceId);
    const { account } = req.body; // Public key of user clicking the Blink

    if (!account) {
      return res.set(actionHeaders).status(400).json({
        error: "Missing account in request body (borrower wallet)",
      });
    }

    const invoice = invoicesStore.get(invoiceId) || {
      id: invoiceId,
      title: "Cloud GPU Compute Invoice",
      description: "Pay with ZeroSell",
      merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
      usdcAmount: 50.0,
      status: "pending",
      createdAt: Date.now(),
    };

    const result = await RelayerService.buildLockAndPayTransaction({
      borrowerPubkey: account,
      merchantPubkey: invoice.merchantPubkey,
      usdcAmount: invoice.usdcAmount,
      invoiceId,
    });

    const responsePayload: ActionPostResponse = {
      type: "transaction",
      transaction: result.transactionBase64,
      message: `Locking ${(result.requiredCollateral).toFixed(3)} SOL in ZeroSell Vault. Disbursing $${result.merchantUsdcAmount} USDC to merchant instantly!`,
    };

    res.set(actionHeaders).json(responsePayload);
  } catch (err: any) {
    console.error("[actions post error]:", err);
    res.set(actionHeaders).status(500).json({ error: err.message });
  }
});

export default router;
