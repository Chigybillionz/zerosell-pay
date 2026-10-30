import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import {
  Zap,
  Server,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Coins,
  CheckCircle2,
  Calendar,
  Lock,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { usePythPrices } from "../hooks/usePythPrices.js";
import { ZeroSellCheckoutModal } from "../components/ZeroSellCheckoutModal.js";

const QueryParamsSchema = z.object({
  invoiceId: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().positive().optional(),
  merchant: z
    .string()
    .refine((val) => {
      try {
        new PublicKey(val);
        return true;
      } catch {
        return false;
      }
    }, "Invalid merchant pubkey")
    .optional(),
  title: z.string().max(100).optional(),
});

const DEMO_INVOICES = [
  {
    id: 984321,
    title: "Cloud GPU Render Credits",
    category: "SaaS & Infrastructure",
    description: "48hr On-Demand H100 Tensor Cluster for Model Fine-tuning",
    usdcAmount: 50.0,
    merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
    vendorName: "NeuroCompute Cloud Inc.",
    dueDate: "Immediate",
  },
  {
    id: 876543,
    title: "Figma Enterprise Annual Seat",
    category: "Design Software",
    description: "Annual collaborative design license seat tier",
    usdcAmount: 120.0,
    merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
    vendorName: "Figma Global SaaS",
    dueDate: "Immediate",
  },
  {
    id: 765432,
    title: "Freelance Rust Audit Invoice",
    category: "Freelance Services",
    description: "Smart contract PDA reentrancy & security verification",
    usdcAmount: 250.0,
    merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
    vendorName: "SolAudits Dev Guild",
    dueDate: "Immediate",
  },
];

export const DemoStorefront: React.FC = () => {
  const { connected } = useWallet();
  const { solPrice, calculateCollateralNeeded } = usePythPrices();
  const [searchParams] = useSearchParams();

  const [selectedInvoice, setSelectedInvoice] = useState(DEMO_INVOICES[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showTraditionalModal, setShowTraditionalModal] = useState(false);

  useEffect(() => {
    const rawParams = {
      invoiceId: searchParams.get("invoiceId") || undefined,
      amount: searchParams.get("amount") || undefined,
      merchant: searchParams.get("merchant") || undefined,
      title: searchParams.get("title") || undefined,
    };

    const parsed = QueryParamsSchema.safeParse(rawParams);
    if (parsed.success) {
      const { invoiceId, amount, merchant, title } = parsed.data;
      if (invoiceId) {
        const found = DEMO_INVOICES.find((i) => i.id === invoiceId);
        if (found) {
          setSelectedInvoice(found);
          setModalOpen(true);
        }
      } else if (amount && merchant) {
        setSelectedInvoice({
          id: Math.floor(100000 + Math.random() * 900000),
          title: title || "Custom Checkout Invoice",
          category: "Direct Checkout",
          description: "ZeroSell collateralized invoice",
          usdcAmount: amount,
          merchantPubkey: merchant,
          vendorName: "Merchant POS",
          dueDate: "Immediate",
        });
        setModalOpen(true);
      }
    }
  }, [searchParams]);

  const calc = calculateCollateralNeeded(selectedInvoice.usdcAmount, "SOL", 50.0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. TOP STATS RIBBON (4-Column Grid with Vertical Borders, Web3 Style) */}
      <div className="bg-[#0e1210] border border-[#1e2722] rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#1e2722] text-center">
          <div className="p-4 sm:p-5 hover:bg-[#121714] transition-colors">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block tracking-tight">
              150%
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">
              Collateral Ratio
            </span>
          </div>

          <div className="p-4 sm:p-5 hover:bg-[#121714] transition-colors">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block tracking-tight">
              &lt; 400ms
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">
              Pyth Hermes Latency
            </span>
          </div>

          <div className="p-4 sm:p-5 hover:bg-[#121714] transition-colors">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block tracking-tight">
              0% TAX
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">
              No Capital Gains Event
            </span>
          </div>

          <div className="p-4 sm:p-5 hover:bg-[#121714] transition-colors">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block tracking-tight">
              100% FREE
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">
              Relayer Sponsored Gas
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO INTRO HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold tracking-wider">
          <span>&gt;_ HOW TO PAY</span>
          <span className="text-gray-600">•</span>
          <span className="text-amber-400 uppercase tracking-widest text-[11px] font-bold">
            Solana Dev3pack Track: Best App Overall
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
            Two Doors, One Checkout
          </h1>
          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Pick the payment lane that fits. Buyers keep their SOL upside in non-custodial vaults; merchants receive 100% instant USDC settlement.
          </p>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE 2-COLUMN GRID (Matching Image 1 & Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Forest Green Protocol Card (Matching Image 1 Left) */}
        <div className="lg:col-span-5 bg-[#0C2317] border border-[#1B402B] rounded-3xl p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle glow orb */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#143d26] border border-[#255838] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                The Protocol
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Atomic Collateralization
              </h2>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Spend assets without selling them. ZeroSell deploys an isolated Anchor PDA vault to secure your SOL collateral, disbursing immediate USDC to the vendor.
              </p>
            </div>

            {/* Event-style specs with icons like reference Image 1 */}
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="flex items-center space-x-3 text-gray-200">
                <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>30-Day Flexible Repayment Window</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-200">
                <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Non-Custodial Anchor Smart Contract Vault</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-200">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Real-Time Pyth Hermes Pull Oracle ($ {solPrice.toFixed(2)})</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-[#1a442b]">
            <a
              href="https://github.com/Chigybillionz/zerosell-pay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Explore Smart Contract Source</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Charcoal Slate Interactive Selection Grid (Matching Image 1 Right) */}
        <div className="lg:col-span-7 bg-[#111413] border border-[#1E2522] rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-2xl space-y-6">
          <div>
            {/* Step header with golden accent */}
            <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
              <div>
                <span className="font-mono text-amber-400 font-bold text-xs uppercase tracking-wider">
                  01 / 02
                </span>
                <h3 className="text-xl font-black text-white ml-2 inline-block">
                  Select Mock Invoice
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Choose a real-world merchant bill to test atomic zero-sell settlement.
                </p>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Oracle SOL Price
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  ${solPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Invoice Selection Tiles (Grid Radio Cards matching reference) */}
            <div className="grid grid-cols-1 gap-3.5 mt-5">
              {DEMO_INVOICES.map((inv) => {
                const isSelected = selectedInvoice.id === inv.id;
                const invCalc = calculateCollateralNeeded(inv.usdcAmount, "SOL", 50.0);
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#161d19] border-emerald-500/60 shadow-glow"
                        : "bg-[#141816]/70 border-[#232b26] hover:border-[#333f37] hover:bg-[#161a18]"
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-400"
                            : "border-gray-600 bg-transparent"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-extrabold text-white">
                            {inv.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e2522] text-gray-400 font-medium">
                            {inv.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {inv.vendorName} • {inv.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:flex-shrink-0 pl-8 sm:pl-0">
                      <div className="text-base font-black font-mono text-white">
                        ${inv.usdcAmount.toFixed(2)}{" "}
                        <span className="text-xs text-gray-400 font-sans">USDC</span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                        ~{invCalc.formattedUnits} SOL Collateral
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collateral & Payment Preview Box */}
            <div className="mt-5 p-4 rounded-2xl bg-[#0b0e0c] border border-[#1e2522] space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>Selected Merchant Invoice:</span>
                <span className="font-mono text-gray-200 font-bold">
                  #{selectedInvoice.id} (${selectedInvoice.usdcAmount.toFixed(2)} USDC)
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Collateral Required (150% CR / 50% LTV):</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {calc.formattedUnits} SOL (${calc.collateralValueUsd.toFixed(2)} USD)
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Relayer Gas Sponsorship:</span>
                <span className="font-semibold text-purple-400 font-mono">
                  100% FREE (Sponsored)
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs (Yellow/Amber Pill CTA like Image 1 "Register ->") */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-4 px-8 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-black font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Pay ${selectedInvoice.usdcAmount} USDC (Keep SOL)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setShowTraditionalModal(true)}
              className="w-full py-2.5 px-4 rounded-full bg-transparent hover:bg-gray-800/40 text-gray-500 hover:text-gray-300 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Or pay with traditional DEX sale (liquidates SOL)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. "TWO DOORS, ONE PROTOCOL" ARCHITECTURE GRID (Matching Image 2) */}
      <div className="pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2522] pb-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase">
              &gt;_ ARCHITECTURE BREAKDOWN
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              Engineered for Both Sides of Point-of-Sale
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            Self-Custody Anchor PDA Vaults
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Buyers & Borrowers */}
          <div className="bg-[#111413] border border-[#1E2522] rounded-3xl p-7 space-y-5 hover:border-[#2b3530] transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-white uppercase tracking-tight">
                For Buyers & Freelancers
              </h4>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-mono font-bold uppercase">
                Borrowers
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Never sell your appreciating crypto or tokenized equities just to pay SaaS invoices, rent, or dev tooling.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-mono font-black flex items-center justify-center text-xs flex-shrink-0">
                  01
                </span>
                <div>
                  <strong className="text-white block font-semibold">Deposit Collateral</strong>
                  <span className="text-gray-400">Lock SOL into your personal PDA vault at 50% initial LTV.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-mono font-black flex items-center justify-center text-xs flex-shrink-0">
                  02
                </span>
                <div>
                  <strong className="text-white block font-semibold">USDC Disbursal</strong>
                  <span className="text-gray-400">Instant transfer to merchant wallet without slippage or DEX tax.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-mono font-black flex items-center justify-center text-xs flex-shrink-0">
                  03
                </span>
                <div>
                  <strong className="text-white block font-semibold">Reclaim Full Upside</strong>
                  <span className="text-gray-400">Repay anytime in USDC to unlock 100% of your collateral.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Merchants & Developers */}
          <div className="bg-[#111413] border border-[#1E2522] rounded-3xl p-7 space-y-5 hover:border-[#2b3530] transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-white uppercase tracking-tight">
                For Merchants & POS
              </h4>
              <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/25 text-[11px] font-mono font-bold uppercase">
                Merchants
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Accept collateralized crypto payments with zero volatility risk. Guaranteed exact dollar value in USDC.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 font-mono font-black flex items-center justify-center text-xs flex-shrink-0">
                  01
                </span>
                <div>
                  <strong className="text-white block font-semibold">100% Stable Settlement</strong>
                  <span className="text-gray-400">Merchant receives pristine USDC directly into their settlement account.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 font-mono font-black flex items-center justify-center text-xs flex-shrink-0">
                  02
                </span>
                <div>
                  <strong className="text-white block font-semibold">Solana Pay & Blink URLs</strong>
                  <span className="text-gray-400">Generate 1-click payment links and QR codes ready for social sharing.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 font-mono font-black flex items-center justify-center text-xs flex-shrink-0">
                  03
                </span>
                <div>
                  <strong className="text-white block font-semibold">Real-Time Webhook Stream</strong>
                  <span className="text-gray-400">Subscribe to Server-Sent Events for instant point-of-sale confirmation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ZeroSell Checkout Modal */}
      <ZeroSellCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={(res) => {
          console.log("Payment successful:", res);
        }}
      />

      {/* Warning Modal for Traditional Sale */}
      {showTraditionalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111413] border border-red-500/30 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Are you sure you want to liquidate your SOL?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Selling {calc.formattedUnits} SOL triggers a taxable capital gains event and eliminates your exposure to future price appreciation. ZeroSell Pay allows you to pay ${selectedInvoice.usdcAmount} USDC while keeping 100% of your SOL!
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowTraditionalModal(false);
                  setModalOpen(true);
                }}
                className="flex-1 py-3 bg-amber-400 text-black text-xs font-black rounded-full shadow-lg hover:bg-amber-300 cursor-pointer uppercase tracking-wider"
              >
                Use ZeroSell Pay
              </button>
              <button
                onClick={() => setShowTraditionalModal(false)}
                className="py-3 px-5 bg-[#1a201c] text-gray-400 text-xs font-semibold rounded-full hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
