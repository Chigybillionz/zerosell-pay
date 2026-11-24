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
    ? "text-red-600"
    : isWarning
    ? "text-amber-600"
    : "text-[#0A0A0A]";

  const barColor = isCritical
    ? "bg-red-600"
    : isWarning
    ? "bg-amber-500"
    : "bg-[#14F195]";

  const statusLabel = isCritical
    ? "Liquidation Risk"
    : isWarning
    ? "Caution (Monitor)"
    : "Optimal / Safe";

  // Clamp bar width percentage
  const clampedWidth = Math.min(Math.max((ltvPercent / 100) * 100, 5), 100);

  return (
    <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-6 text-[#0A0A0A]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          {isCritical ? (
            <ShieldAlert className="w-5 h-5 text-red-600 stroke-[2.5]" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-500 stroke-[2.5]" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#0A0A0A] stroke-[2.5]" />
          )}
          <span className="text-sm font-black uppercase text-[#0A0A0A] tracking-tight">
            Vault Health &amp; LTV Buffer
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono font-black uppercase tracking-wider ${color}`}>
            {statusLabel}
          </span>
          <span className="text-[#0A0A0A] text-xs font-mono font-bold bg-[#F8FAF9] px-2.5 py-0.5 border-2 border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A]">
            {ltvPercent.toFixed(1)}% LTV
          </span>
        </div>
      </div>

      {/* Progress Bar with Liquidation Marker */}
      <div className="relative w-full h-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] overflow-hidden p-0.5">
        <div
          className={`h-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${clampedWidth}%` }}
        />
        {/* 75% Liquidation line marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-600 z-10"
          style={{ left: `${liquidationThreshold}%` }}
          title="Liquidation Threshold: 75%"
        />
      </div>

      {/* Threshold Labels */}
      <div className="flex justify-between items-center text-[10px] text-[#0A0A0A] font-mono font-bold uppercase mt-2.5">
        <span>0% (Origination)</span>
        <span>50% (Max Borrow)</span>
        <span className="text-red-600">75% (Liquidation)</span>
      </div>

      <div className="mt-4 pt-4 border-t-2 border-[#0A0A0A] flex items-center justify-between text-xs font-bold uppercase text-neutral-600">
        <span>Collateral buffer:</span>
        <span className="text-[#0A0A0A] font-black font-mono">
          {Math.max(0, liquidationThreshold - ltvPercent).toFixed(1)}% buffer before liquidation
        </span>
      </div>
    </div>
  );
};
