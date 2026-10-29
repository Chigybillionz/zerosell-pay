import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import checkoutRoutes from "./routes/checkout.routes.js";
import blinksRoutes from "./routes/blinks.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Standard and Blink-compatible CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Content-Encoding",
      "Accept-Encoding",
      ...Object.keys(ACTIONS_CORS_HEADERS),
    ],
  })
);

app.use(express.json());

// Discovery manifest at root for Solana Actions / Blinks
app.get("/actions.json", (_req, res) => {
  res.set(ACTIONS_CORS_HEADERS).json({
    rules: [
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  });
});

// Mount Routes
app.use("/api", checkoutRoutes);
app.use("/api", blinksRoutes);
app.use("/api", webhookRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    protocol: "ZeroSell Pay",
    network: "devnet",
    version: "1.0.0",
    features: [
      "Pyth Hermes Pull Oracle",
      "Gasless Fee-Payer Relayer",
      "Solana Actions & Blinks",
      "Helius Webhook SSE Stream",
    ],
    timestamp: new Date().toISOString(),
  });
});

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ZeroSell Pay Backend & Relayer running on port ${PORT}`);
  console.log(`📡 Solana RPC: ${process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"}`);
  console.log(`⚡ Blinks Action URL: http://localhost:${PORT}/api/actions/pay/984321`);
  console.log(`🔗 Actions Discovery: http://localhost:${PORT}/actions.json`);
  console.log(`=======================================================`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n⚠️  Port ${PORT} is already in use by another process.`);
    console.error(`Please stop any existing process on port ${PORT} before starting the server.\n`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
  }
});

