import React from "react";

export const LiveMetricsRibbon: React.FC = () => {
  return (
    <div className="w-full border-y border-white/[0.08] bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
        <div className="p-6 sm:p-8 text-center hover:bg-white/[0.02] transition-colors">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            150%
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
            Collateralization Ratio
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Ultra-safe 50% initial LTV buffer
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center hover:bg-white/[0.02] transition-colors">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            &lt; 400ms
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
            Pyth Hermes Latency
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Sub-second real-time pull oracles
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center hover:bg-white/[0.02] transition-colors">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            $0.00
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
            User Network Gas Fee
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            100% sponsored by Node.js Relayer
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center hover:bg-white/[0.02] transition-colors">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            0% TAX
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
            Capital Gains Drag
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Borrowing collateral triggers no taxable sale
          </div>
        </div>
      </div>
    </div>
  );
};
