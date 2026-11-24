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
    <div className="bg-white border-2 border-[#0A0A0A] shadow-[5px_5px_0px_#0A0A0A] hover:shadow-[7px_7px_0px_#0A0A0A] hover:translate-x-[-1px] hover:translate-y-[-1px] p-6 transition-all duration-200 relative overflow-hidden text-[#0A0A0A]">
      {/* Header: Invoice ID and Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
            {repaid ? (
              <Unlock className="w-4 h-4 text-[#14F195] stroke-[2.5]" />
            ) : (
              <Lock className="w-4 h-4 text-[#0A0A0A] stroke-[2.5]" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-black uppercase text-[#0A0A0A] tracking-tight">
              Invoice #{position.invoiceId}
            </h4>
            <p className="text-[11px] font-mono font-medium text-neutral-600">
              Locked on {new Date(position.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          {repaid ? (
            <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-[#14F195] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Repaid &amp; Unlocked</span>
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] ${
                isHealthy
                  ? "bg-white text-[#0A0A0A]"
                  : isWarning
                  ? "bg-amber-100 text-amber-900"
                  : "bg-red-100 text-red-900"
              }`}
            >
              Active • {position.currentLtvPercent.toFixed(1)}% LTV
            </span>
          )}
        </div>
      </div>

      {/* Grid: Collateral vs Debt */}
      <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
        <div>
          <span className="text-[11px] text-neutral-600 uppercase font-black tracking-wide">
            Locked Collateral
          </span>
          <div className="text-base font-black text-[#0A0A0A] font-mono mt-0.5 tabular-nums">
            {position.collateralAmount.toFixed(4)} SOL
          </div>
          <span className="text-xs text-neutral-600 font-mono font-bold">
            ≈ ${position.currentCollateralValueUsd.toFixed(2)} USD
          </span>
        </div>

        <div>
          <span className="text-[11px] text-neutral-600 uppercase font-black tracking-wide">
            Active USDC Debt
          </span>
          <div className="text-base font-black text-[#0A0A0A] font-mono mt-0.5 tabular-nums">
            ${position.debtUsdcAmount.toFixed(2)} USDC
          </div>
          <span className="text-xs text-neutral-600 font-medium">
            Flat 0.50% fee included
          </span>
        </div>
      </div>

      {/* Upside Highlight Bar: Shows how much money the user saved by NOT selling! */}
      {position.unrealizedGainUsd > 0 && !repaid && (
        <div className="mb-4 px-3.5 py-2.5 bg-[#14F195]/20 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-[#0A0A0A] font-black uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
            <span>SOL Upside Saved:</span>
          </div>
          <span className="font-mono font-black text-[#0A0A0A]">
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
          className="text-xs font-black uppercase text-neutral-600 hover:text-black flex items-center space-x-1 transition-colors"
        >
          <span>Vault Explorer</span>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </a>

        {!repaid ? (
          <button
            onClick={handleRepay}
            disabled={repaying}
            className="flex items-center space-x-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider bg-[#9945FF] hover:bg-[#8935ef] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] transition-all disabled:opacity-50 cursor-pointer"
          >
            {repaying ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>{repaying ? "Unlocking..." : `Repay $${position.debtUsdcAmount.toFixed(2)} & Unlock`}</span>
          </button>
        ) : (
          <div className="text-xs text-[#0A0A0A] font-black uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195] bg-[#0A0A0A] p-0.5" />
            <span>Collateral Returned to Wallet</span>
          </div>
        )}
      </div>
    </div>
  );
};
