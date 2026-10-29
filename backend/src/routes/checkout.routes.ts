import { Router, Request, Response } from "express";
import { RelayerService } from "../services/relayer.service.js";
import { PythService } from "../services/pyth.service.js";
import { webhookEmitter } from "./webhook.routes.js";

const router = Router();

// In-memory invoice store for demo storefront and merchant portal
export interface Invoice {
  id: number;
  title: string;
  description: string;
  merchantPubkey: string;
  usdcAmount: number;
  status: "pending" | "paid" | "expired";
  createdAt: number;
  paidAt?: number;
  signature?: string;
}

export const invoicesStore: Map<number, Invoice> = new Map([
  [
    984321,
    {
      id: 984321,
      title: "Cloud GPU Render Credits",
      description: "H100 GPU 48hr Cluster Compute Rental (ZeroSell Demo)",
      merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
      usdcAmount: 50.0,
      status: "pending",
      createdAt: Date.now() - 3600000,
    },
  ],
  [
    876543,
    {
      id: 876543,
      title: "Figma Pro Enterprise Annual",
      description: "Design team collaboration seat tier",
      merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
      usdcAmount: 120.0,
      status: "pending",
      createdAt: Date.now() - 1800000,
    },
  ],
]);

/**
 * GET /api/prices
 * Real-time Pyth Hermes price feeds for SOL, NVDAx, BTC, ETH
 */
router.get("/prices", async (_req: Request, res: Response) => {
  try {
    const prices = await PythService.getAllPrices();
    res.json({ success: true, prices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/checkout/create-invoice
 * Merchant creates a new invoice for ZeroSell Pay or Blinks
 */
router.post("/checkout/create-invoice", (req: Request, res: Response) => {
  try {
    const { title, description, merchantPubkey, usdcAmount } = req.body;
    if (!merchantPubkey || !usdcAmount) {
      return res.status(400).json({ error: "merchantPubkey and usdcAmount are required" });
    }

    const id = Math.floor(100000 + Math.random() * 900000);
    const newInvoice: Invoice = {
      id,
      title: title || `Invoice #${id}`,
      description: description || "ZeroSell Merchant Payment",
      merchantPubkey,
      usdcAmount: Number(usdcAmount),
      status: "pending",
      createdAt: Date.now(),
    };

    invoicesStore.set(id, newInvoice);
    res.json({ success: true, invoice: newInvoice });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/checkout/invoice/:id
 */
router.get("/checkout/invoice/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const invoice = invoicesStore.get(id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  res.json({ success: true, invoice });
});

/**
 * GET /api/checkout/invoices
 */
router.get("/checkout/invoices", (_req: Request, res: Response) => {
  res.json({ success: true, invoices: Array.from(invoicesStore.values()) });
});

/**
 * POST /api/checkout/build-tx
 * Constructs atomic lock_and_pay transaction sponsored by gasless relayer
 */
router.post("/checkout/build-tx", async (req: Request, res: Response) => {
  try {
    const { borrowerPubkey, merchantPubkey, usdcAmount, collateralMint, invoiceId } = req.body;

    if (!borrowerPubkey || !merchantPubkey || !usdcAmount) {
      return res.status(400).json({
        error: "Missing required parameters: borrowerPubkey, merchantPubkey, usdcAmount",
      });
    }

    const result = await RelayerService.buildLockAndPayTransaction({
      borrowerPubkey,
      merchantPubkey,
      usdcAmount: Number(usdcAmount),
      collateralMint,
      invoiceId: invoiceId ? Number(invoiceId) : undefined,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[build-tx error]:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/checkout/submit-tx
 * Submits the borrower-signed transaction to Solana Devnet and confirms it
 */
router.post("/checkout/submit-tx", async (req: Request, res: Response) => {
  try {
    const { signedTx, invoiceId } = req.body;
    if (!signedTx) {
      return res.status(400).json({ error: "signedTx is required" });
    }

    const result = await RelayerService.broadcastTransaction(signedTx);

    // If an invoiceId was provided, update invoice status and trigger event emitter
    if (invoiceId) {
      const inv = invoicesStore.get(Number(invoiceId));
      if (inv) {
        inv.status = "paid";
        inv.paidAt = Date.now();
        inv.signature = result.signature;
        invoicesStore.set(Number(invoiceId), inv);
      }
      webhookEmitter.emit("payment", {
        type: "LOCK_AND_PAY_CONFIRMED",
        invoiceId: Number(invoiceId),
        signature: result.signature,
        solscanUrl: result.solscanUrl,
        timestamp: Date.now(),
      });
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[submit-tx error]:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

