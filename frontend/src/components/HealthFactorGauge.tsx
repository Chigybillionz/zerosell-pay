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
    : "text-emerald-400";

  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-400"
    : "bg-emerald-400";

  const statusLabel = isCritical
    ? "Liquidation Risk"
    : isWarning
    ? "Caution (Monitor)"
    : "Optimal / Safe";

  // Clamp bar width percentage
  const clampedWidth = Math.min(Math.max((ltvPercent / 100) * 100, 5), 100);

  return (
    <div className="bg-[#111413] border border-[#1e2522] rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isCritical ? (
            <ShieldAlert className="w-5 h-5 text-red-400" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <span className="text-sm font-bold text-white">
            Vault Health & LTV Buffer
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${color}`}>
            {statusLabel}
          </span>
          <span className="text-gray-400 text-xs font-mono bg-[#0c0f0d] px-2 py-0.5 rounded border border-[#1e2522]">
            {ltvPercent.toFixed(1)}% LTV
          </span>
        </div>
      </div>

      {/* Progress Bar with Liquidation Marker */}
      <div className="relative w-full h-3 bg-[#080a09] rounded-full overflow-hidden p-0.5 border border-[#1e2522]">
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
      <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-2">
        <span className="text-emerald-400 font-medium">0% (Origination)</span>
        <span className="text-emerald-300 font-medium">50% (Max Borrow)</span>
        <span className="text-red-400 font-semibold">75% (Liquidation)</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <span>Collateral buffer:</span>
        <span className="text-gray-200 font-medium font-mono">
          {Math.max(0, liquidationThreshold - ltvPercent).toFixed(1)}% buffer before liquidation
        </span>
      </div>
    </div>
  );
};

