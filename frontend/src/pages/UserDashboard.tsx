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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#F8FAF9] text-[#0A0A0A]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-[#0A0A0A]">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-xs font-mono font-black uppercase text-[#0A0A0A]">
            <span className="w-2 h-2 bg-[#14F195] border border-[#0A0A0A]" />
            <span>Vault Dashboard</span>
            <span className="text-[#0A0A0A]">•</span>
            <span>Non-Custodial Solana PDA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#0A0A0A] tracking-tight">
            Borrower Credit &amp; Vaults
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-medium max-w-2xl leading-relaxed">
            Monitor locked collateral, track unrealized SOL market gains, and repay loans to unlock collateral instantly.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refreshPrices()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-black uppercase tracking-wider text-[#0A0A0A] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0A0A0A] stroke-[2.5]" />
            <span>Sync Pyth Oracles</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 4 key high-impact financial cards with 2px solid dividers */}
      <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#0A0A0A] text-left">
          {/* Metric 1 */}
          <div className="p-6 hover:bg-[#F8FAF9] transition-colors">
            <div className="flex items-center justify-between text-neutral-600 mb-2">
              <span className="text-xs uppercase font-black tracking-wider">
                Locked Collateral
              </span>
              <Lock className="w-4 h-4 text-[#0A0A0A] stroke-[2.5]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0A0A0A] font-mono tabular-nums">
              ${totalCollateralVal.toFixed(2)}
            </div>
            <span className="text-xs font-semibold text-neutral-600 mt-1 block">
              {activePositions.reduce((a, b) => a + b.collateralAmount, 0).toFixed(3)} SOL in vaults
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-6 hover:bg-[#F8FAF9] transition-colors">
            <div className="flex items-center justify-between text-neutral-600 mb-2">
              <span className="text-xs uppercase font-black tracking-wider">
                Active Debt
              </span>
              <Coins className="w-4 h-4 text-[#0A0A0A] stroke-[2.5]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0A0A0A] font-mono tabular-nums">
              ${totalDebtUsdc.toFixed(2)}
            </div>
            <span className="text-xs font-semibold text-neutral-600 mt-1 block">
              USDC owed to Protocol
            </span>
          </div>

          {/* Metric 3 */}
          <div className="p-6 hover:bg-[#F8FAF9] transition-colors">
            <div className="flex items-center justify-between text-neutral-600 mb-2">
              <span className="text-xs uppercase font-black tracking-wider">
                Upside Preserved
              </span>
              <TrendingUp className="w-4 h-4 text-[#14F195] bg-[#0A0A0A] p-0.5 stroke-[2.5]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0A0A0A] font-mono tabular-nums">
              +${totalGainsSaved.toFixed(2)}
            </div>
            <span className="text-xs font-semibold text-neutral-600 mt-1 block">
              Saved by holding SOL
            </span>
          </div>

          {/* Metric 4 */}
          <div className="p-6 hover:bg-[#F8FAF9] transition-colors">
            <div className="flex items-center justify-between text-neutral-600 mb-2">
              <span className="text-xs uppercase font-black tracking-wider">
                Portfolio LTV
              </span>
              <ShieldCheck className="w-4 h-4 text-[#0A0A0A] stroke-[2.5]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0A0A0A] font-mono tabular-nums">
              {averageLtv > 0 ? `${averageLtv.toFixed(1)}%` : "N/A"}
            </div>
            <span className="text-xs font-semibold text-neutral-600 mt-1 block">
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
      <div className="flex items-center space-x-3 pb-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]"
              : "bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#F8FAF9]"
          }`}
        >
          Active Vault Locks ({activePositions.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]"
              : "bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#F8FAF9]"
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
        <div className="text-center py-16 bg-white border-2 border-dashed border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
          <Coins className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h4 className="text-base font-black uppercase text-[#0A0A0A]">No positions found</h4>
          <p className="text-xs text-neutral-600 font-medium mt-1">
            Head to the Demo Storefront to test paying an invoice with ZeroSell.
          </p>
        </div>
      )}
    </div>
  );
};
