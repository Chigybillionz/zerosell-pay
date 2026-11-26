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
  Menu,
  X,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const { solPrice, prices } = usePythPrices();

  const [airdropping, setAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    { name: "Demo Store", shortName: "Store", path: "/checkout", icon: Store },
    { name: "Vault Dashboard", shortName: "Vaults", path: "/dashboard", icon: LayoutDashboard },
    { name: "Merchant Portal", shortName: "Merchant", path: "/merchant", icon: Coins },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/checkout" className="flex items-center space-x-3 group">
          <div className="relative border-2 border-[#0A0A0A] bg-white p-0.5 shadow-[2px_2px_0px_#0A0A0A]">
            <img
              src="/zerosell-logo.jpg"
              alt="Zero Sell"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="text-base font-black tracking-tight text-[#0A0A0A] uppercase font-sans">
                Zero <span className="text-[#9945FF]">Sell</span>
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-black text-[#0A0A0A] mt-0.5 hidden sm:block">
              Spend Without Selling
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Swiss / Neo-Brutalist minimalist links) */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === "/checkout" && location.pathname === "/");
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-2 ${
                  isActive
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                    : "bg-white text-[#0A0A0A] border-transparent hover:border-[#0A0A0A] hover:bg-[#F8FAF9]"
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
            className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-2 border-transparent hover:border-[#0A0A0A] hover:bg-[#F8FAF9] flex items-center space-x-1 transition-all"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 text-[#0A0A0A]" />
          </a>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2.5">
          {/* Live Pyth Oracle Ticker & Network Status */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-white border-2 border-[#0A0A0A] text-xs shadow-[2px_2px_0px_#0A0A0A]">
            <span className="w-2 h-2 bg-[#14F195] border border-[#0A0A0A] shrink-0" />
            <span className="text-[#0A0A0A] text-[11px] font-bold uppercase">SOL:</span>
            <span className="font-mono font-bold text-[#0A0A0A] text-xs tabular-nums">
              ${solPrice.toFixed(2)}
            </span>
            <span className="text-[#0A0A0A]">•</span>
            <span className="bg-[#9945FF] text-white text-[10px] font-bold uppercase px-1.5 py-0.2 border border-[#0A0A0A]">
              Devnet
            </span>
          </div>

          {/* Connected Wallet Devnet Balance */}
          {connected && balance !== null && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-[#14F195] border-2 border-[#0A0A0A] text-xs font-mono font-bold text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] tabular-nums">
              <span className="text-[#0A0A0A] uppercase font-sans">Bal:</span>
              <span>{balance.toFixed(2)} SOL</span>
            </div>
          )}

          {/* 1-Click Faucet Button */}
          <button
            onClick={handleFaucet}
            disabled={airdropping}
            title="Copy wallet address & open official Solana Devnet Faucet"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#F8FAF9] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            {airdropSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span className="text-[#0A0A0A]">Copied!</span>
              </>
            ) : (
              <>
                <Droplets className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span className="hidden sm:inline">Free SOL</span>
              </>
            )}
          </button>

          {/* Solana Wallet Adapter Button */}
          <WalletMultiButton className="wallet-adapter-button" />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-[#0A0A0A] hover:bg-neutral-100 transition-all cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Menu className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#0A0A0A] bg-white px-4 py-4 space-y-2.5 animate-fade-in shadow-[0px_6px_0px_#0A0A0A]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname === link.path ||
              (link.path === "/checkout" && location.pathname === "/");
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider border-2 border-[#0A0A0A] transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0A0A0A] text-white shadow-[3px_3px_0px_#0A0A0A]"
                    : "bg-[#F8FAF9] text-[#0A0A0A] hover:bg-neutral-100 shadow-[2px_2px_0px_#0A0A0A]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <a
            href="https://github.com/Chigybillionz/zerosell-pay"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wider bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
          >
            <span>Documentation (GitHub)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Pyth price ribbon for mobile */}
          <div className="pt-2 border-t border-dashed border-neutral-300 flex items-center justify-between text-xs font-mono font-bold text-neutral-600">
            <span>Pyth SOL: ${solPrice.toFixed(2)}</span>
            <span className="bg-[#9945FF] text-white text-[10px] font-mono uppercase px-2 py-0.5 border border-[#0A0A0A]">
              Devnet
            </span>
          </div>
        </div>
      )}
    </header>

    {/* Mobile Fixed Bottom Navigation Bar (Always visible on mobile) */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#0A0A0A] shadow-[0px_-3px_0px_#0A0A0A]">
      <div className="grid grid-cols-3 divide-x-2 divide-[#0A0A0A]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            location.pathname === link.path ||
            (link.path === "/checkout" && (location.pathname === "/" || location.pathname === "/checkout"));
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-2.5 px-1 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0A0A0A] text-white"
                  : "bg-white text-[#0A0A0A] hover:bg-[#F8FAF9]"
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? "text-[#14F195]" : "text-[#0A0A0A]"}`} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-white" : "text-[#0A0A0A]"}`}>
                {link.shortName}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  </>
  );
};

