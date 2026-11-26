import React from "react";
import {
  Briefcase,
  TrendingUp,
  Building2,
  Percent,
  Coins,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface BusinessModelSectionProps {
  onOpenModal: () => void;
}

export const BusinessModelSection: React.FC<BusinessModelSectionProps> = ({
  onOpenModal,
}) => {
  return (
    <section id="business-model" className="py-24 px-4 sm:px-6 lg:px-12 bg-white text-[#0A0A0A] border-b-2 border-[#0A0A0A] relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#0A0A0A] pb-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#14F195] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-xs font-mono font-black uppercase text-[#0A0A0A]">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Protocol Economics &amp; Business Model</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#0A0A0A] leading-tight">
              Built for Sustainable Protocol Revenue.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
              ZeroSell is a fee-generating DeFi commerce infrastructure. We monetize every transaction without charging buyers punitive interest or gas fees.
            </p>
          </div>

          <button
            onClick={onOpenModal}
            className="px-5 py-3.5 bg-[#9945FF] hover:bg-[#8935ef] active:translate-x-[2px] active:translate-y-[2px] text-white font-black text-xs uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>Launch Economics &amp; Risk Calculator</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 3 Core Revenue Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#14F195] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                <Percent className="w-5 h-5 text-[#0A0A0A] stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-[#0A0A0A]">
                1. Origination Fee
              </h3>
              <div className="text-xs font-mono font-black text-[#9945FF]">
                0.30% – 0.50% per Checkout
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Charged when the borrower locks collateral to settle an invoice. Paid in USDC upon debt repayment directly into the ZeroSell protocol treasury.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-300 text-[11px] font-mono text-neutral-500 font-bold">
              $10M Vol → $50,000 / mo Revenue
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#9945FF] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-[#0A0A0A]">
                2. Merchant Settlement
              </h3>
              <div className="text-xs font-mono font-black text-[#9945FF]">
                0.50% vs. 2.9% Visa / Stripe
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Merchants pay 0.50% for instant, non-custodial USDC settlement in 400ms. ZeroSell saves merchants 75% compared to credit cards while capturing recurring volume fees.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-300 text-[11px] font-mono text-neutral-500 font-bold">
              Saves Merchants 75% in Fees
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                <Coins className="w-5 h-5 text-[#0A0A0A] stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black uppercase text-[#0A0A0A]">
                3. Liquidity Spread
              </h3>
              <div className="text-xs font-mono font-black text-[#9945FF]">
                1.50% Net Platform Spread
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Passive liquidity providers earn 6%–8% APY on idle USDC pools. The protocol captures a 1.5% net interest margin on active loan balances.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-300 text-[11px] font-mono text-neutral-500 font-bold">
              Recurring Capital Yield
            </div>
          </div>
        </div>

        {/* Downside Risk & Price Crash Explanation (Answering the Judge Question) */}
        <div className="p-8 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0A0A0A] pb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-neutral-600 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                <span>Risk Management &amp; Invariant Security</span>
              </div>
              <h3 className="text-2xl font-black uppercase text-[#0A0A0A]">
                What Happens When Crypto Prices Crash?
              </h3>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-3 py-1 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-[#0A0A0A]">
              50% Initial LTV • 75% Liquidation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-neutral-500 block">
                1. 33.3% Crash Buffer
              </span>
              <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                Because loans originate at <strong>50% LTV (200% collateralized)</strong>, SOL price must fall by more than <strong>33.3%</strong> before any liquidation is triggered.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-neutral-500 block">
                2. Real-Time Pyth Oracles
              </span>
              <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                Pyth Hermes price feeds continuously update position health. The user dashboard displays live green, yellow, and red gauges so borrowers can repay or monitor risk.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-[#9945FF] block">
                3. Non-Recourse Debt Protection
              </span>
              <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                If liquidated, the vault is settled to repay the pool with a 5% liquidator bonus. <strong>The borrower owes nothing extra</strong> and keeps their purchased goods!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
