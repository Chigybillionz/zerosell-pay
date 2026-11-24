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
    <section className="relative w-full min-h-[90vh] flex flex-col justify-between pt-16 pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden bg-[#F8FAF9] text-[#0A0A0A] border-b-2 border-[#0A0A0A]">
      {/* 1. Cinematic Background with Atmospheric Nebulas and 3D Luminous Ribbon */}
      <HeroRibbon />

      {/* 2. Main Hero Content (Left-aligned, massive editorial typography) */}
      <div className="relative z-10 max-w-5xl pt-10 sm:pt-16 lg:pt-20 space-y-8">
        {/* Editorial Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-black tracking-tight text-[#0A0A0A] leading-[1.05] uppercase">
          The liquidity layer <br className="hidden sm:inline" />
          for every asset on earth.
        </h1>

        {/* Lightweight Secondary Description */}
        <p className="text-base sm:text-lg md:text-xl text-[#0A0A0A] font-medium max-w-2xl leading-relaxed tracking-wide">
          ZeroSell is the high-performance non-custodial protocol powering collateralized payments on Solana. Settle merchants in USDC instantly, while keeping 100% of your long-term asset upside.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Primary CTA (Signature vivid violet button with sharp geometry and hard shadow) */}
          <button
            onClick={onGetStartedClick}
            className="group flex items-center space-x-3 px-7 py-4 bg-[#9945FF] text-white font-extrabold uppercase tracking-wider text-sm border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
          >
            <span>Get started</span>
            <div className="w-6 h-6 bg-[#0A0A0A] text-white flex items-center justify-center border border-[#0A0A0A] group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </button>

          {/* Secondary CTA (Pure white card with hard shadow) */}
          <button
            onClick={onExploreVaultsClick}
            className="flex items-center space-x-2 px-7 py-4 bg-[#FFFFFF] hover:bg-[#F8FAF9] border-2 border-[#0A0A0A] text-[#0A0A0A] text-sm font-extrabold uppercase tracking-wider shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
          >
            <span>View Vault Dashboard</span>
          </button>
        </div>
      </div>

      {/* 3. Floating Announcement Card (Bottom-Left) */}
      <div className="relative z-10 pt-16 sm:pt-20">
        <div className="max-w-md p-4 bg-[#FFFFFF] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] flex items-center space-x-4">
          {/* Graphic Thumbnail */}
          <div className="w-20 h-20 overflow-hidden border-2 border-[#0A0A0A] shrink-0 bg-white p-1 shadow-[2px_2px_0px_#0A0A0A]">
            <img
              src="/zerosell-logo.jpg"
              alt="Zero Sell Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Text & Compact CTA */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-black text-[#0A0A0A] uppercase tracking-wide truncate">
                Dev3pack Flagship Protocol
              </h4>
              <span className="px-1.5 py-0.5 bg-[#14F195] text-[#0A0A0A] text-[9px] font-black uppercase border border-[#0A0A0A] shrink-0">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#0A0A0A] leading-snug line-clamp-2 font-medium">
              Atomic collateralized credit lines on Solana Devnet with Pyth Hermes Pull Oracles.
            </p>
            <div className="pt-0.5">
              <a
                href="https://github.com/Chigybillionz/zerosell-pay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#0A0A0A] text-white text-[11px] font-bold uppercase border-2 border-[#0A0A0A] hover:bg-[#9945FF] transition-colors"
              >
                <span>View Smart Contract</span>
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
