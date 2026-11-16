import React from "react";
import { ArrowRight, ShieldCheck, Zap, Sparkles, ExternalLink, Code2 } from "lucide-react";
import { HeroRibbon } from "./HeroRibbon.js";

interface HeroSectionProps {
  onGetStartedClick: () => void;
  onExploreVaultsClick: () => void;
  solPrice: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStartedClick,
  onExploreVaultsClick,
  solPrice,
}) => {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-between pt-16 pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden bg-black text-white">
      {/* 1. Cinematic Background with Atmospheric Nebulas and 3D Luminous Ribbon */}
      <HeroRibbon />

      {/* 2. Main Hero Content (Left-aligned, massive editorial typography) */}
      <div className="relative z-10 max-w-5xl pt-10 sm:pt-16 lg:pt-20 space-y-8">
        {/* Editorial Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-tight text-white leading-[1.05]">
          The liquidity layer <br className="hidden sm:inline" />
          for every asset on earth.
        </h1>

        {/* Lightweight Secondary Description */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 font-normal max-w-2xl leading-relaxed tracking-wide">
          ZeroSell is the high-performance non-custodial protocol powering collateralized payments on Solana. Settle merchants in USDC instantly, while keeping 100% of your long-term asset upside.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Primary CTA (Signature white pill with circular arrow icon) */}
          <button
            onClick={onGetStartedClick}
            className="group flex items-center space-x-3 px-6 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl cursor-pointer"
          >
            <span>Get started</span>
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </button>

          {/* Secondary CTA (Subtle translucent pill) */}
          <button
            onClick={onExploreVaultsClick}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-full bg-[#161224]/80 hover:bg-[#201a33] border border-[#33224d] text-gray-200 text-sm font-semibold backdrop-blur-md transition-all cursor-pointer"
          >
            <span>View Vault Dashboard</span>
          </button>
        </div>
      </div>

      {/* 3. Floating Announcement Card (Bottom-Left, directly matching Solana's Breakpoint card) */}
      <div className="relative z-10 pt-16 sm:pt-20">
        <div className="max-w-md p-3.5 sm:p-4 rounded-2xl bg-[#181126]/90 border border-[#3e2462] shadow-2xl backdrop-blur-xl flex items-center space-x-4 group hover:border-[#5a348f] transition-all">
          {/* Graphic Thumbnail */}
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#4d2d7a] shrink-0 bg-black shadow-lg">
            <img
              src="/zerosell-logo.jpg"
              alt="ZeroSell Pay Logo"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform"
            />
          </div>

          {/* Text & Compact CTA */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white truncate">
                Dev3pack Flagship Protocol
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">
              Atomic collateralized credit lines on Solana Devnet with Pyth Hermes Pull Oracles.
            </p>
            <div className="pt-0.5">
              <a
                href="https://github.com/Chigybillionz/zerosell-pay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-semibold hover:bg-neutral-900 border border-neutral-800 transition-colors"
              >
                <span>View Smart Contract</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
