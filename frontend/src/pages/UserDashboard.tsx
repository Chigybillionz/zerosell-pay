import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  History,
  CheckCircle2,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { usePythPrices } from "../hooks/usePythPrices.js";
import { useZeroSellProgram } from "../hooks/useZeroSellProgram.js";
import { HealthFactorGauge } from "../components/HealthFactorGauge.js";
import { PositionCard } from "../components/PositionCard.js";
import {
  getUserPositions,
  updatePositionStatus,
  getUserTransactionHistory,
  logUserTransaction,
  clearUserVaultData,
  StoredPosition,
  TransactionRecord,
  getDeviceId,
} from "../utils/storage.js";

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { solPrice, refreshPrices } = usePythPrices();
  const { repayPosition } = useZeroSellProgram();

  const [positions, setPositions] = useState<StoredPosition[]>([]);
  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const loadStoredData = useCallback(() => {
    const userWallet = publicKey?.toBase58();
    const stored = getUserPositions(userWallet);
    // Recalculate dynamic market values based on live Pyth SOL price
    const updated = stored.map((p) => {
      const currentVal = p.collateralAmount * solPrice;
      const ltv = currentVal > 0 ? (p.debtUsdcAmount / currentVal) * 100 : 50;
      const unrealized = Math.max(0, p.collateralAmount * (solPrice - p.entryPriceUsd));
      return {
        ...p,
        currentCollateralValueUsd: currentVal,
        currentLtvPercent: ltv,
        unrealizedGainUsd: unrealized,
      };
    });
    setPositions(updated);
    setHistory(getUserTransactionHistory(userWallet));
  }, [publicKey, solPrice]);

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to reset your dashboard to a clean zero state?")) {
      clearUserVaultData();
      loadStoredData();
    }
  };

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  // Listen for storage updates triggered by checkouts
  useEffect(() => {
    const handleStorageUpdate = () => {
      loadStoredData();
    };
    window.addEventListener("zerosell_storage_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("zerosell_storage_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [loadStoredData]);

  const handleRepay = async (invoiceId: number) => {
    try {
      await repayPosition(invoiceId);

      // Update persistent storage
      updatePositionStatus(invoiceId, "Repaid");

      const targetPos = positions.find((p) => p.invoiceId === invoiceId);
      if (targetPos) {
        logUserTransaction({
          signature: "5Repay" + Math.random().toString(36).substring(2, 10),
          invoiceId,
          title: targetPos.title || `Invoice #${invoiceId}`,
          usdcAmount: targetPos.debtUsdcAmount,
          collateralAmount: targetPos.collateralAmount,
          collateralMint: "SOL",
          borrower: publicKey?.toBase58() || targetPos.borrower,
          timestamp: Date.now(),
          type: "REPAY",
          solscanUrl: `https://solscan.io/account/${targetPos.borrower}?cluster=devnet`,
        });
      }

      // Refresh component state
      loadStoredData();
    } catch (e: any) {
      console.error("Repayment error:", e);
    }
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
            <span>Device &amp; Wallet Synced</span>
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
            onClick={handleClearData}
            title="Reset dashboard to clean 0 state"
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-white hover:bg-neutral-100 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-black uppercase tracking-wider text-neutral-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#0A0A0A] stroke-[2.5]" />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={() => refreshPrices()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-black uppercase tracking-wider text-[#0A0A0A] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0A0A0A] stroke-[2.5]" />
            <span>Sync Pyth Oracles</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
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
              {activePositions.length > 0 ? `${averageLtv.toFixed(1)}%` : "0.0%"}
            </div>
            <span className="text-xs font-semibold text-neutral-600 mt-1 block">
              {activePositions.length > 0 ? "Liquidation threshold 75%" : "No Active Debt"}
            </span>
          </div>
        </div>
      </div>

      {/* Global Health Factor Bar Gauge Component */}
      <div>
        <HealthFactorGauge
          ltvPercent={activePositions.length > 0 ? averageLtv : 0}
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
          Repaid &amp; Audit History ({repaidPositions.length + history.length})
        </button>
      </div>

      {/* Position Cards Grid */}
      {activeTab === "active" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePositions.map((pos) => (
            <PositionCard
              key={pos.invoiceId}
              position={pos}
              onRepay={handleRepay}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Repaid Position Cards */}
          {repaidPositions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {repaidPositions.map((pos) => (
                <PositionCard
                  key={pos.invoiceId}
                  position={pos}
                  onRepay={handleRepay}
                />
              ))}
            </div>
          )}

          {/* On-Chain Transaction Audit Log Table */}
          {history.length > 0 && (
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0A0A0A]">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-[#0A0A0A]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0A0A0A]">
                    On-Chain Transaction Log (Device &amp; Wallet History)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  {history.length} events logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-neutral-300 text-neutral-500 uppercase font-black">
                      <th className="py-2">Type</th>
                      <th className="py-2">Invoice / Description</th>
                      <th className="py-2">USDC Amount</th>
                      <th className="py-2">Collateral</th>
                      <th className="py-2">Date</th>
                      <th className="py-2 text-right">Explorer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {history.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-3 font-black">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 border ${
                              tx.type === "LOCK_AND_PAY"
                                ? "bg-[#14F195]/20 text-emerald-900 border-emerald-600"
                                : "bg-purple-100 text-purple-900 border-purple-600"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-[#0A0A0A]">
                          #{tx.invoiceId} {tx.title ? `(${tx.title})` : ""}
                        </td>
                        <td className="py-3 font-bold text-[#0A0A0A]">
                          ${tx.usdcAmount.toFixed(2)} USDC
                        </td>
                        <td className="py-3 text-neutral-700">
                          {tx.collateralAmount.toFixed(3)} {tx.collateralMint}
                        </td>
                        <td className="py-3 text-neutral-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <a
                            href={tx.solscanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[#0A0A0A] font-bold underline hover:text-emerald-700"
                          >
                            <span>Solscan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {(activeTab === "active" ? activePositions : [...repaidPositions, ...history]).length === 0 && (
        <div className="text-center py-16 px-6 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-[#14F195]/20 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center mx-auto text-[#0A0A0A]">
            <Coins className="w-7 h-7 text-[#0A0A0A] stroke-[2.5]" />
          </div>
          <h4 className="text-lg font-black uppercase text-[#0A0A0A] tracking-tight">
            Clean Vault Slate — No Active Debt
          </h4>
          <p className="text-xs text-neutral-600 font-medium max-w-md mx-auto leading-relaxed">
            You currently have $0.00 locked collateral and $0.00 active debt. Only transactions you actually record will be shown here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/store")}
              className="inline-flex items-center space-x-2 py-3 px-6 bg-[#9945FF] hover:bg-[#8935ef] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Test First ZeroSell Payment ↗</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
