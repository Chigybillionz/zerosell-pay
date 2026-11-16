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
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/checkout" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-black rounded-[6.5px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-300 fill-cyan-300/20" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold tracking-tight text-white font-mono uppercase">
              ZeroSell
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/50">
              Pay
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Solana-style minimalist links) */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === "/checkout" && location.pathname === "/");
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.1] text-white font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
          <a
            href="https://github.com/Chigybillionz/zerosell-pay"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] flex items-center space-x-1 transition-colors"
          >
            <span>Docs</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-500" />
          </a>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2.5">
          {/* Live Pyth Oracle Ticker & Network Status */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#110d1c] border border-[#2b1747] text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-gray-400 text-[11px]">SOL:</span>
            <span className="font-mono font-bold text-white text-xs">
              ${solPrice.toFixed(2)}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-purple-300 text-[11px]">Devnet</span>
          </div>

          {/* Connected Wallet Devnet Balance */}
          {connected && balance !== null && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#110d1c] border border-[#2b1747] text-xs font-mono">
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
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1a1228] hover:bg-[#25193b] text-gray-300 border border-[#3b235d] transition-all hover:text-white cursor-pointer"
          >
            {airdropSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Free SOL</span>
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

