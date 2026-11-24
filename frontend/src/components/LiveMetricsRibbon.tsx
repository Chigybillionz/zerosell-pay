import React from "react";

export const LiveMetricsRibbon: React.FC = () => {
  return (
    <div className="w-full border-b-2 border-[#0A0A0A] bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#0A0A0A]">
        <div className="p-6 sm:p-8 text-center hover:bg-[#F8FAF9] transition-colors">
          <div className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight font-mono tabular-nums">
            150%
          </div>
          <div className="text-xs uppercase tracking-widest text-[#0A0A0A] font-black mt-1.5">
            Collateralization Ratio
          </div>
          <div className="text-[11px] text-[#0A0A0A] font-semibold mt-0.5">
            Ultra-safe 50% initial LTV buffer
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center hover:bg-[#F8FAF9] transition-colors">
          <div className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight font-mono tabular-nums">
            &lt; 400ms
          </div>
          <div className="text-xs uppercase tracking-widest text-[#0A0A0A] font-black mt-1.5">
            Pyth Hermes Latency
          </div>
          <div className="text-[11px] text-[#0A0A0A] font-semibold mt-0.5">
            Sub-second real-time pull oracles
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center hover:bg-[#F8FAF9] transition-colors">
          <div className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight font-mono tabular-nums">
            $0.00
          </div>
          <div className="text-xs uppercase tracking-widest text-[#0A0A0A] font-black mt-1.5">
            User Network Gas Fee
          </div>
          <div className="text-[11px] text-[#0A0A0A] font-semibold mt-0.5">
            100% sponsored by Node.js Relayer
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center hover:bg-[#F8FAF9] transition-colors">
          <div className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight font-mono tabular-nums">
            0% TAX
          </div>
          <div className="text-xs uppercase tracking-widest text-[#0A0A0A] font-black mt-1.5">
            Capital Gains Drag
          </div>
          <div className="text-[11px] text-[#0A0A0A] font-semibold mt-0.5">
            Borrowing collateral triggers no taxable sale
          </div>
        </div>
      </div>
    </div>
  );
};
