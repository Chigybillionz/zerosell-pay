import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import {
  X,
  Zap,
  ShieldCheck,
  QrCode,
  Wallet,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { usePythPrices } from "../hooks/usePythPrices.js";
import { useZeroSellProgram } from "../hooks/useZeroSellProgram.js";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: number;
    title: string;
    description: string;
    usdcAmount: number;
    merchantPubkey: string;
  };
  onSuccess: (result: any) => void;
}

export const ZeroSellCheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const { connected } = useWallet();
  const { solPrice, calculateCollateralNeeded } = usePythPrices();
  const { executeGaslessCheckout, loading } = useZeroSellProgram();

  const [activeTab, setActiveTab] = useState<"wallet" | "qr">("wallet");
  const [successResult, setSuccessResult] = useState<{
    signature: string;
    solscanUrl: string;
    collateralUnits: number;
  } | null>(null);
  const [stepStatus, setStepStatus] = useState<string>("");

  if (!isOpen) return null;

  // Real-time calculation based on Pyth price and 50% LTV
  const calc = calculateCollateralNeeded(invoice.usdcAmount, "SOL", 50.0);

  // Solana Pay URL (spec compliant)
  const solanaPayUrl = `solana:${invoice.merchantPubkey}?amount=${invoice.usdcAmount}&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=${invoice.id}&label=ZeroSell+Pay&message=${encodeURIComponent(
    invoice.title
  )}`;

  const handlePay = async () => {
    if (!connected) {
      alert("Please connect your Solana wallet first");
      return;
    }

    try {
      setStepStatus("1/3 Querying Pyth Hermes Oracle Price...");
      await new Promise((r) => setTimeout(r, 400));

      setStepStatus("2/3 Sponsoring Gas with Relayer...");
      const result = await executeGaslessCheckout({
        merchantPubkey: invoice.merchantPubkey,
        usdcAmount: invoice.usdcAmount,
        invoiceId: invoice.id,
      });

      setStepStatus("3/3 Instant Merchant Settlement Confirmed!");

      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#14F195", "#9945FF", "#00F0FF"],
      });

      setSuccessResult({
        signature: result.signature,
        solscanUrl: result.solscanUrl,
        collateralUnits: result.requiredCollateral,
      });

      onSuccess(result);
    } catch (err: any) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setStepStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0E1526] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successResult ? (
          <>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ZeroSell Non-Custodial Protocol</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Pay Without Selling
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Keep 100% of your SOL upside. Settle ${invoice.usdcAmount.toFixed(2)} USDC immediately.
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex bg-gray-950/80 p-1 rounded-xl border border-gray-800/80 mb-6">
              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "wallet"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>1-Click Gasless Wallet</span>
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "qr"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Solana Pay QR</span>
              </button>
            </div>

            {activeTab === "wallet" ? (
              <div>
                {/* Financial Math Breakdown Card */}
                <div className="bg-gray-950/70 rounded-2xl p-4 border border-gray-800 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Invoice Amount:</span>
                    <span className="font-mono font-bold text-gray-200">
                      ${invoice.usdcAmount.toFixed(2)} USDC
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Pyth SOL/USD Oracle:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ${solPrice.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Collateral Required (50% LTV):</span>
                    <span className="font-mono font-bold text-gray-100">
                      {calc.formattedUnits} SOL (${calc.collateralValueUsd.toFixed(2)})
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Gas & Network Fee:</span>
                    <span className="font-mono font-bold text-emerald-400 flex items-center space-x-1">
                      <span>$0.00 (Sponsored by Relayer)</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-800/80 flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-medium">Merchant Receives:</span>
                    <span className="font-mono font-bold text-emerald-300 text-sm">
                      ${invoice.usdcAmount.toFixed(2)} USDC Instantly
                    </span>
                  </div>
                </div>

                {/* Progress / Step status indicator if loading */}
                {stepStatus && (
                  <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs text-emerald-400 font-mono animate-pulse">
                    {stepStatus}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-extrabold text-sm shadow-glow hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-black" />
                      <span>
                        Lock {calc.formattedUnits} SOL & Pay ${invoice.usdcAmount} USDC
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-700">
                  <QRCodeSVG value={solanaPayUrl} size={180} level="M" />
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
                  Scan with any Solana Pay compatible mobile wallet (Phantom, Solflare, Dialect) to pay via ZeroSell.
                </p>
                <div className="mt-3 text-[11px] text-emerald-400 font-mono">
                  Standard URI: solana:{invoice.merchantPubkey.slice(0, 8)}...
                </div>
              </div>
            )}
          </>
        ) : (
          /* Payment Success View */
          <div className="text-center py-4 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white">
                Payment Settled!
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Merchant received ${invoice.usdcAmount.toFixed(2)} USDC directly from the ZeroSell liquidity pool. Your {calc.formattedUnits} SOL is safely locked in your non-custodial Anchor Vault PDA.
              </p>
            </div>

            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Invoice:</span>
                <span className="font-mono text-gray-200">#{invoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Locked Collateral:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {calc.formattedUnits} SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Debt:</span>
                <span className="font-mono text-gray-200">
                  ${(invoice.usdcAmount * 1.005).toFixed(2)} USDC (0.5% fee)
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={successResult.solscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
              >
                <span>View on Solscan Devnet</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-glow hover:bg-emerald-400 transition-colors"
              >
                Close & View Vault Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

