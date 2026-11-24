import React from "react";
import { Zap, Github, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface CinematicFooterProps {
  onLaunchClick: () => void;
}

export const CinematicFooter: React.FC<CinematicFooterProps> = ({ onLaunchClick }) => {
  return (
    <footer className="w-full bg-[#F8FAF9] text-[#0A0A0A] border-t-2 border-[#0A0A0A] relative overflow-hidden">
      {/* 1. Final Conversion CTA Banner */}
      <div className="py-20 px-4 sm:px-6 lg:px-12 relative z-10 border-b-2 border-[#0A0A0A]">
        <div className="max-w-5xl mx-auto p-10 sm:p-16 bg-[#9945FF] border-3 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] text-center space-y-6 relative overflow-hidden text-white">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            Start spending assets <br className="hidden sm:inline" />
            without selling.
          </h2>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-medium leading-relaxed">
            Experience zero-tax, zero-slippage collateralized payments on Solana. Instant settlement for merchants, full upside for you.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={onLaunchClick}
              className="group flex items-center space-x-3 px-7 py-4 bg-white hover:bg-neutral-100 text-[#0A0A0A] font-black uppercase text-sm border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
            >
              <span>Launch Demo Storefront</span>
              <div className="w-6 h-6 bg-[#0A0A0A] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </div>
            </button>

            <Link
              to="/dashboard"
              className="px-6 py-4 bg-[#0A0A0A] hover:bg-neutral-800 text-white text-sm font-black uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer inline-flex items-center"
            >
              Open Vault Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Editorial Multi-Column Link Navigation */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-xs">
        {/* Brand Info */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] shrink-0 bg-white p-0.5">
              <img
                src="/zerosell-logo.jpg"
                alt="Zero Sell"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#0A0A0A] text-sm uppercase tracking-tight font-sans">
                Zero <span className="text-[#9945FF]">Sell</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-600 font-bold">
                Spend Without Selling
              </span>
            </div>
          </div>
          <p className="text-neutral-600 leading-relaxed text-[11px] font-medium">
            Atomic, non-custodial collateralized payment protocol on Solana. Dev3pack Track: Best App Overall.
          </p>
          <div className="flex items-center space-x-2 pt-1 text-[11px] font-mono font-bold text-[#0A0A0A]">
            <span className="w-2 h-2 bg-[#14F195] border border-[#0A0A0A]" />
            <span>Devnet Network Active</span>
          </div>
        </div>

        {/* Column 1: Ecosystem */}
        <div className="space-y-3">
          <span className="font-black text-[#0A0A0A] uppercase tracking-wider text-[11px] block">
            Ecosystem
          </span>
          <ul className="space-y-2 text-neutral-600 font-medium">
            <li>
              <Link to="/checkout" className="hover:text-black hover:underline transition-colors">
                Demo Storefront
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-black hover:underline transition-colors">
                Vault Credit Lines
              </Link>
            </li>
            <li>
              <Link to="/merchant" className="hover:text-black hover:underline transition-colors">
                Merchant Invoicing &amp; Blinks
              </Link>
            </li>
            <li>
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black hover:underline transition-colors flex items-center space-x-1"
              >
                <span>Solana Devnet Faucet</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Protocol Architecture */}
        <div className="space-y-3">
          <span className="font-black text-[#0A0A0A] uppercase tracking-wider text-[11px] block">
            Architecture
          </span>
          <ul className="space-y-2 text-neutral-600 font-medium">
            <li>
              <span>Anchor Framework v0.30.1</span>
            </li>
            <li>
              <span>Pyth Hermes Pull Oracles</span>
            </li>
            <li>
              <span>Gasless Relayer Sponsoring</span>
            </li>
            <li>
              <span>Non-Custodial PDA Isolation</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Developers & Code */}
        <div className="space-y-3">
          <span className="font-black text-[#0A0A0A] uppercase tracking-wider text-[11px] block">
            Developers
          </span>
          <ul className="space-y-2 text-neutral-600 font-medium">
            <li>
              <a
                href="https://github.com/Chigybillionz/zerosell-pay"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black hover:underline transition-colors flex items-center space-x-1"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Source</span>
              </a>
            </li>
            <li>
              <span className="font-mono text-neutral-500 font-bold">Program: 3TKiwr...4ddZDv</span>
            </li>
            <li>
              <a
                href="https://solana.com/developers/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black hover:underline transition-colors flex items-center space-x-1"
              >
                <span>Solana Actions Spec</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="border-t-2 border-[#0A0A0A] py-6 px-4 sm:px-6 lg:px-12 text-neutral-600 text-[11px] font-medium bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} ZeroSell Protocol. Open-source under MIT License.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-black hover:underline transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-black hover:underline transition-colors cursor-pointer">Terms of Protocol</span>
            <span>•</span>
            <span className="hover:text-black hover:underline transition-colors cursor-pointer">Risk Disclaimers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
