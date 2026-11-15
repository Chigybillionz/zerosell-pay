import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
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
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const { solPrice, prices } = usePythPrices();

  const [airdropping, setAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch {
        setBalance(null);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [connection, publicKey]);

  const handleFaucet = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first to copy your address for Devnet SOL.");
      return;
    }
    setAirdropping(true);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicKey.toBase58());
      }
      setAirdropSuccess(true);
      window.open("https://faucet.solana.com", "_blank");
      setTimeout(() => setAirdropSuccess(false), 5000);
    } catch {
      window.open("https://faucet.solana.com", "_blank");
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
    <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto bg-[#0d100e]/90 backdrop-blur-xl border border-[#1f2823] rounded-2xl md:rounded-full px-4 sm:px-6 py-2.5 shadow-2xl transition-all">
        {/* Brand Logo */}
        <Link to="/checkout" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#151917] border border-[#242C27] flex items-center justify-center group-hover:border-[#354139] transition-colors">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white font-mono">
                ZeroSell
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#181E1B] text-gray-300 border border-[#28332C]">
                Pay
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Tabs (Pill style like modern web3) */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#121614] p-1 rounded-full border border-[#1f2923]">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === "/checkout" && location.pathname === "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2">
          {/* Live Pyth Oracle Ticker & Network Status */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#121614] border border-[#1f2923] text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-400 text-[11px]">SOL:</span>
            <span className="font-mono font-bold text-white text-xs">
              ${solPrice.toFixed(2)}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400 text-[11px]">Devnet</span>
          </div>

          {/* Connected Wallet Devnet Balance */}
          {connected && balance !== null && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#121614] border border-[#1f2923] text-xs font-mono">
              <span className="text-gray-400">Bal:</span>
              <span className={balance > 0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {balance.toFixed(2)} SOL
              </span>
            </div>
          )}

          {/* 1-Click Faucet Button */}
          <button
            onClick={handleFaucet}
            disabled={airdropping}
            title="Copy wallet address & open official Solana Devnet Faucet"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#161c18] hover:bg-[#1d2520] text-gray-300 border border-[#27352d] transition-all hover:text-white cursor-pointer"
          >
            {airdropSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Faucet</span>
              </>
            )}
          </button>

          {/* Solana Wallet Adapter Button */}
          <WalletMultiButton className="wallet-adapter-button" />
        </div>
      </div>
    </header>
  );
};

