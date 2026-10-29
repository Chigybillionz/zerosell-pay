import { describe, it } from "node:test";
import assert from "node:assert";

describe("ZeroSell Pay Backend & Solana Blinks API Suite", () => {
  const baseUrl = "http://localhost:4000";

  it("1. GET /api/health returns healthy status", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, "healthy");
    assert.strictEqual(data.protocol, "ZeroSell Pay");
  });

  it("2. GET /actions.json serves valid Solana Actions Discovery rules", async () => {
    const res = await fetch(`${baseUrl}/actions.json`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.rules), "rules must be an array");
    assert.ok(data.rules.length > 0, "rules must not be empty");
    assert.ok(data.rules.some((r: any) => r.pathPattern.includes("/api/actions/**")));
  });

  it("3. GET /api/prices returns live asset prices", async () => {
    const res = await fetch(`${baseUrl}/api/prices`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.prices.SOL.priceUsd > 0, "SOL price must be positive");
    assert.ok(data.prices.BTC.priceUsd > 0, "BTC price must be positive");
    assert.ok(data.prices.ETH.priceUsd > 0, "ETH price must be positive");
  });

  it("4. GET /api/checkout/invoices returns active merchant invoices", async () => {
    const res = await fetch(`${baseUrl}/api/checkout/invoices`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.invoices) && data.invoices.length >= 2);
  });

  it("5. GET /api/checkout/invoice/984321 returns invoice details", async () => {
    const res = await fetch(`${baseUrl}/api/checkout/invoice/984321`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.invoice.id, 984321);
    assert.strictEqual(data.invoice.usdcAmount, 50.0);
    assert.strictEqual(data.invoice.status, "pending");
  });

  it("6. POST /api/checkout/build-tx generates gasless transaction", async () => {
    const res = await fetch(`${baseUrl}/api/checkout/build-tx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId: 984321,
        borrowerPubkey: "5c5e3CgdE8284LzPqG62xK73jYyJvW7g2X1d9f4K2a3b",
        merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
        usdcAmount: 50.0,
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.transactionBase64 === "string" && data.transactionBase64.length > 100);
    assert.ok(data.feePayer, "Must include relayer feePayer");
    assert.strictEqual(data.invoiceId, 984321);
  });

  it("7. GET /api/actions/pay/984321 returns valid Solana Blink metadata", async () => {
    const res = await fetch(`${baseUrl}/api/actions/pay/984321`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.title.includes("ZeroSell Pay"));
    assert.ok(data.icon, "Must include icon URL");
    assert.ok(data.label, "Must include action label");
    assert.ok(data.links?.actions, "Must provide action execution links");
  });

  it("8. POST /api/actions/pay/984321 returns wire transaction for Dialect / Twitter", async () => {
    const res = await fetch(`${baseUrl}/api/actions/pay/984321`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account: "5c5e3CgdE8284LzPqG62xK73jYyJvW7g2X1d9f4K2a3b",
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.transaction === "string" && data.transaction.length > 100);
    assert.ok(data.message.includes("Locking") && data.message.includes("ZeroSell Vault"));
  });
});
