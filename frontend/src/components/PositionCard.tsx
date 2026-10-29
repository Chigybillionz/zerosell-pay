import React, { useState } from "react";
import { Lock, Unlock, ArrowUpRight, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { PositionData } from "../hooks/useZeroSellProgram.js";

interface PositionCardProps {
  position: PositionData;
  onRepay: (invoiceId: number) => Promise<any>;
}

export const PositionCard: React.FC<PositionCardProps> = ({ position, onRepay }) => {
  const [repaying, setRepaying] = useState(false);
  const [repaid, setRepaid] = useState(position.status === "Repaid");

  const handleRepay = async () => {
    setRepaying(true);
    try {
      await onRepay(position.invoiceId);
      setRepaid(true);
    } catch (err: any) {
      alert(`Repay failed: ${err.message}`);
    } finally {
      setRepaying(false);
    }
  };

  const isHealthy = position.currentLtvPercent < 55;
  const isWarning = position.currentLtvPercent >= 55 && position.currentLtvPercent < 75;

  return (
    <div className="bg-gray-900/80 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl backdrop-blur-sm relative overflow-hidden group">
      {/* Background subtle emerald glow if active */}
      {!repaid && (
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
      )}

      {/* Header: Invoice ID and Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            {repaid ? (
              <Unlock className="w-4 h-4 text-cyan-400" />
            ) : (
              <Lock className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-200">
              Invoice #{position.invoiceId}
            </h4>
            <p className="text-[11px] text-gray-400">
              Locked on {new Date(position.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          {repaid ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Repaid & Unlocked</span>
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isHealthy
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : isWarning
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              Active • {position.currentLtvPercent.toFixed(1)}% LTV
            </span>
          )}
        </div>
      </div>

      {/* Grid: Collateral vs Debt */}
      <div className="grid grid-cols-2 gap-4 my-4 p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80">
        <div>
          <span className="text-[11px] text-gray-400 uppercase font-medium tracking-wide">
            Locked Collateral
          </span>
          <div className="text-base font-bold text-gray-100 font-mono mt-0.5">
            {position.collateralAmount.toFixed(4)} SOL
          </div>
          <span className="text-xs text-emerald-400 font-medium">
            ≈ ${position.currentCollateralValueUsd.toFixed(2)} USD
          </span>
        </div>

        <div>
          <span className="text-[11px] text-gray-400 uppercase font-medium tracking-wide">
            Active USDC Debt
          </span>
          <div className="text-base font-bold text-gray-100 font-mono mt-0.5">
            ${position.debtUsdcAmount.toFixed(2)} USDC
          </div>
          <span className="text-xs text-gray-400">
            Flat 0.50% fee included
          </span>
        </div>
      </div>

      {/* Upside Highlight Bar: Shows how much money the user saved by NOT selling! */}
      {position.unrealizedGainUsd > 0 && !repaid && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>SOL Upside Saved:</span>
          </div>
          <span className="font-mono font-bold text-emerald-300">
            +${position.unrealizedGainUsd.toFixed(2)} USD
          </span>
        </div>
      )}

      {/* Action footer */}
      <div className="pt-2 flex items-center justify-between">
        <a
          href={`https://solscan.io/account/${position.borrower}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-emerald-400 flex items-center space-x-1 transition-colors"
        >
          <span>Vault Explorer</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>

        {!repaid ? (
          <button
            onClick={handleRepay}
            disabled={repaying}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black shadow-glow transition-all disabled:opacity-50"
          >
            {repaying ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
            <span>{repaying ? "Unlocking..." : `Repay $${position.debtUsdcAmount.toFixed(2)} & Unlock`}</span>
          </button>
        ) : (
          <div className="text-xs text-cyan-400 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Collateral Returned to Wallet</span>
          </div>
        )}
      </div>
    </div>
  );
};

