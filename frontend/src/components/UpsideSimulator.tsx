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
      <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#110b21] via-[#090612] to-black border border-[#2c184a] shadow-2xl space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase font-bold tracking-widest text-purple-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive Upside Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            See how much you save by not selling.
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Simulate your invoice amount and projected SOL price to visualize future multiple expansions.
          </p>
        </div>

        {/* Sliders and Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
          {/* Left: Interactive Controls */}
          <div className="space-y-6 bg-[#160f29]/60 p-6 rounded-2xl border border-[#2b1947]">
            {/* Slider 1: Bill Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Invoice Total (USDC):</span>
                <span className="text-base font-bold text-white font-mono">${billAmount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="w-full h-2 bg-[#25173e] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>$20</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>

            {/* Slider 2: Target SOL Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Target SOL Price (USD):</span>
                <span className="text-base font-bold text-purple-300 font-mono">${targetSolPrice}</span>
              </div>
              <input
                type="range"
                min={Math.ceil(currentSolPrice)}
                max="1000"
                step="25"
                value={targetSolPrice}
                onChange={(e) => setTargetSolPrice(Number(e.target.value))}
                className="w-full h-2 bg-[#25173e] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>Current (${Math.round(currentSolPrice)})</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-gray-400 border-t border-[#25173e] flex justify-between">
              <span>Required Collateral:</span>
              <span className="font-mono text-white font-bold">
                {solCollateralRequired.toFixed(3)} SOL
              </span>
            </div>
          </div>

          {/* Right: Net Value Comparison Box */}
          <div className="p-8 rounded-2xl bg-[#140e24] border border-[#3b1f66] flex flex-col justify-between space-y-6 text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-gray-400">
              Future Upside Preserved In Your Vault
            </span>

            <div>
              <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 font-mono">
                +${Math.round(netProfitPreserved).toLocaleString()}
              </div>
              <span className="text-xs text-purple-200 mt-2 block font-medium">
                Pure profit saved by borrowing instead of selling
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0e091a] border border-[#291745] text-xs text-gray-400 flex justify-between font-mono">
              <span>If you sold on DEX:</span>
              <span className="text-red-400 font-semibold">$0.00 profit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
