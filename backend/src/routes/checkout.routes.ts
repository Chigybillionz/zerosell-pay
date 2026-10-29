import { Router, Request, Response, RequestHandler } from "express";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { RelayerService } from "../services/relayer.service.js";
import { PythService } from "../services/pyth.service.js";
import { webhookEmitter } from "./webhook.routes.js";

const router = Router();

// Rate limiter: 100 requests per 15 minutes to prevent spam/abuse
const checkoutLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many checkout requests, please try again later." },
}) as unknown as RequestHandler;

// Zod Validation Schemas
const isValidPubkey = (val: string): boolean => {
  try {
    new PublicKey(val);
    return true;
  } catch {
    return false;
  }
};

const CreateInvoiceSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(255).optional(),
  merchantPubkey: z.string().refine(isValidPubkey, "Invalid Solana merchant public key"),
  usdcAmount: z.number().positive("USDC amount must be greater than 0"),
});

const BuildTxSchema = z.object({
  borrowerPubkey: z.string().refine(isValidPubkey, "Invalid Solana borrower public key"),
  merchantPubkey: z.string().refine(isValidPubkey, "Invalid Solana merchant public key"),
  usdcAmount: z.number().positive("USDC amount must be greater than 0"),
  collateralMint: z.string().refine(isValidPubkey, "Invalid collateral mint address").optional(),
  invoiceId: z.number().int().positive().optional(),
});

const SubmitTxSchema = z.object({
  signedTx: z.string().min(10, "Base64 signed transaction string required"),
  invoiceId: z.number().int().positive().optional(),
});

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
 */
router.get("/prices", async (_req: Request, res: Response) => {
  try {
    const prices = await PythService.getAllPrices();
    res.json({ success: true, prices });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching prices";
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * POST /api/checkout/create-invoice
 */
router.post("/checkout/create-invoice", checkoutLimiter, (req: Request, res: Response) => {
  const parseResult = CreateInvoiceSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0]?.message || "Invalid payload" });
  }

  const { title, description, merchantPubkey, usdcAmount } = parseResult.data;
  const id = Math.floor(100000 + Math.random() * 900000);
  const newInvoice: Invoice = {
    id,
    title: title || `Invoice #${id}`,
    description: description || "ZeroSell Merchant Payment",
    merchantPubkey,
    usdcAmount,
    status: "pending",
    createdAt: Date.now(),
  };

  invoicesStore.set(id, newInvoice);
  return res.json({ success: true, invoice: newInvoice });
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
  return res.json({ success: true, invoice });
});

/**
 * GET /api/checkout/invoices
 */
router.get("/checkout/invoices", (_req: Request, res: Response) => {
  res.json({ success: true, invoices: Array.from(invoicesStore.values()) });
});

/**
 * POST /api/checkout/build-tx
 */
router.post("/checkout/build-tx", checkoutLimiter, async (req: Request, res: Response) => {
  const parseResult = BuildTxSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0]?.message || "Invalid payload" });
  }

  try {
    const result = await RelayerService.buildLockAndPayTransaction(parseResult.data);
    return res.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error constructing transaction";
    console.error("[build-tx error]:", message);
    return res.status(500).json({ success: false, error: message });
  }
});

/**
 * Updates the stored invoice when payment completes
 */
function markInvoicePaid(invoiceId: number, signature: string, solscanUrl: string): void {
  const inv = invoicesStore.get(invoiceId);
  if (inv) {
    inv.status = "paid";
    inv.paidAt = Date.now();
    inv.signature = signature;
    invoicesStore.set(invoiceId, inv);
  }
  webhookEmitter.emit("payment", {
    type: "LOCK_AND_PAY_CONFIRMED",
    invoiceId,
    signature,
    solscanUrl,
    timestamp: Date.now(),
  });
}

/**
 * POST /api/checkout/submit-tx
 */
router.post("/checkout/submit-tx", checkoutLimiter, async (req: Request, res: Response) => {
  const parseResult = SubmitTxSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0]?.message || "Invalid payload" });
  }

  try {
    const { signedTx, invoiceId } = parseResult.data;
    const result = await RelayerService.broadcastTransaction(signedTx);

    if (invoiceId) {
      markInvoicePaid(invoiceId, result.signature, result.solscanUrl);
    }

    return res.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error broadcasting transaction";
    console.error("[submit-tx error]:", message);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
