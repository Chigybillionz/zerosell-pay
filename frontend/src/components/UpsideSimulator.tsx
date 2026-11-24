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
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-black text-white relative">
      <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-widest text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>Interactive Upside Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            See how much you save by not selling.
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            Simulate your invoice amount and projected SOL price to visualize future multiple expansions.
          </p>
        </div>

        {/* Sliders and Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
          {/* Left: Interactive Controls */}
          <div className="space-y-6 bg-black/50 p-6 rounded-2xl border border-white/[0.08]">
            {/* Slider 1: Bill Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">Invoice Total (USDC):</span>
                <span className="text-base font-bold text-white font-mono">${billAmount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>$20</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>

            {/* Slider 2: Target SOL Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">Target SOL Price (USD):</span>
                <span className="text-base font-bold text-white font-mono">${targetSolPrice}</span>
              </div>
              <input
                type="range"
                min={Math.ceil(currentSolPrice)}
                max="1000"
                step="25"
                value={targetSolPrice}
                onChange={(e) => setTargetSolPrice(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>Current (${Math.round(currentSolPrice)})</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-neutral-400 border-t border-white/[0.08] flex justify-between">
              <span>Required Collateral:</span>
              <span className="font-mono text-white font-bold">
                {solCollateralRequired.toFixed(3)} SOL
              </span>
            </div>
          </div>

          {/* Right: Net Value Comparison Box */}
          <div className="p-8 rounded-2xl bg-black/60 border border-white/[0.1] flex flex-col justify-between space-y-6 text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400">
              Future Upside Preserved In Your Vault
            </span>

            <div>
              <div className="text-5xl sm:text-6xl font-extrabold text-white font-mono tracking-tight">
                +${Math.round(netProfitPreserved).toLocaleString()}
              </div>
              <span className="text-xs text-neutral-400 mt-2 block font-medium">
                Pure profit saved by borrowing instead of selling
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-neutral-400 flex justify-between font-mono">
              <span>If you sold on DEX:</span>
              <span className="text-red-400 font-semibold">$0.00 profit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
