import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePythPrices } from "../hooks/usePythPrices.js";
import { useZeroSellProgram } from "../hooks/useZeroSellProgram.js";
import {
  ShieldCheck,
  Zap,
  Droplets,
  CheckCircle2,
  ExternalLink,
  Store,
  LayoutDashboard,
  Coins,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { connected } = useWallet();
  const { solPrice, prices } = usePythPrices();
  const { requestDevnetAirdrop } = useZeroSellProgram();

  const [airdropping, setAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);

  const handleFaucet = async () => {
    if (!connected) {
      alert("Please connect your wallet first to receive Devnet SOL.");
      return;
    }
    setAirdropping(true);
    try {
      await requestDevnetAirdrop();
      setAirdropSuccess(true);
      setTimeout(() => setAirdropSuccess(false), 4000);
    } catch (err: any) {
      alert(`Faucet error: ${err.message || "Devnet rate limit"}`);
    } finally {
      setAirdropping(false);
    }
  };

  const navLinks = [
    { name: "Demo Store", path: "/checkout", icon: Store },
    { name: "Vault Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Merchant Portal", path: "/merchant", icon: Coins },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-[#0B0F19]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/checkout" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-purple-600 p-[1.5px] shadow-glow group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                ZeroSell
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Pay
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block tracking-wide">
              Spend Assets Without Selling
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-gray-900/60 p-1.5 rounded-full border border-gray-800">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === "/checkout" && location.pathname === "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-3">
          {/* Live Pyth Oracle Ticker */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-900/80 border border-gray-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-400 font-medium">Pyth SOL/USD:</span>
            <span className="font-mono font-bold text-emerald-400">
              ${solPrice.toFixed(2)}
            </span>
          </div>

          {/* Devnet Network Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] font-medium text-purple-300">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
            <span>Devnet</span>
          </div>

          {/* 1-Click Faucet Button */}
          <button
            onClick={handleFaucet}
            disabled={airdropping}
            title="Airdrop 1 Devnet SOL for testing"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {airdropping ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : airdropSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {airdropping ? "Airdropping..." : airdropSuccess ? "Airdropped!" : "Faucet +1 SOL"}
            </span>
          </button>

          {/* Solana Wallet Adapter Button */}
          <WalletMultiButton className="wallet-adapter-button" />
        </div>
      </div>
    </header>
  );
};

