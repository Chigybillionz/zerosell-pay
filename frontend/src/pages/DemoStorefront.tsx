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
  Edit3,
  DollarSign,
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
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customUsdcAmount, setCustomUsdcAmount] = useState<number>(75.0);
  const [customTitle, setCustomTitle] = useState<string>("Custom Merchant Invoice");
  const [customMerchantPubkey, setCustomMerchantPubkey] = useState<string>("");
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
          setIsCustomMode(false);
          setSelectedInvoice(found);
          setModalOpen(true);
        }
      } else if (amount && merchant) {
        setIsCustomMode(true);
        setCustomUsdcAmount(amount);
        setCustomMerchantPubkey(merchant);
        if (title) setCustomTitle(title);
        setModalOpen(true);
      }
    }
  }, [searchParams]);

  const customInvoice = {
    id: 999123,
    title: customTitle || "Custom Merchant Invoice",
    category: "Custom POS",
    description: "User-defined invoice for live Devnet collateral demonstration",
    usdcAmount: customUsdcAmount > 0 ? customUsdcAmount : 1,
    merchantPubkey: customMerchantPubkey.trim() || "MrcHnt1111111111111111111111111111111111111",
    vendorName: customMerchantPubkey.trim()
      ? `${customMerchantPubkey.trim().slice(0, 6)}...${customMerchantPubkey.trim().slice(-4)}`
      : "ZeroSell Custom POS",
    dueDate: "Immediate",
  };

  const activeInvoice = isCustomMode ? customInvoice : selectedInvoice;
  const calc = calculateCollateralNeeded(activeInvoice.usdcAmount, "SOL", 50.0);

  const scrollToCheckout = () => {
    const el = document.getElementById("checkout-experience");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-[#F8FAF9] text-[#0A0A0A] selection:bg-[#9945FF] selection:text-white">
      {/* 1. CINEMATIC HERO SECTION */}
      <HeroSection
        onGetStartedClick={scrollToCheckout}
        onExploreVaultsClick={() => navigate("/dashboard")}
        solPrice={solPrice}
      />

      {/* 2. LIVE NETWORK & PROTOCOL METRICS RIBBON */}
      <LiveMetricsRibbon />

      {/* 3. INTERACTIVE PRODUCT CHECKOUT (Frictionless, progressive disclosure) */}
      <section id="checkout-experience" className="py-20 px-4 sm:px-6 lg:px-12 bg-[#F8FAF9] border-b-2 border-[#0A0A0A] relative">
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
              <Sparkles className="w-3.5 h-3.5 text-[#9945FF]" />
              <span>Interactive Checkout Demonstration</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
              Try ZeroSell Pay in Real-Time
            </h2>
            <p className="text-sm font-medium text-neutral-600 max-w-lg mx-auto">
              Select an invoice below to test atomic collateral locking on Solana Devnet.
            </p>
          </div>

          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 sm:p-8 space-y-6">
            {/* Invoice Selector Pills */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-black text-[#0A0A0A] uppercase tracking-wider">
                  Select Demo Invoice or Set Custom Amount
                </label>
                <span className="text-[11px] font-mono font-bold text-[#9945FF]">
                  100% Non-Custodial
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DEMO_INVOICES.map((inv) => {
                  const isSelected = !isCustomMode && selectedInvoice.id === inv.id;
                  return (
                    <button
                      key={inv.id}
                      onClick={() => {
                        setIsCustomMode(false);
                        setSelectedInvoice(inv);
                      }}
                      className={`p-3.5 border-2 border-[#0A0A0A] text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#9945FF] text-white shadow-[3px_3px_0px_#0A0A0A] translate-x-[-1px] translate-y-[-1px]"
                          : "bg-white text-[#0A0A0A] hover:bg-[#F8FAF9] shadow-[2px_2px_0px_#0A0A0A]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-black uppercase truncate max-w-[90px] ${isSelected ? "text-white" : "text-[#0A0A0A]"}`}>
                          {inv.title}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[3]" />}
                      </div>
                      <div className={`text-sm font-mono font-black ${isSelected ? "text-white" : "text-[#0A0A0A]"}`}>
                        ${inv.usdcAmount.toFixed(2)}{" "}
                        <span className={`text-[9px] font-sans uppercase font-bold ${isSelected ? "text-white/80" : "text-neutral-500"}`}>USDC</span>
                      </div>
                    </button>
                  );
                })}

                {/* 4th Card: Custom Amount */}
                <button
                  onClick={() => setIsCustomMode(true)}
                  className={`p-3.5 border-2 border-[#0A0A0A] text-left transition-all cursor-pointer ${
                    isCustomMode
                      ? "bg-[#14F195] text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] translate-x-[-1px] translate-y-[-1px]"
                      : "bg-white text-[#0A0A0A] hover:bg-[#F8FAF9] shadow-[2px_2px_0px_#0A0A0A]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black uppercase truncate max-w-[90px] text-[#0A0A0A]">
                      Custom Amount
                    </span>
                    {isCustomMode ? (
                      <Check className="w-3.5 h-3.5 text-[#0A0A0A] shrink-0 stroke-[3]" />
                    ) : (
                      <Edit3 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-sm font-mono font-black text-[#0A0A0A]">
                    ${customUsdcAmount.toFixed(2)}{" "}
                    <span className="text-[9px] font-sans uppercase font-bold text-neutral-600">USDC</span>
                  </div>
                </button>
              </div>

              {/* Interactive Custom Invoice Box */}
              {isCustomMode && (
                <div className="mt-3.5 p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-[#0A0A0A] flex items-center space-x-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-[#9945FF]" />
                      <span>Enter Any USDC Amount</span>
                    </label>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">
                      Instant Pyth Oracle Math
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-neutral-400">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        step="any"
                        value={customUsdcAmount || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setCustomUsdcAmount(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        placeholder="e.g. 75.00"
                        className="w-full pl-8 pr-16 py-2.5 bg-white border-2 border-[#0A0A0A] font-mono font-black text-base text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#9945FF]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-neutral-500">
                        USDC
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[10, 25, 75, 150, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCustomUsdcAmount(preset)}
                          className={`px-2.5 py-2 text-xs font-mono font-black border-2 border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A] transition-all cursor-pointer ${
                            customUsdcAmount === preset
                              ? "bg-[#0A0A0A] text-white"
                              : "bg-white text-[#0A0A0A] hover:bg-neutral-100"
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Custom Item Title */}
                  <div className="pt-2 border-t border-dashed border-neutral-300 flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500 whitespace-nowrap">
                      Invoice Title:
                    </span>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Freelance Web3 Invoice"
                      maxLength={50}
                      className="flex-1 px-2.5 py-1 text-xs font-semibold bg-white border border-[#0A0A0A] text-[#0A0A0A] focus:outline-none"
                    />
                  </div>

                  {/* Optional Seller / Merchant Solana Address */}
                  <div className="pt-2 border-t border-dashed border-neutral-300 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500 whitespace-nowrap">
                      Seller Address (Optional):
                    </span>
                    <input
                      type="text"
                      value={customMerchantPubkey}
                      onChange={(e) => setCustomMerchantPubkey(e.target.value)}
                      placeholder="e.g. Paste any Solana wallet (default: Demo POS MrcHnt...)"
                      className="flex-1 px-2.5 py-1 text-xs font-mono font-semibold bg-white border border-[#0A0A0A] text-[#0A0A0A] focus:outline-none placeholder:font-sans placeholder:text-neutral-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="p-5 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0A0A0A]">
                <div>
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider block font-bold">Billed By</span>
                  <span className="text-sm font-black text-[#0A0A0A] uppercase">{activeInvoice.vendorName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider block font-bold">Merchant Gets</span>
                  <span className="text-lg font-black text-[#0A0A0A] font-mono">
                    ${activeInvoice.usdcAmount.toFixed(2)}{" "}
                    <span className="text-xs text-neutral-600 font-sans font-bold">USDC</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider block font-bold">
                    Collateral Locked in Your Safe
                  </span>
                  <span className="text-xs text-[#0A0A0A] font-semibold">
                    100% refunded when you repay
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#0A0A0A] font-mono">
                    ~{calc.formattedUnits} SOL
                  </span>
                  <span className="text-xs text-neutral-600 block font-mono font-bold">
                    (${calc.collateralValueUsd.toFixed(2)} USD)
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-4 px-6 bg-[#9945FF] hover:bg-[#8935ef] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Pay ${activeInvoice.usdcAmount.toFixed(2)} USDC (Keep SOL)</span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
              </button>

              <div className="flex items-center justify-center space-x-4 text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-[#14F195] bg-[#0A0A0A] p-0.5" />
                  <span>Zero Selling</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-[#14F195] bg-[#0A0A0A] p-0.5" />
                  <span>Zero Tax Drag</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-[#14F195] bg-[#0A0A0A] p-0.5" />
                  <span>Non-Custodial</span>
                </span>
              </div>
            </div>

            {/* Progressive Disclosure Accordions */}
            <div className="pt-2 border-t-2 border-[#0A0A0A] space-y-3">
              {/* Accordion 1: Price & Collateral Details */}
              <div className="border-2 border-[#0A0A0A] bg-white shadow-[3px_3px_0px_#0A0A0A] overflow-hidden transition-all">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#0A0A0A] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-[#9945FF]" />
                    <span>Price &amp; Collateral Details</span>
                  </div>
                  {showBreakdown ? (
                    <ChevronUp className="w-4 h-4 text-[#0A0A0A] stroke-[3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#0A0A0A] stroke-[3]" />
                  )}
                </button>

                {showBreakdown && (
                  <div className="px-4 pb-4 pt-2 border-t-2 border-[#0A0A0A] bg-[#F8FAF9] text-xs space-y-2 text-[#0A0A0A] font-medium animate-fade-in">
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-600 uppercase">Pyth Hermes Oracle Price:</span>
                      <span className="font-mono text-[#0A0A0A] font-bold">
                        1 SOL = ${solPrice.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-600 uppercase">Collateral Ratio:</span>
                      <span className="font-mono text-[#0A0A0A] font-bold">
                        150% (50.0% Loan-to-Value)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-600 uppercase">Network Gas Fee:</span>
                      <span className="font-mono text-[#0A0A0A] font-bold">
                        $0.00 (Sponsored by Relayer)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-600 uppercase">Origination Fee:</span>
                      <span className="font-mono text-[#0A0A0A] font-bold">
                        0.30% (${(selectedInvoice.usdcAmount * 0.003).toFixed(2)} USDC)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-600 uppercase">Liquidation Buffer:</span>
                      <span className="font-mono text-[#0A0A0A] font-bold">
                        Protected until SOL drops by &gt; 33.3%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: How It Works */}
              <div className="border-2 border-[#0A0A0A] bg-white shadow-[3px_3px_0px_#0A0A0A] overflow-hidden transition-all">
                <button
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#0A0A0A] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-[#9945FF]" />
                    <span>How do I get my SOL back?</span>
                  </div>
                  {showHowItWorks ? (
                    <ChevronUp className="w-4 h-4 text-[#0A0A0A] stroke-[3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#0A0A0A] stroke-[3]" />
                  )}
                </button>

                {showHowItWorks && (
                  <div className="px-4 pb-4 pt-2 border-t-2 border-[#0A0A0A] bg-[#F8FAF9] text-xs space-y-2.5 text-[#0A0A0A] font-medium leading-relaxed animate-fade-in">
                    <p>
                      <strong className="text-[#0A0A0A] block font-black uppercase mb-0.5">1. Locked in your personal safe:</strong>
                      Your SOL is deposited into an isolated Solana Anchor smart contract PDA that only your wallet can unlock.
                    </p>
                    <p>
                      <strong className="text-[#0A0A0A] block font-black uppercase mb-0.5">2. Repay at your own pace:</strong>
                      Visit your <strong>Vault Dashboard</strong> anytime to repay the ${selectedInvoice.usdcAmount} USDC.
                    </p>
                    <p>
                      <strong className="text-[#0A0A0A] block font-black uppercase mb-0.5">3. 100% of price gains are yours:</strong>
                      If SOL doubles in price while locked, you keep all of that profit when unlocking.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Comparison */}
              <div className="border-2 border-[#0A0A0A] bg-white shadow-[3px_3px_0px_#0A0A0A] overflow-hidden transition-all">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#0A0A0A] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[#9945FF]" />
                    <span>Why ZeroSell vs. Selling on a DEX?</span>
                  </div>
                  {showComparison ? (
                    <ChevronUp className="w-4 h-4 text-[#0A0A0A] stroke-[3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#0A0A0A] stroke-[3]" />
                  )}
                </button>

                {showComparison && (
                  <div className="px-4 pb-4 pt-2 border-t-2 border-[#0A0A0A] bg-[#F8FAF9] text-xs space-y-3 text-[#0A0A0A] animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                        <span className="text-[11px] font-black uppercase text-[#0A0A0A] block mb-1">
                          ⚡ ZeroSell Pay
                        </span>
                        <ul className="space-y-1 text-[11px] font-medium text-neutral-700">
                          <li>• Keep 100% future price upside</li>
                          <li>• No capital gains tax trigger</li>
                          <li>• Sponsored gas ($0.00 fee)</li>
                          <li>• Non-custodial personal vault</li>
                        </ul>
                      </div>

                      <div className="p-3.5 bg-red-50 border-2 border-red-600 shadow-[2px_2px_0px_#0A0A0A]">
                        <span className="text-[11px] font-black uppercase text-red-600 block mb-1">
                          ⚠️ Selling SOL on DEX
                        </span>
                        <ul className="space-y-1 text-[11px] font-medium text-red-900">
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
                        className="text-[11px] font-bold text-neutral-600 hover:text-black underline cursor-pointer"
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
        invoice={activeInvoice}
        onSuccess={(res) => {
          console.log("Payment successful:", res);
        }}
      />

      {/* Warning Modal for Traditional Sale */}
      {showTraditionalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-3 border-[#0A0A0A] p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-[8px_8px_0px_#0A0A0A]">
            <div className="w-12 h-12 bg-red-100 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-[#0A0A0A]">
              Are you sure you want to sell your SOL?
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Selling {calc.formattedUnits} SOL locks in a taxable event and permanently gives away future bull run upside. ZeroSell Pay lets you pay the exact same ${activeInvoice.usdcAmount.toFixed(2)} USDC while keeping your SOL!
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowTraditionalModal(false);
                  setModalOpen(true);
                }}
                className="flex-1 py-3 bg-[#9945FF] text-white text-xs font-black uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#0A0A0A] cursor-pointer"
              >
                Use ZeroSell Instead
              </button>
              <button
                onClick={() => setShowTraditionalModal(false)}
                className="py-3 px-5 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs font-bold uppercase hover:bg-[#F8FAF9] shadow-[2px_2px_0px_#0A0A0A] cursor-pointer"
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
