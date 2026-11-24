import React from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface HealthFactorGaugeProps {
  ltvPercent: number; // e.g. 50.0
  liquidationThreshold?: number; // default 75.0%
}

export const HealthFactorGauge: React.FC<HealthFactorGaugeProps> = ({
  ltvPercent,
  liquidationThreshold = 75.0,
}) => {
  // Determine health category
  const isHealthy = ltvPercent < 55.0;
  const isWarning = ltvPercent >= 55.0 && ltvPercent < liquidationThreshold;
  const isCritical = ltvPercent >= liquidationThreshold;

  // Status color schemes
  const color = isCritical
    ? "text-red-400"
    : isWarning
    ? "text-amber-400"
    : "text-white";

  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-400"
    : "bg-white";

  const statusLabel = isCritical
    ? "Liquidation Risk"
    : isWarning
    ? "Caution (Monitor)"
    : "Optimal / Safe";

  // Clamp bar width percentage
  const clampedWidth = Math.min(Math.max((ltvPercent / 100) * 100, 5), 100);

  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          {isCritical ? (
            <ShieldAlert className="w-5 h-5 text-red-400" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-neutral-300" />
          )}
          <span className="text-sm font-bold text-white tracking-tight">
            Vault Health &amp; LTV Buffer
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${color}`}>
            {statusLabel}
          </span>
          <span className="text-neutral-300 text-xs font-mono bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
            {ltvPercent.toFixed(1)}% LTV
          </span>
        </div>
      </div>

      {/* Progress Bar with Liquidation Marker */}
      <div className="relative w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${clampedWidth}%` }}
        />
        {/* 75% Liquidation line marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${liquidationThreshold}%` }}
          title="Liquidation Threshold: 75%"
        />
      </div>

      {/* Threshold Labels */}
      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono mt-2.5">
        <span className="text-neutral-300 font-medium">0% (Origination)</span>
        <span className="text-neutral-300 font-medium">50% (Max Borrow)</span>
        <span className="text-red-400 font-semibold">75% (Liquidation)</span>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
        <span>Collateral buffer:</span>
        <span className="text-neutral-200 font-medium font-mono">
          {Math.max(0, liquidationThreshold - ltvPercent).toFixed(1)}% buffer before liquidation
        </span>
      </div>
    </div>
  );
};

