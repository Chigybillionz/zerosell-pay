import React, { useState } from "react";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";

interface UpsideSimulatorProps {
  currentSolPrice: number;
}

export const UpsideSimulator: React.FC<UpsideSimulatorProps> = ({ currentSolPrice }) => {
  const [billAmount, setBillAmount] = useState(120);
  const [targetSolPrice, setTargetSolPrice] = useState(350);

  // Math calculations
  const solCollateralRequired = (billAmount * 2) / currentSolPrice; // 50% LTV = 2x collateral
  const futureValueOfCollateral = solCollateralRequired * targetSolPrice;
  const netProfitPreserved = Math.max(0, futureValueOfCollateral - (solCollateralRequired * currentSolPrice));

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-[#F8FAF9] text-[#0A0A0A] border-b-2 border-[#0A0A0A] relative">
      <div className="max-w-5xl mx-auto p-8 sm:p-12 bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#14F195] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-xs font-mono font-black uppercase tracking-wider text-[#0A0A0A]">
            <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
            <span>Interactive Upside Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
            See how much you save by not selling.
          </h2>
          <p className="text-sm font-medium text-neutral-600 max-w-xl mx-auto">
            Simulate your invoice amount and projected SOL price to visualize future multiple expansions.
          </p>
        </div>

        {/* Sliders and Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
          {/* Left: Interactive Controls */}
          <div className="space-y-6 bg-[#F8FAF9] p-6 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
            {/* Slider 1: Bill Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 font-bold uppercase">Invoice Total (USDC):</span>
                <span className="text-base font-black text-[#0A0A0A] font-mono">${billAmount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-neutral-200 border-2 border-[#0A0A0A] appearance-none cursor-pointer accent-[#9945FF]"
              />
              <div className="flex justify-between text-[10px] text-neutral-600 font-mono font-bold">
                <span>$20</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>

            {/* Slider 2: Target SOL Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 font-bold uppercase">Target SOL Price (USD):</span>
                <span className="text-base font-black text-[#0A0A0A] font-mono">${targetSolPrice}</span>
              </div>
              <input
                type="range"
                min={Math.ceil(currentSolPrice)}
                max="1000"
                step="25"
                value={targetSolPrice}
                onChange={(e) => setTargetSolPrice(Number(e.target.value))}
                className="w-full h-2.5 bg-neutral-200 border-2 border-[#0A0A0A] appearance-none cursor-pointer accent-[#9945FF]"
              />
              <div className="flex justify-between text-[10px] text-neutral-600 font-mono font-bold">
                <span>Current (${Math.round(currentSolPrice)})</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-neutral-600 border-t-2 border-[#0A0A0A] flex justify-between font-bold">
              <span className="uppercase">Required Collateral:</span>
              <span className="font-mono text-[#0A0A0A] font-black">
                {solCollateralRequired.toFixed(3)} SOL
              </span>
            </div>
          </div>

          {/* Right: Net Value Comparison Box */}
          <div className="p-8 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex flex-col justify-between space-y-6 text-center">
            <span className="text-xs uppercase font-black tracking-wider text-neutral-600">
              Future Upside Preserved In Your Vault
            </span>

            <div>
              <div className="text-5xl sm:text-6xl font-black text-[#0A0A0A] font-mono tracking-tight tabular-nums">
                +${Math.round(netProfitPreserved).toLocaleString()}
              </div>
              <span className="text-xs text-neutral-600 mt-2 block font-bold uppercase">
                Pure profit saved by borrowing instead of selling
              </span>
            </div>

            <div className="p-3 bg-red-50 border-2 border-red-600 shadow-[2px_2px_0px_#0A0A0A] text-xs text-[#0A0A0A] flex justify-between font-mono font-bold">
              <span>If you sold on DEX:</span>
              <span className="text-red-600 font-black uppercase">$0.00 profit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
