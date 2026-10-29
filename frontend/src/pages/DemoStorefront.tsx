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
  Flame,
  CheckCircle,
  HelpCircle,
  Clock,
  Coins,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Announcement Banner */}
      <div className="relative mb-10 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-gray-900/60 to-purple-950/30 border border-emerald-500/20 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dev3pack Solana Hackathon Track: Best App Overall</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ZeroSell Pay Interactive Merchant Demo
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Spend your crypto and tokenized equities without selling a single share. One-click atomic collateral locking with Pyth Pull Oracles & Gasless Relayer sponsorship.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-gray-900/80 p-2 rounded-2xl border border-gray-800 self-stretch sm:self-auto">
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                Initial LTV
              </span>
              <span className="text-lg font-mono font-extrabold text-emerald-400">
                50.0%
              </span>
            </div>
            <div className="w-[1px] h-8 bg-gray-800" />
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                Gas Sponsored
              </span>
              <span className="text-lg font-mono font-extrabold text-purple-400">
                100% Free
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Selector Pills */}
      <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
          Select Mock Invoice:
        </span>
        {DEMO_INVOICES.map((inv) => (
          <button
            key={inv.id}
            onClick={() => setSelectedInvoice(inv)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              selectedInvoice.id === inv.id
                ? "bg-emerald-500 text-black font-bold shadow-glow"
                : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800"
            }`}
          >
            {inv.title} (${inv.usdcAmount} USDC)
          </button>
        ))}
      </div>

      {/* Main Checkout Experience Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Merchant Invoice Bill */}
        <div className="lg:col-span-7 bg-[#111827]/90 rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative">
          <div className="flex items-center justify-between pb-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Server className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {selectedInvoice.category}
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  {selectedInvoice.title}
                </h2>
                <p className="text-xs text-gray-400">
                  Billed by {selectedInvoice.vendorName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-400 font-mono">Invoice #{selectedInvoice.id}</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                ${selectedInvoice.usdcAmount.toFixed(2)}
                <span className="text-xs text-gray-400 ml-1 font-sans">USDC</span>
              </div>
            </div>
          </div>

          {/* Description & Itemized details */}
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80">
              <span className="text-xs text-gray-400 uppercase font-semibold">
                Service Specification
              </span>
              <p className="text-sm text-gray-200 mt-1 leading-relaxed">
                {selectedInvoice.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-950/40 rounded-xl border border-gray-800/60">
                <span className="text-gray-400 block">Merchant Recipient</span>
                <span className="font-mono text-gray-200 font-medium">
                  {selectedInvoice.merchantPubkey.slice(0, 8)}...{selectedInvoice.merchantPubkey.slice(-6)}
                </span>
              </div>
              <div className="p-3 bg-gray-950/40 rounded-xl border border-gray-800/60">
                <span className="text-gray-400 block">Payment Terms</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Instant On-Chain Settlement</span>
                </span>
              </div>
            </div>
          </div>

          {/* Live Pyth Oracle Guarantee Badge */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Pyth Hermes Live Price:</span>
              <span className="font-mono font-bold text-emerald-400">
                1 SOL = ${solPrice.toFixed(2)} USD
              </span>
            </div>
            <span className="text-[11px] text-gray-500">Sub-second Devnet Pull</span>
          </div>
        </div>

        {/* Right Side: The Two Payment Choices */}
        <div className="lg:col-span-5 space-y-5">
          {/* Choice 1: ZeroSell Pay (HIGHLIGHTED & GLOWING) */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-gray-900 to-[#101726] border-2 border-emerald-500/50 shadow-glow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-black shadow-md flex items-center space-x-1">
                <Zap className="w-3 h-3 fill-black" />
                <span>Recommended Choice</span>
              </span>
              <span className="text-xs text-emerald-400 font-bold">0% Gas • 50% LTV</span>
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Pay with ZeroSell Pay
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              Lock ~{calc.formattedUnits} SOL in your personal non-custodial Vault. Disburses ${selectedInvoice.usdcAmount} USDC directly to the merchant.
            </p>

            {/* Quick Metrics in Button Card */}
            <div className="my-4 p-3 bg-gray-950/70 rounded-xl border border-gray-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Collateral Required:</span>
                <span className="font-mono font-bold text-gray-100">
                  {calc.formattedUnits} SOL (${calc.collateralValueUsd.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Upside Preserved:</span>
                <span className="font-semibold text-emerald-400">
                  100% of future gains
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Relayer Gas Sponsorship:</span>
                <span className="font-semibold text-purple-400">FREE ($0.00)</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:opacity-95 active:scale-95 text-black font-black text-sm shadow-glow flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Pay ${selectedInvoice.usdcAmount} USDC (Keep SOL)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Choice 2: Traditional Selling (MUTED / DISCOURAGED) */}
          <div className="p-6 rounded-3xl bg-gray-900/40 border border-gray-800 text-gray-400 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Traditional Method
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                Loss of Upside
              </span>
            </div>

            <h4 className="text-base font-bold text-gray-300">
              Sell Assets for USDC
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Swap your SOL on a DEX or CEX to pay the merchant.
            </p>

            <div className="my-3 text-xs space-y-1 text-gray-400">
              <div className="flex items-center space-x-1.5 text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Triggers immediate capital gains taxable event</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-400">
                <span>• Forfeits long-term SOL/NVDA upside forever</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-400">
                <span>• DEX swap slippage & taker fee (0.30% - 0.50%)</span>
              </div>
            </div>

            <button
              onClick={() => setShowTraditionalModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-gray-200 text-xs font-semibold transition-colors"
            >
              Pay ${selectedInvoice.usdcAmount} USDC (Sell SOL)
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Feature Table */}
      <div className="mt-16 pt-10 border-t border-gray-800/80">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="text-xl font-extrabold text-white">
            Why Freelancers & Savers Choose ZeroSell Pay
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Compare selling crypto versus borrowing against it atomically at point-of-sale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-gray-100">
              Never Sell the Bottom
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              When you pay rent or cloud bills, you normally liquidate appreciating SOL. With ZeroSell, your SOL stays in your vault, capturing 100% of future bull run multiple expansions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-base font-bold text-gray-100">
              0% Taxable Dispositions
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Taking a loan against collateral is not considered a taxable disposal under most jurisdictions worldwide. Avoid accounting nightmares and capital gains headaches.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="text-base font-bold text-gray-100">
              Zero Gas Friction
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Our Node.js Relayer sponsors transaction fees as `feePayer`. Even if a user’s balance is strictly in tokenized stocks (NVDAx) or JUP, they can transact without extra SOL gas.
            </p>
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

      {/* Warning popup if user clicks traditional sell */}
      {showTraditionalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/30 p-6 rounded-3xl max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Are you sure you want to sell your SOL?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              By selling {calc.formattedUnits} SOL today, you lock in a taxable event and miss out on potential price appreciation. ZeroSell Pay lets you pay the exact same ${selectedInvoice.usdcAmount} USDC while keeping 100% of your SOL!
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowTraditionalModal(false);
                  setModalOpen(true);
                }}
                className="flex-1 py-3 bg-emerald-500 text-black text-xs font-bold rounded-xl shadow-glow hover:bg-emerald-400"
              >
                Use ZeroSell Instead
              </button>
              <button
                onClick={() => setShowTraditionalModal(false)}
                className="py-3 px-4 bg-gray-800 text-gray-400 text-xs font-medium rounded-xl hover:text-white"
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

