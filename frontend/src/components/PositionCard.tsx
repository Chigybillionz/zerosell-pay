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
    <div className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl relative overflow-hidden group backdrop-blur-xl">
      {/* Header: Invoice ID and Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            {repaid ? (
              <Unlock className="w-4 h-4 text-cyan-400" />
            ) : (
              <Lock className="w-4 h-4 text-neutral-300" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Invoice #{position.invoiceId}
            </h4>
            <p className="text-[11px] text-neutral-400">
              Locked on {new Date(position.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          {repaid ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Repaid &amp; Unlocked</span>
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isHealthy
                  ? "bg-white/[0.04] text-neutral-200 border-white/[0.08]"
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
      <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-black/40 rounded-xl border border-white/[0.06]">
        <div>
          <span className="text-[11px] text-neutral-400 uppercase font-medium tracking-wide">
            Locked Collateral
          </span>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {position.collateralAmount.toFixed(4)} SOL
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            ≈ ${position.currentCollateralValueUsd.toFixed(2)} USD
          </span>
        </div>

        <div>
          <span className="text-[11px] text-neutral-400 uppercase font-medium tracking-wide">
            Active USDC Debt
          </span>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            ${position.debtUsdcAmount.toFixed(2)} USDC
          </div>
          <span className="text-xs text-neutral-400">
            Flat 0.50% fee included
          </span>
        </div>
      </div>

      {/* Upside Highlight Bar: Shows how much money the user saved by NOT selling! */}
      {position.unrealizedGainUsd > 0 && !repaid && (
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-neutral-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>SOL Upside Saved:</span>
          </div>
          <span className="font-mono font-bold text-white">
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
          className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1 transition-colors"
        >
          <span>Vault Explorer</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>

        {!repaid ? (
          <button
            onClick={handleRepay}
            disabled={repaying}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 active:scale-95 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50 cursor-pointer"
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

