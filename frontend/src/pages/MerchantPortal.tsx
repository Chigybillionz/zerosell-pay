import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Coins,
  Link as LinkIcon,
  QrCode,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Radio,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { BACKEND_URL } from "../hooks/useZeroSellProgram.js";

interface SettlementEvent {
  signature: string;
  invoiceId?: number;
  description?: string;
  timestamp: number;
  solscanUrl: string;
}

export const MerchantPortal: React.FC = () => {
  const { publicKey } = useWallet();

  // Invoice creation form state
  const [title, setTitle] = useState("Freelance Smart Contract Review");
  const [description, setDescription] = useState("Security & PDA invariant testing");
  const [usdcAmount, setUsdcAmount] = useState<number>(75.0);
  const [merchantPubkey, setMerchantPubkey] = useState<string>(
    publicKey?.toBase58() || "MrcHnt1111111111111111111111111111111111111"
  );

  const [createdInvoice, setCreatedInvoice] = useState<{
    id: number;
    checkoutUrl: string;
    blinkUrl: string;
    solanaPayUri: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Live Settlement Events state
  const [settlements, setSettlements] = useState<SettlementEvent[]>([
    {
      signature: "4K7yQDevnetLockAndPayUSDCDisbursed984321",
      invoiceId: 984321,
      description: "Cloud GPU Render Credits (50.00 USDC Disbursed)",
      timestamp: Date.now() - 300000,
      solscanUrl: "https://solscan.io/tx/4K7yQDevnetLockAndPayUSDCDisbursed984321?cluster=devnet",
    },
    {
      signature: "3N1bZDevnetLockAndPayUSDCDisbursed876543",
      invoiceId: 876543,
      description: "Figma Pro Enterprise (120.00 USDC Disbursed)",
      timestamp: Date.now() - 1200000,
      solscanUrl: "https://solscan.io/tx/3N1bZDevnetLockAndPayUSDCDisbursed876543?cluster=devnet",
    },
  ]);

  // Connect to SSE stream from backend
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${BACKEND_URL}/api/webhooks/stream`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "LOCK_AND_PAY_CONFIRMED" || data.type === "HELIUS_WEBHOOK_EVENT") {
            setSettlements((prev) => [
              {
                signature: data.signature,
                invoiceId: data.invoiceId,
                description: data.description || `Invoice #${data.invoiceId || ""} Settled in USDC`,
                timestamp: data.timestamp || Date.now(),
                solscanUrl: data.solscanUrl,
              },
              ...prev,
            ]);
          }
        } catch (e) {
          // ignore parse errors
        }
      };
    } catch (e) {
      // SSE connection error fallback
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.floor(100000 + Math.random() * 900000);
    const checkoutUrl = `${window.location.origin}/checkout`;
    const blinkActionUrl = `${BACKEND_URL}/api/actions/pay/${id}`;
    const dialectBlinkUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(
      blinkActionUrl
    )}&cluster=devnet`;
    const solanaPayUri = `solana:${merchantPubkey}?amount=${usdcAmount}&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=${id}&label=ZeroSell+Pay&message=${encodeURIComponent(
      title
    )}`;

    setCreatedInvoice({
      id,
      checkoutUrl,
      blinkUrl: dialectBlinkUrl,
      solanaPayUri,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold tracking-wider">
          <span>&gt;_ MERCHANT &amp; POS ENGINE</span>
          <span className="text-gray-600">•</span>
          <span className="text-purple-400">INSTANT USDC SETTLEMENT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mt-1">
          Merchant Invoicing &amp; Streams
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
          Generate ZeroSell checkout invoices, shareable Solana Blinks for X (Twitter), and track live Helius SSE settlement streams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Invoice & Blink Generator */}
        <div className="lg:col-span-6 bg-[#111413] border border-[#1E2522] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#1E2522] pb-4 mb-5">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              <span>Create Invoice &amp; Solana Blink</span>
            </h3>
            <span className="text-[11px] font-mono text-gray-400 bg-[#161d19] px-2.5 py-1 rounded-full border border-emerald-500/20">
              Devnet Ready
            </span>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Invoice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#090c0a] border border-[#1e2522] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Web Development Invoice"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Description / Line Items
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-[#090c0a] border border-[#1e2522] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Brief summary for customer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  USDC Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(parseFloat(e.target.value))}
                    required
                    className="w-full bg-[#090c0a] border border-[#1e2522] rounded-xl pl-8 pr-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Merchant Address
                </label>
                <input
                  type="text"
                  value={merchantPubkey}
                  onChange={(e) => setMerchantPubkey(e.target.value)}
                  required
                  className="w-full bg-[#090c0a] border border-[#1e2522] rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Solana Wallet Address"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Generate ZeroSell Invoice &amp; Blink</span>
            </button>
          </form>

          {/* Generated Shareable Links Box */}
          {createdInvoice && (
            <div className="mt-6 pt-6 border-t border-[#1E2522] space-y-4">
              <div className="p-4 rounded-2xl bg-[#0c2317] border border-[#1B402B]">
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  🎉 Invoice #{createdInvoice.id} Generated!
                </span>
                <p className="text-[11px] text-gray-300">
                  Customers can now pay this invoice using ZeroSell to keep their crypto upside while you receive guaranteed USDC immediately.
                </p>
              </div>

              {/* Solana Blink Link */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span className="font-semibold text-purple-400 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Solana Blink (Share on X / Discord / Dialect)</span>
                  </span>
                  {copiedLink === "blink" ? (
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInvoice.blinkUrl}
                    className="flex-1 bg-[#090c0a] border border-[#1e2522] rounded-xl px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInvoice.blinkUrl, "blink")}
                    className="p-2.5 rounded-xl bg-[#1a201c] hover:bg-[#232c26] text-gray-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Solana Pay QR Code */}
              <div className="p-4 bg-[#090c0a] rounded-2xl border border-[#1e2522] flex items-center space-x-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <QRCodeSVG value={createdInvoice.solanaPayUri} size={90} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-200 flex items-center space-x-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Solana Pay QR Code</span>
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Display at your POS terminal or on desktop invoices for instant mobile checkout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Settlement Feed (SSE Webhook Stream) */}
        <div className="lg:col-span-6 bg-[#111413] border border-[#1E2522] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-[#1E2522] pb-4">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Live USDC Settlement Stream</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Helius SSE: Active</span>
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Real-time on-chain confirmation stream of USDC disbursements issued to merchant settlement accounts on Solana Devnet.
          </p>

          <div className="space-y-3">
            {settlements.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#090c0a] border border-[#1e2522] hover:border-[#2b3530] transition-all flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-400">
                      Settlement Confirmed
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    {item.description}
                  </p>
                  <span className="text-[11px] font-mono text-gray-500 block truncate max-w-xs">
                    Tx: {item.signature.slice(0, 24)}...
                  </span>
                </div>

                <a
                  href={item.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#151a17] hover:bg-[#1d2520] text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
