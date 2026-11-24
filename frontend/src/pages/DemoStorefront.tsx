import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Sparkles,
  Info,
  Check,
  HelpCircle,
} from "lucide-react";
import { usePythPrices } from "../hooks/usePythPrices.js";
import { ZeroSellCheckoutModal } from "../components/ZeroSellCheckoutModal.js";
import { HeroSection } from "../components/HeroSection.js";
import { LiveMetricsRibbon } from "../components/LiveMetricsRibbon.js";
import { ProtocolFeaturesSection } from "../components/ProtocolFeaturesSection.js";
import { UpsideSimulator } from "../components/UpsideSimulator.js";
import { CinematicFooter } from "../components/CinematicFooter.js";
import { FloatingAssistant } from "../components/FloatingAssistant.js";

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
    title: "Cloud GPU Compute",
    category: "Infrastructure",
    description: "48hr On-Demand H100 Tensor Cluster for Model Fine-tuning",
    usdcAmount: 50.0,
    merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
    vendorName: "NeuroCompute Cloud",
    dueDate: "Immediate",
  },
  {
    id: 876543,
    title: "Figma Enterprise License",
    category: "Software",
    description: "Annual collaborative design license seat tier",
    usdcAmount: 120.0,
    merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
    vendorName: "Figma Global SaaS",
    dueDate: "Immediate",
  },
  {
    id: 765432,
    title: "Rust Smart Contract Audit",
    category: "Security",
    description: "Smart contract PDA reentrancy & security verification",
    usdcAmount: 250.0,
    merchantPubkey: "MrcHnt1111111111111111111111111111111111111",
    vendorName: "SolAudits Dev Guild",
    dueDate: "Immediate",
  },
];

