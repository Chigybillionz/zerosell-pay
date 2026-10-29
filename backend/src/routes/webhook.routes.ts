import { Router, Request, Response } from "express";
import { EventEmitter } from "events";

export const webhookEmitter = new EventEmitter();

const router = Router();

// Track active SSE client connections
const clients: Response[] = [];

/**
 * GET /api/webhooks/stream
 * Server-Sent Events (SSE) feed for live settlement status on Merchant Portal & User Dashboard
 */
router.get("/webhooks/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.write(`data: ${JSON.stringify({ type: "CONNECTED", message: "Live ZeroSell Settlement Stream Connected" })}\n\n`);

  clients.push(res);

  req.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

// Broadcast any payment event to all connected SSE clients
webhookEmitter.on("payment", (data: any) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(payload);
    } catch (err) {
      // client disconnected
    }
  });
});

/**
 * POST /api/webhooks/helius
 * Listens for Devnet transactions parsed by Helius webhook
 */
router.post("/webhooks/helius", (req: Request, res: Response) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const evt of events) {
      const signature = evt.signature || evt.transaction?.signatures?.[0] || "simulated-sig";
      const description = evt.description || "ZeroSell Protocol Transaction";

      console.log(`[Helius Webhook] Received tx event: ${signature} - ${description}`);

      webhookEmitter.emit("payment", {
        type: "HELIUS_WEBHOOK_EVENT",
        signature,
        description,
        timestamp: Date.now(),
        solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
        raw: evt,
      });
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("[Helius Webhook Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

