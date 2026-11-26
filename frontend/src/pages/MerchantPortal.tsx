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
    const checkoutUrl = `${window.location.origin}/checkout?amount=${usdcAmount}&merchant=${merchantPubkey}&title=${encodeURIComponent(
      title
    )}&invoiceId=${id}`;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#F8FAF9] text-[#0A0A0A]">
      {/* Top Header */}
      <div className="space-y-3 pb-6 border-b-2 border-[#0A0A0A]">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-xs font-mono font-black uppercase text-[#0A0A0A]">
          <span className="w-2 h-2 bg-[#14F195] border border-[#0A0A0A]" />
          <span>Merchant &amp; POS Engine</span>
          <span className="text-[#0A0A0A]">•</span>
          <span>Instant USDC Settlement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#0A0A0A] tracking-tight">
          Merchant Invoicing &amp; Streams
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 font-medium max-w-2xl leading-relaxed">
          Generate ZeroSell checkout invoices, shareable Solana Blinks for X (Twitter), and track live Helius SSE settlement streams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Invoice & Blink Generator */}
        <div className="lg:col-span-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 space-y-6 text-[#0A0A0A]">
          <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4">
            <h3 className="text-lg font-black uppercase text-[#0A0A0A] flex items-center space-x-2.5">
              <Share2 className="w-5 h-5 text-[#9945FF] stroke-[2.5]" />
              <span>Create Invoice &amp; Solana Blink</span>
            </h3>
            <span className="text-[11px] font-mono font-black uppercase text-[#0A0A0A] bg-[#14F195] px-2.5 py-1 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
              Devnet Ready
            </span>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                Invoice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#F8FAF9] border-2 border-[#0A0A0A] px-4 py-3 text-sm text-[#0A0A0A] font-medium placeholder-neutral-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#0A0A0A] transition-all"
                placeholder="e.g. Web Development Invoice"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                Description / Line Items
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-[#F8FAF9] border-2 border-[#0A0A0A] px-4 py-3 text-sm text-[#0A0A0A] font-medium placeholder-neutral-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#0A0A0A] transition-all"
                placeholder="Brief summary for customer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                  USDC Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(parseFloat(e.target.value))}
                    required
                    className="w-full bg-[#F8FAF9] border-2 border-[#0A0A0A] pl-8 pr-4 py-3 text-sm text-[#0A0A0A] font-mono font-bold placeholder-neutral-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#0A0A0A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                  Merchant Address
                </label>
                <input
                  type="text"
                  value={merchantPubkey}
                  onChange={(e) => setMerchantPubkey(e.target.value)}
                  required
                  className="w-full bg-[#F8FAF9] border-2 border-[#0A0A0A] px-4 py-3 text-xs text-[#0A0A0A] font-mono font-bold placeholder-neutral-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#0A0A0A] transition-all"
                  placeholder="Solana Wallet Address"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-[#9945FF] hover:bg-[#8935ef] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-white font-black text-sm uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Generate ZeroSell Invoice &amp; Blink</span>
            </button>
          </form>

          {/* Generated Shareable Links Box */}
          {createdInvoice && (
            <div className="mt-6 pt-6 border-t-2 border-[#0A0A0A] space-y-5">
              <div className="p-4 bg-[#14F195]/20 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                <span className="text-xs font-black uppercase text-[#0A0A0A] block mb-1">
                  🎉 Invoice #{createdInvoice.id} Generated!
                </span>
                <p className="text-xs text-neutral-700 font-medium">
                  Customers can now pay this invoice using ZeroSell to keep their crypto upside while you receive guaranteed USDC immediately.
                </p>
              </div>

              {/* 1. Direct Web Checkout Link (Send to Buyer) */}
              <div className="space-y-1.5 p-3.5 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                <div className="flex justify-between items-center text-xs text-[#0A0A0A]">
                  <span className="font-black uppercase flex items-center space-x-1.5 text-[#9945FF]">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Customer Web Checkout Link (Send to Buyer)</span>
                  </span>
                  {copiedLink === "checkout" ? (
                    <span className="text-[#0A0A0A] bg-[#14F195] px-2 py-0.5 border border-[#0A0A0A] flex items-center space-x-1 font-mono font-bold text-[11px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Copied!</span>
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-neutral-600 font-medium leading-relaxed">
                  Send this link to the customer. When opened, it automatically loads your invoice on the storefront and launches the ZeroSell checkout modal!
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={createdInvoice.checkoutUrl}
                    className="flex-1 bg-[#F8FAF9] border-2 border-[#0A0A0A] px-3 py-2.5 text-xs font-mono font-medium text-[#0A0A0A] focus:outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInvoice.checkoutUrl, "checkout")}
                    className="px-3.5 py-2.5 bg-[#9945FF] hover:bg-[#8935ef] active:translate-x-[1px] active:translate-y-[1px] text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer font-black text-xs uppercase"
                  >
                    Copy Link
                  </button>
                  <a
                    href={createdInvoice.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#F8FAF9] active:translate-x-[1px] active:translate-y-[1px] text-[#0A0A0A] transition-all"
                    title="Open checkout in new tab"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  </a>
                </div>
              </div>

              {/* 2. Solana Blink Link */}
              <div className="space-y-1.5 p-3.5 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                <div className="flex justify-between text-xs text-[#0A0A0A]">
                  <span className="font-black uppercase flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#9945FF]" />
                    <span>Solana Blink (Share on X / Discord / Dialect)</span>
                  </span>
                  {copiedLink === "blink" ? (
                    <span className="text-[#0A0A0A] bg-[#14F195] px-2 py-0.5 border border-[#0A0A0A] flex items-center space-x-1 font-mono font-bold text-[11px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Copied!</span>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={createdInvoice.blinkUrl}
                    className="flex-1 bg-white border-2 border-[#0A0A0A] px-3 py-2 text-xs font-mono font-medium text-[#0A0A0A] focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInvoice.blinkUrl, "blink")}
                    className="p-2 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#F8FAF9] active:translate-x-[1px] active:translate-y-[1px] text-[#0A0A0A] transition-all cursor-pointer font-bold text-xs uppercase px-3"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* 3. Solana Pay QR Code */}
              <div className="p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center space-x-4">
                <div className="p-2.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                  <QRCodeSVG value={createdInvoice.solanaPayUri} size={90} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-[#0A0A0A] flex items-center space-x-1">
                    <QrCode className="w-3.5 h-3.5 text-[#9945FF] stroke-[2.5]" />
                    <span>Solana Pay QR Code</span>
                  </span>
                  <p className="text-xs text-neutral-600 font-medium mt-1 leading-relaxed">
                    Display at your POS terminal or on desktop invoices for instant mobile checkout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Settlement Feed (SSE Webhook Stream) */}
        <div className="lg:col-span-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 space-y-6 text-[#0A0A0A]">
          <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4">
            <h3 className="text-lg font-black uppercase text-[#0A0A0A] flex items-center space-x-2.5">
              <Radio className="w-5 h-5 text-[#9945FF] animate-pulse stroke-[2.5]" />
              <span>Live USDC Settlement Stream</span>
            </h3>
            <span className="px-2.5 py-1 text-[11px] font-mono font-black uppercase bg-[#14F195] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-[#0A0A0A] animate-ping" />
              <span>Helius SSE: Active</span>
            </span>
          </div>

          <p className="text-xs text-neutral-600 font-medium">
            Real-time on-chain confirmation stream of USDC disbursements issued to merchant settlement accounts on Solana Devnet.
          </p>

          <div className="space-y-3">
            {settlements.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0A0A0A] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase text-[#0A0A0A] bg-[#14F195] px-2 py-0.5 border border-[#0A0A0A]">
                      Settlement Confirmed
                    </span>
                    <span className="text-[10px] text-neutral-600 font-mono font-bold">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs font-black uppercase text-[#0A0A0A] pt-0.5">
                    {item.description}
                  </p>
                  <span className="text-[11px] font-mono text-neutral-500 block truncate max-w-xs">
                    Tx: {item.signature.slice(0, 24)}...
                  </span>
                </div>

                <a
                  href={item.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#F8FAF9] text-[#0A0A0A] transition-all"
                >
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
