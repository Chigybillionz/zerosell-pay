import React from "react";
import { ShieldCheck, TrendingUp, Zap, Sparkles, Lock, ArrowRight, Layers, Coins } from "lucide-react";

export const ProtocolFeaturesSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-12 bg-black text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs uppercase font-bold tracking-widest text-purple-400">
            <span>// ARCHITECTURE &amp; CAPABILITIES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Engineered for high-velocity internet capital.
          </h2>
          <p className="text-base text-gray-400 leading-relaxed">
            ZeroSell eliminates the friction between holding wealth and spending it. Built on Solana Anchor framework with sub-second finality.
          </p>
        </div>

        {/* Feature Grid (Asymmetrical high-end composition) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Large Featured Card (Span 7) */}
          <div className="md:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#0d0917] border border-[#23153b] hover:border-[#3d2466] transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1b122f] border border-[#37235e] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Capture 100% of price rallies while paying today’s bills.
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                  When you liquidate crypto to pay invoices, you permanently surrender your asset upside. With ZeroSell, your SOL stays locked in your non-custodial Anchor vault. If SOL surges 2x, 5x, or 10x, every dollar of that profit is yours when you unlock.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center space-x-4 text-xs font-mono text-purple-300">
              <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40">
                LTV Buffer: 50%
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40">
                Upside Preserved: 100%
              </span>
            </div>
          </div>

          {/* Card 2: Secondary Card (Span 5) */}
          <div className="md:col-span-5 p-8 sm:p-10 rounded-3xl bg-[#0d0917] border border-[#23153b] hover:border-[#3d2466] transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1b122f] border border-[#37235e] flex items-center justify-center">
                <Coins className="w-6 h-6 text-cyan-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Merchants get pristine USDC instantly.
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Vendors don't want crypto price volatility. ZeroSell disburses guaranteed, pristine USDC directly to the merchant’s settlement token account in the same slot.
                </p>
              </div>
            </div>

            <div className="pt-8 text-xs font-mono text-cyan-300">
              <span>Settlement Time: ~400ms On-Chain</span>
            </div>
          </div>

          {/* Card 3: Secondary Card (Span 5) */}
          <div className="md:col-span-5 p-8 sm:p-10 rounded-3xl bg-[#0d0917] border border-[#23153b] hover:border-[#3d2466] transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1b122f] border border-[#37235e] flex items-center justify-center">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Self-custodial Anchor PDA vaults.
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  No centralized custodian holds your keys. Collateral is locked inside an isolated Program Derived Address (PDA) on Solana. Only your wallet key can unlock your collateral upon debt repayment.
                </p>
              </div>
            </div>

            <div className="pt-8 text-xs font-mono text-emerald-400">
              <span>Program ID: 3TKiwr...4ddZDv</span>
            </div>
          </div>

          {/* Card 4: Large Featured Card (Span 7) */}
          <div className="md:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#0d0917] border border-[#23153b] hover:border-[#3d2466] transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1b122f] border border-[#37235e] flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Gasless Relayer &amp; 1-Click Solana Blinks.
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                  Our Node.js Relayer sponsors transaction fees as `feePayer`. Users can check out without holding spare SOL for gas, or pay directly inside Twitter/X feeds using Solana Actions &amp; Blinks (`dial.to`).
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center space-x-4 text-xs font-mono text-amber-300">
              <span className="px-3 py-1 rounded-full bg-[#1b152b] border border-amber-900/30">
                Solana Pay QR Support
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1b152b] border border-amber-900/30">
                Dialect Blinks Spec
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