export const DemoStorefront: React.FC = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { solPrice, calculateCollateralNeeded } = usePythPrices();
  const [searchParams] = useSearchParams();

  const [selectedInvoice, setSelectedInvoice] = useState(DEMO_INVOICES[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showTraditionalModal, setShowTraditionalModal] = useState(false);

  // Progressive Disclosure Toggles
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

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

  const scrollToCheckout = () => {
    const el = document.getElementById("checkout-experience");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-black text-white selection:bg-white/20 selection:text-white">
      {/* 1. CINEMATIC HERO SECTION (Directly inspired by official Solana website) */}
      <HeroSection
        onGetStartedClick={scrollToCheckout}
        onExploreVaultsClick={() => navigate("/dashboard")}
        solPrice={solPrice}
      />

      {/* 2. LIVE NETWORK & PROTOCOL METRICS RIBBON */}
      <LiveMetricsRibbon />

      {/* 3. INTERACTIVE PRODUCT CHECKOUT (Frictionless, progressive disclosure) */}
      <section id="checkout-experience" className="py-24 px-4 sm:px-6 lg:px-12 bg-black relative">
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>Interactive Checkout Demonstration</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Try ZeroSell Pay in Real-Time
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto">
              Select an invoice below to test atomic collateral locking on Solana Devnet.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Invoice Selector Pills */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                Select Demo Invoice
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_INVOICES.map((inv) => {
                  const isSelected = selectedInvoice.id === inv.id;
                  return (
                    <button
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white/[0.1] border-white/40 shadow-sm"
                          : "bg-black/60 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">
                          {inv.title}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </div>
                      <div className="text-sm font-mono font-bold text-neutral-200">
                        ${inv.usdcAmount.toFixed(2)}{" "}
                        <span className="text-[10px] text-neutral-400 font-sans">USDC</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Card */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <span className="text-[11px] text-neutral-400 block font-medium">Billed By</span>
                  <span className="text-sm font-bold text-white">{selectedInvoice.vendorName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 block font-medium">Merchant Gets</span>
                  <span className="text-lg font-black text-white font-mono">
                    ${selectedInvoice.usdcAmount.toFixed(2)}{" "}
                    <span className="text-xs text-neutral-400 font-sans">USDC</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-neutral-400 block font-medium">
                    Collateral Locked in Your Safe
                  </span>
                  <span className="text-xs text-neutral-300">
                    100% refunded when you repay
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white font-mono">
                    ~{calc.formattedUnits} SOL
                  </span>
                  <span className="text-xs text-neutral-400 block font-mono">
                    (${calc.collateralValueUsd.toFixed(2)} USD)
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-4 px-6 rounded-full bg-white hover:bg-neutral-200 active:scale-[0.99] text-black font-semibold text-sm tracking-wide shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Pay ${selectedInvoice.usdcAmount.toFixed(2)} USDC (Keep SOL)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-center space-x-4 text-xs text-neutral-500">
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Zero Selling</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Zero Tax Drag</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Non-Custodial</span>
                </span>
              </div>
            </div>

            {/* Progressive Disclosure Accordions */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2.5">
              {/* Accordion 1: Price & Collateral Details */}
              <div className="border border-white/[0.08] rounded-2xl bg-black/40 overflow-hidden transition-all">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Info className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Price &amp; Collateral Details</span>
                  </div>
                  {showBreakdown ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {showBreakdown && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/[0.08] text-xs space-y-2 text-neutral-400 animate-fade-in">
                    <div className="flex justify-between">
                      <span>Pyth Hermes Oracle Price:</span>
                      <span className="font-mono text-white font-medium">
                        1 SOL = ${solPrice.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collateral Ratio:</span>
                      <span className="font-mono text-white font-medium">
                        150% (50.0% Loan-to-Value)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Gas Fee:</span>
                      <span className="font-mono text-white font-medium">
                        $0.00 (Sponsored by Relayer)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Origination Fee:</span>
                      <span className="font-mono text-white font-medium">
                        0.30% (${(selectedInvoice.usdcAmount * 0.003).toFixed(2)} USDC)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidation Buffer:</span>
                      <span className="font-mono text-neutral-300">
                        Protected until SOL drops by &gt; 33.3%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: How It Works */}
              <div className="border border-white/[0.08] rounded-2xl bg-black/40 overflow-hidden transition-all">
                <button
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    <span>How do I get my SOL back?</span>
                  </div>
                  {showHowItWorks ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {showHowItWorks && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/[0.08] text-xs space-y-2.5 text-neutral-400 leading-relaxed animate-fade-in">
                    <p>
                      <strong className="text-white block font-semibold mb-0.5">1. Locked in your personal safe:</strong>
                      Your SOL is deposited into an isolated Solana Anchor smart contract PDA that only your wallet can unlock.
                    </p>
                    <p>
                      <strong className="text-white block font-semibold mb-0.5">2. Repay at your own pace:</strong>
                      Visit your <strong>Vault Dashboard</strong> anytime to repay the ${selectedInvoice.usdcAmount} USDC.
                    </p>
                    <p>
                      <strong className="text-white block font-semibold mb-0.5">3. 100% of price gains are yours:</strong>
                      If SOL doubles in price while locked, you keep all of that profit when unlocking.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Comparison */}
              <div className="border border-white/[0.08] rounded-2xl bg-black/40 overflow-hidden transition-all">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Why ZeroSell vs. Selling on a DEX?</span>
                  </div>
                  {showComparison ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {showComparison && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/[0.08] text-xs space-y-3 text-neutral-400 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <span className="text-[11px] font-bold text-white block mb-1">
                          ⚡ ZeroSell Pay
                        </span>
                        <ul className="space-y-1 text-[11px] text-neutral-300">
                          <li>• Keep 100% future price upside</li>
                          <li>• No capital gains tax trigger</li>
                          <li>• Sponsored gas ($0.00 fee)</li>
                          <li>• Non-custodial personal vault</li>
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30">
                        <span className="text-[11px] font-bold text-red-400 block mb-1">
                          ⚠️ Selling SOL on DEX
                        </span>
                        <ul className="space-y-1 text-[11px] text-neutral-400">
                          <li>• Upside permanently lost</li>
                          <li>• Triggers taxable disposal</li>
                          <li>• 0.3% - 0.5% swap slippage</li>
                          <li>• Sells an appreciating asset</li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        onClick={() => setShowTraditionalModal(true)}
                        className="text-[11px] text-gray-500 hover:text-gray-300 underline cursor-pointer"
                      >
                        Simulate traditional DEX sale instead
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ASYMMETRICAL EDITORIAL ARCHITECTURE SECTION */}
      <ProtocolFeaturesSection />

      {/* 5. INTERACTIVE UPSIDE SIMULATOR */}
      <UpsideSimulator currentSolPrice={solPrice} />

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#111413] border border-red-500/30 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Are you sure you want to sell your SOL?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Selling {calc.formattedUnits} SOL locks in a taxable event and permanently gives away future bull run upside. ZeroSell Pay lets you pay the exact same ${selectedInvoice.usdcAmount} USDC while keeping your SOL!
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowTraditionalModal(false);
                  setModalOpen(true);
                }}
                className="flex-1 py-3 bg-white text-black text-xs font-black rounded-full shadow-lg hover:bg-gray-100 cursor-pointer uppercase tracking-wider"
              >
                Use ZeroSell Instead
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
