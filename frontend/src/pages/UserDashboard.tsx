import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Layers,
} from "lucide-react";
import { usePythPrices } from "../hooks/usePythPrices.js";
import { useZeroSellProgram, PositionData } from "../hooks/useZeroSellProgram.js";
import { HealthFactorGauge } from "../components/HealthFactorGauge.js";
import { PositionCard } from "../components/PositionCard.js";

export const UserDashboard: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { solPrice, refreshPrices } = usePythPrices();
  const { repayPosition } = useZeroSellProgram();

  // Active positions state (seeded with realistic demo positions for evaluation)
  const [positions, setPositions] = useState<PositionData[]>([
    {
      publicKey: "Pos1111111111111111111111111111111111111111",
      invoiceId: 984321,
      borrower: publicKey?.toBase58() || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      merchant: "MrcHnt1111111111111111111111111111111111111",
      collateralMint: "So11111111111111111111111111111111111111112",
      collateralAmount: 0.539,
      collateralAmountRaw: "539000000",
      debtUsdcAmount: 50.25,
      entryPriceUsd: 172.5,
      currentCollateralValueUsd: 0.539 * solPrice,
      currentLtvPercent: (50.25 / (0.539 * solPrice)) * 100,
      createdAt: Date.now() - 86400000 * 2,
      status: "Active",
      statusRaw: 0,
      unrealizedGainUsd: Math.max(0, 0.539 * (solPrice - 172.5)),
    },
    {
      publicKey: "Pos2222222222222222222222222222222222222222",
      invoiceId: 876543,
      borrower: publicKey?.toBase58() || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      merchant: "MrcHnt1111111111111111111111111111111111111",
      collateralMint: "So11111111111111111111111111111111111111112",
      collateralAmount: 1.294,
      collateralAmountRaw: "1294000000",
      debtUsdcAmount: 120.6,
      entryPriceUsd: 168.0,
      currentCollateralValueUsd: 1.294 * solPrice,
      currentLtvPercent: (120.6 / (1.294 * solPrice)) * 100,
      createdAt: Date.now() - 86400000 * 6,
      status: "Active",
      statusRaw: 0,
      unrealizedGainUsd: Math.max(0, 1.294 * (solPrice - 168.0)),
    },
  ]);

  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const handleRepay = async (invoiceId: number) => {
    await repayPosition(invoiceId);
    setPositions((prev) =>
      prev.map((pos) =>
        pos.invoiceId === invoiceId ? { ...pos, status: "Repaid", statusRaw: 1 } : pos
      )
    );
  };

  // Aggregated metrics across active positions
  const activePositions = positions.filter((p) => p.status === "Active");
  const repaidPositions = positions.filter((p) => p.status === "Repaid");

  const totalCollateralVal = activePositions.reduce(
    (acc, p) => acc + p.collateralAmount * solPrice,
    0
  );
  const totalDebtUsdc = activePositions.reduce(
    (acc, p) => acc + p.debtUsdcAmount,
    0
  );
  const totalGainsSaved = activePositions.reduce(
    (acc, p) => acc + p.unrealizedGainUsd,
    0
  );
  const averageLtv =
    totalCollateralVal > 0 ? (totalDebtUsdc / totalCollateralVal) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span>Vault Dashboard</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-300">Non-Custodial Solana PDA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Borrower Credit &amp; Vaults
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
            Monitor locked collateral, track unrealized SOL market gains, and repay loans to unlock collateral instantly.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refreshPrices()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-xs font-semibold text-neutral-200 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Sync Pyth Oracles</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 4 key high-impact financial cards with Solana hairline dividers */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] text-center">
          {/* Metric 1 */}
          <div className="p-6 hover:bg-white/[0.02] transition-colors text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">
                Locked Collateral
              </span>
              <Lock className="w-4 h-4 text-neutral-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              ${totalCollateralVal.toFixed(2)}
            </div>
            <span className="text-xs text-neutral-500 mt-1 block">
              {activePositions.reduce((a, b) => a + b.collateralAmount, 0).toFixed(3)} SOL in vaults
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-6 hover:bg-white/[0.02] transition-colors text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">
                Active Debt
              </span>
              <Coins className="w-4 h-4 text-neutral-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              ${totalDebtUsdc.toFixed(2)}
            </div>
            <span className="text-xs text-neutral-400 mt-1 block">
              USDC owed to Protocol
            </span>
          </div>

          {/* Metric 3 */}
          <div className="p-6 hover:bg-white/[0.02] transition-colors text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">
                Upside Preserved
              </span>
              <TrendingUp className="w-4 h-4 text-neutral-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              +${totalGainsSaved.toFixed(2)}
            </div>
            <span className="text-xs text-neutral-400 mt-1 block">
              Saved by holding SOL
            </span>
          </div>

          {/* Metric 4 */}
          <div className="p-6 hover:bg-white/[0.02] transition-colors text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">
                Portfolio LTV
              </span>
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {averageLtv > 0 ? `${averageLtv.toFixed(1)}%` : "N/A"}
            </div>
            <span className="text-xs text-neutral-500 mt-1 block">
              Liquidation threshold 75%
            </span>
          </div>
        </div>
      </div>

      {/* Global Health Factor Bar Gauge Component */}
      <div>
        <HealthFactorGauge
          ltvPercent={averageLtv || 50.0}
          liquidationThreshold={75.0}
        />
      </div>

      {/* Tabs: Active Locks vs Repaid History */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-4">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              : "text-neutral-400 hover:text-white bg-white/[0.03] border border-white/[0.08]"
          }`}
        >
          Active Vault Locks ({activePositions.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              : "text-neutral-400 hover:text-white bg-white/[0.03] border border-white/[0.08]"
          }`}
        >
          Repaid History ({repaidPositions.length})
        </button>
      </div>

      {/* Position Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(activeTab === "active" ? activePositions : repaidPositions).map(
          (pos) => (
            <PositionCard
              key={pos.invoiceId}
              position={pos}
              onRepay={handleRepay}
            />
          )
        )}
      </div>

      {/* Empty State */}
      {(activeTab === "active" ? activePositions : repaidPositions).length === 0 && (
        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/[0.08]">
          <Coins className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-neutral-300">No positions found</h4>
          <p className="text-xs text-neutral-500 mt-1">
            Head to the Demo Storefront to test paying an invoice with ZeroSell.
          </p>
        </div>
      )}
    </div>
  );
};
