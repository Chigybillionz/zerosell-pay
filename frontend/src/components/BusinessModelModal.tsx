import React, { useState } from "react";
import {
  X,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Percent,
  Coins,
  ArrowRight,
  Layers,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Building2,
  Users,
  Zap,
} from "lucide-react";

interface BusinessModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessModelModal: React.FC<BusinessModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"revenue" | "comparison" | "risk">("revenue");
  const [volumeEstimate, setVolumeEstimate] = useState<number>(1000000); // $1M monthly GMV

  if (!isOpen) return null;

  // Monthly revenue calculations based on volume slider
  const originationRevenue = volumeEstimate * 0.005; // 0.5%
  const merchantRevenue = volumeEstimate * 0.005; // 0.5%
  const totalMonthlyRev = originationRevenue + merchantRevenue;
  const annualRunRate = totalMonthlyRev * 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border-3 border-[#0A0A0A] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#0A0A0A] overflow-hidden my-auto text-[#0A0A0A]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b-2 border-[#0A0A0A] bg-[#F8FAF9] flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-[#14F195] border border-[#0A0A0A] text-[11px] font-mono font-black uppercase text-[#0A0A0A]">
              <Briefcase className="w-3.5 h-3.5" />
              <span>ZeroSell Pay Unit Economics &amp; Strategy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">
              Business Model &amp; Risk Architecture
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium">
              How ZeroSell generates sustainable protocol revenue while managing downside volatility.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 border-2 border-[#0A0A0A] bg-white hover:bg-neutral-100 text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer"
            aria-label="Close Business Model Modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b-2 border-[#0A0A0A] bg-white text-xs font-black uppercase">
          <button
            onClick={() => setActiveTab("revenue")}
            className={`flex-1 py-3 px-4 border-r-2 border-[#0A0A0A] transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === "revenue"
                ? "bg-[#9945FF] text-white"
                : "bg-white text-[#0A0A0A] hover:bg-[#F8FAF9]"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>1. Revenue Engines</span>
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`flex-1 py-3 px-4 border-r-2 border-[#0A0A0A] transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === "comparison"
                ? "bg-[#9945FF] text-white"
                : "bg-white text-[#0A0A0A] hover:bg-[#F8FAF9]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. ZeroSell vs. Stripe / Visa</span>
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`flex-1 py-3 px-4 transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === "risk"
                ? "bg-[#9945FF] text-white"
                : "bg-white text-[#0A0A0A] hover:bg-[#F8FAF9]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Price Drops &amp; Liquidation</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* TAB 1: REVENUE ENGINES */}
          {activeTab === "revenue" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Engine 1 */}
                <div className="p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] space-y-3">
                  <div className="w-9 h-9 bg-[#14F195] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                    <Percent className="w-5 h-5 text-[#0A0A0A] stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-black uppercase text-[#0A0A0A]">
                    Loan Origination Fee
                  </h4>
                  <div className="text-xs font-mono font-bold text-[#9945FF]">
                    0.30% – 0.50% Flat
                  </div>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    Charged when the borrower locks collateral to settle an invoice. Paid in USDC upon debt repayment directly to the protocol treasury.
                  </p>
                </div>

                {/* Engine 2 */}
                <div className="p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] space-y-3">
                  <div className="w-9 h-9 bg-[#9945FF] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-black uppercase text-[#0A0A0A]">
                    Merchant Settlement Fee
                  </h4>
                  <div className="text-xs font-mono font-bold text-[#9945FF]">
                    0.50% vs 2.9% Visa
                  </div>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    Merchants pay 0.5% for sub-second, non-custodial settlement in pristine USDC. ZeroSell saves merchants over 75% compared to Stripe or PayPal.
                  </p>
                </div>

                {/* Engine 3 */}
                <div className="p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] space-y-3">
                  <div className="w-9 h-9 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                    <Coins className="w-5 h-5 text-[#0A0A0A] stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-black uppercase text-[#0A0A0A]">
                    Liquidity Spread &amp; Yield
                  </h4>
                  <div className="text-xs font-mono font-bold text-[#9945FF]">
                    1.50% Net Platform Spread
                  </div>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    Passive USDC providers earn 6%–8% APY on idle capital while borrowers pay low APR on long-duration vaults, generating recurring net margin.
                  </p>
                </div>
              </div>

              {/* Interactive Revenue Projection Calculator */}
              <div className="p-5 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#0A0A0A] pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                    Interactive GMV &amp; Protocol Revenue Calculator
                  </span>
                  <span className="text-xs font-mono font-bold text-[#9945FF]">
                    Monthly GMV: ${(volumeEstimate).toLocaleString()} USDC
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-neutral-600">
                    <span>$100k / mo (Early Devnet)</span>
                    <span>$1M / mo (Launch Target)</span>
                    <span>$10M / mo (Scale)</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="100000"
                    value={volumeEstimate}
                    onChange={(e) => setVolumeEstimate(parseFloat(e.target.value))}
                    className="w-full accent-[#9945FF] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-[#F8FAF9] border border-[#0A0A0A]">
                    <span className="text-[10px] font-bold uppercase text-neutral-500 block">Origination (0.5%)</span>
                    <span className="text-sm font-mono font-black text-[#0A0A0A]">${originationRevenue.toLocaleString()} /mo</span>
                  </div>
                  <div className="p-3 bg-[#F8FAF9] border border-[#0A0A0A]">
                    <span className="text-[10px] font-bold uppercase text-neutral-500 block">Merchant Fee (0.5%)</span>
                    <span className="text-sm font-mono font-black text-[#0A0A0A]">${merchantRevenue.toLocaleString()} /mo</span>
                  </div>
                  <div className="p-3 bg-[#14F195]/30 border border-[#0A0A0A]">
                    <span className="text-[10px] font-bold uppercase text-neutral-700 block">Monthly Revenue</span>
                    <span className="text-sm font-mono font-black text-[#0A0A0A]">${totalMonthlyRev.toLocaleString()} /mo</span>
                  </div>
                  <div className="p-3 bg-[#9945FF] text-white border border-[#0A0A0A]">
                    <span className="text-[10px] font-bold uppercase text-white/80 block">Annual Run Rate (ARR)</span>
                    <span className="text-sm font-mono font-black text-white">${annualRunRate.toLocaleString()} /yr</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPETITIVE COMPARISON */}
          {activeTab === "comparison" && (
            <div className="space-y-4 animate-fade-in">
              <div className="overflow-x-auto border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0A0A0A] text-white uppercase font-black tracking-wider">
                      <th className="p-3 border-r border-neutral-700">Metric</th>
                      <th className="p-3 bg-[#9945FF] text-white border-r border-[#0A0A0A]">⚡ ZeroSell Pay</th>
                      <th className="p-3 border-r border-neutral-700">Stripe / Visa</th>
                      <th className="p-3 border-r border-neutral-700">BNPL (Klarna/Affirm)</th>
                      <th className="p-3">Selling on DEX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#0A0A0A] font-medium">
                    <tr className="bg-white">
                      <td className="p-3 font-bold uppercase">Merchant Fee</td>
                      <td className="p-3 font-mono font-black text-[#9945FF] bg-[#9945FF]/10 border-r border-[#0A0A0A]">0.50%</td>
                      <td className="p-3 font-mono border-r border-neutral-200">2.9% + $0.30</td>
                      <td className="p-3 font-mono border-r border-neutral-200">5.99% + $0.30</td>
                      <td className="p-3 font-mono">0.30% swap fee</td>
                    </tr>
                    <tr className="bg-[#F8FAF9]">
                      <td className="p-3 font-bold uppercase">Buyer Gas / Network Fee</td>
                      <td className="p-3 font-mono font-black text-[#14F195] bg-[#9945FF]/10 border-r border-[#0A0A0A]">$0.00 (Gasless Relayer)</td>
                      <td className="p-3 font-mono border-r border-neutral-200">Free</td>
                      <td className="p-3 font-mono border-r border-neutral-200">Free (Interest on late)</td>
                      <td className="p-3 font-mono">$0.01 – $5.00+ Gas</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-bold uppercase">Settlement Time</td>
                      <td className="p-3 font-mono font-black text-[#0A0A0A] bg-[#9945FF]/10 border-r border-[#0A0A0A]">~400ms (Instant USDC)</td>
                      <td className="p-3 font-mono border-r border-neutral-200">2–3 Business Days</td>
                      <td className="p-3 font-mono border-r border-neutral-200">Weekly Payouts</td>
                      <td className="p-3 font-mono">Instant Crypto</td>
                    </tr>
                    <tr className="bg-[#F8FAF9]">
                      <td className="p-3 font-bold uppercase">Capital Gains Tax</td>
                      <td className="p-3 font-mono font-black text-[#14F195] bg-[#9945FF]/10 border-r border-[#0A0A0A]">0% (Non-taxable loan)</td>
                      <td className="p-3 font-mono border-r border-neutral-200">N/A (Fiat)</td>
                      <td className="p-3 font-mono border-r border-neutral-200">N/A (Fiat)</td>
                      <td className="p-3 font-mono text-red-600 font-bold">Taxable Disposal Event</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-bold uppercase">Asset Upside Retained</td>
                      <td className="p-3 font-mono font-black text-[#14F195] bg-[#9945FF]/10 border-r border-[#0A0A0A]">100% of future gains</td>
                      <td className="p-3 font-mono border-r border-neutral-200">0%</td>
                      <td className="p-3 font-mono border-r border-neutral-200">0%</td>
                      <td className="p-3 font-mono text-red-600 font-bold">0% (Permanently lost)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT HAPPENS WHEN PRICES GO DOWN? */}
          {activeTab === "risk" && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-yellow-50 border-2 border-yellow-600 shadow-[3px_3px_0px_#0A0A0A] space-y-2">
                <div className="flex items-center space-x-2 text-yellow-800 font-black uppercase text-xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  <span>The Core Question: "What happens if SOL crashes after I lock it?"</span>
                </div>
                <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                  ZeroSell uses overcollateralization (50% initial LTV) and Pyth Hermes real-time price feeds. The protocol and the borrower are protected by an automated liquidation buffer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Scenario 1: Price Rallies */}
                <div className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#14F195] bg-[#0A0A0A] px-2 py-0.5">Bull Market</span>
                    <span className="text-xs font-bold text-green-700">+50% to +500%</span>
                  </div>
                  <h5 className="font-black text-xs uppercase text-[#0A0A0A]">SOL Rallies Up</h5>
                  <p className="text-[11px] text-neutral-600 font-medium">
                    LTV drops to 25% or 10%. Collateral value expands. Borrower repays the fixed USDC debt and takes back 100% of the appreciated SOL.
                  </p>
                </div>

                {/* Scenario 2: Normal Price Dip */}
                <div className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-yellow-500 bg-[#0A0A0A] px-2 py-0.5">Mild Dip</span>
                    <span className="text-xs font-bold text-yellow-700">-1% to -33.3%</span>
                  </div>
                  <h5 className="font-black text-xs uppercase text-[#0A0A0A]">Normal Volatility</h5>
                  <p className="text-[11px] text-neutral-600 font-medium">
                    LTV rises from 50% to 70%. Dashboard gauge turns yellow. <strong>Zero liquidation occurs.</strong> Borrower has plenty of time to repay or wait for recovery.
                  </p>
                </div>

                {/* Scenario 3: Heavy Crash */}
                <div className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-red-400 bg-[#0A0A0A] px-2 py-0.5">Crash Event</span>
                    <span className="text-xs font-bold text-red-700">&gt; -33.3% Drop</span>
                  </div>
                  <h5 className="font-black text-xs uppercase text-[#0A0A0A]">75% LTV Breached</h5>
                  <p className="text-[11px] text-neutral-600 font-medium">
                    Smart contract liquidator settles the vault in USDC with a 5% liquidator bonus. The protocol pool remains 100% solvent.
                  </p>
                </div>
              </div>

              {/* Crucial non-recourse highlight */}
              <div className="p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] space-y-2">
                <span className="text-xs font-black uppercase text-[#9945FF] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Crucial User Protection: Non-Recourse DeFi Debt</span>
                </span>
                <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                  Even in a severe market crash where the vault is liquidated, <strong>the borrower NEVER owes additional money</strong>. They already received their purchased goods or services from the merchant! There are no credit score impacts, no collection agencies, and no ongoing liabilities.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-[#0A0A0A] bg-[#F8FAF9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono font-bold text-neutral-600">
            Anchor Program ID: <span className="text-[#0A0A0A]">3TKiwr...4ddZDv</span> • Devnet Verified
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0A0A0A] text-white hover:bg-neutral-800 text-xs font-black uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer"
          >
            Close &amp; Resume Live Demo
          </button>
        </div>
      </div>
    </div>
  );
};
