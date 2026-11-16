import React from "react";
import { Zap, Github, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface CinematicFooterProps {
  onLaunchClick: () => void;
}

export const CinematicFooter: React.FC<CinematicFooterProps> = ({ onLaunchClick }) => {
  return (
    <footer className="w-full bg-black text-white border-t border-white/[0.08] relative overflow-hidden">
      {/* 1. Final Conversion CTA Banner */}
      <div className="py-24 px-4 sm:px-6 lg:px-12 relative z-10 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto rounded-3xl p-10 sm:p-16 bg-gradient-to-tr from-[#160d2e] via-[#0d081b] to-black border border-[#3b2061] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-24 w-96 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Start spending assets <br className="hidden sm:inline" />
            without selling.
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
            Experience zero-tax, zero-slippage collateralized payments on Solana. Instant settlement for merchants, full upside for you.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={onLaunchClick}
              className="group flex items-center space-x-3 px-7 py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            >
              <span>Launch Demo Storefront</span>
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <Link
              to="/dashboard"
              className="px-6 py-4 rounded-full bg-[#181229] hover:bg-[#22183b] border border-[#3c255e] text-gray-200 text-sm font-semibold transition-all cursor-pointer"
            >
              Open Vault Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Editorial Multi-Column Link Navigation (Matching Solana's footer structure) */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-xs">
        {/* Brand Info */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
              <img
                src="/zerosell-logo.jpg"
                alt="ZeroSell Pay Emblem"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm tracking-tight font-mono">
                ZeroSell <span className="text-[#14F195]">Pay</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                Spend Without Selling
              </span>
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed text-[11px]">
            Atomic, non-custodial collateralized payment protocol on Solana. Dev3pack Track: Best App Overall.
          </p>
          <div className="flex items-center space-x-2 pt-1 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Devnet Network Active</span>
          </div>
        </div>

        {/* Column 1: Ecosystem */}
        <div className="space-y-3">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Ecosystem
          </span>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/checkout" className="hover:text-white transition-colors">
                Demo Storefront
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Vault Credit Lines
              </Link>
            </li>
            <li>
              <Link to="/merchant" className="hover:text-white transition-colors">
                Merchant Invoicing &amp; Blinks
              </Link>
            </li>
            <li>
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Solana Devnet Faucet</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Protocol Architecture */}
        <div className="space-y-3">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Architecture
          </span>
          <ul className="space-y-2 text-gray-400">
            <li>
              <span className="text-gray-300">Anchor Framework v0.30.1</span>
            </li>
            <li>
              <span className="text-gray-300">Pyth Hermes Pull Oracles</span>
            </li>
            <li>
              <span className="text-gray-300">Gasless Relayer Sponsoring</span>
            </li>
            <li>
              <span className="text-gray-300">Non-Custodial PDA Isolation</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Developers & Code */}
        <div className="space-y-3">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Developers
          </span>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a
                href="https://github.com/Chigybillionz/zerosell-pay"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Source</span>
              </a>
            </li>
            <li>
              <span className="font-mono text-gray-500">Program: 3TKiwr...4ddZDv</span>
            </li>
            <li>
              <a
                href="https://solana.com/developers/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Solana Actions Spec</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="border-t border-white/[0.08] py-6 px-4 sm:px-6 lg:px-12 text-gray-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} ZeroSell Protocol. Open-source under MIT License.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-gray-400 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 transition-colors">Terms of Protocol</span>
            <span>•</span>
            <span className="hover:text-gray-400 transition-colors">Risk Disclaimers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
