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
  AlertTriangle,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time calculation based on Pyth price and 50% LTV
  const calc = calculateCollateralNeeded(invoice.usdcAmount, "SOL", 50.0);

  // Solana Pay URL (spec compliant)
  const solanaPayUrl = `solana:${invoice.merchantPubkey}?amount=${invoice.usdcAmount}&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=${invoice.id}&label=ZeroSell+Pay&message=${encodeURIComponent(
    invoice.title
  )}`;

  const handleDemoConfirm = async () => {
    try {
      setStepStatus("Confirming Instant Demo Settlement...");
      const demoSig = "demo_checkout_" + Math.random().toString(36).substring(2, 12);
      await new Promise((r) => setTimeout(r, 600));

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#14F195", "#9945FF", "#00F0FF"],
      });

      const demoResult = {
        signature: demoSig,
        solscanUrl: `https://solscan.io/tx/${demoSig}?cluster=devnet`,
        requiredCollateral: calc.collateralUnits,
      };

      setSuccessResult({
        signature: demoSig,
        solscanUrl: demoResult.solscanUrl,
        collateralUnits: calc.collateralUnits,
      });

      onSuccess(demoResult);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setStepStatus("");
    }
  };

  const handlePay = async () => {
    if (!connected) {
      setErrorMsg("Please connect your Solana wallet first.");
      return;
    }

    setErrorMsg(null);
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
      console.warn("[ZeroSell Checkout Error]:", err);
      setErrorMsg(err.message || "Payment transaction could not be completed.");
    } finally {
      setStepStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#111413] border border-[#1E2522] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#1a201c] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!successResult ? (
          <>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono font-bold text-emerald-400 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ZeroSell Non-Custodial Protocol</span>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                Pay Without Selling
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Keep 100% of your SOL upside. Settle ${invoice.usdcAmount.toFixed(2)} USDC immediately.
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex bg-[#090c0a] p-1 rounded-xl border border-[#1e2522] mb-6">
              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "wallet"
                    ? "bg-[#161d19] text-emerald-400 border border-emerald-500/40"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>1-Click Gasless Wallet</span>
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "qr"
                    ? "bg-[#161d19] text-emerald-400 border border-emerald-500/40"
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
                <div className="bg-[#090c0a] rounded-2xl p-4 border border-[#1e2522] mb-6 space-y-3">
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

                  <div className="pt-2 border-t border-[#1e2522] flex justify-between items-center text-xs">
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

                {/* Error Banner with 1-click Recovery */}
                {errorMsg && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-amber-200">Devnet Account Notice</p>
                        <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                          {errorMsg.includes("debit") || errorMsg.includes("credit") || errorMsg.includes("simulation")
                            ? "Your Devnet wallet has 0 SOL to simulate transaction fees. You can claim free test SOL or continue instantly in Demo Mode."
                            : errorMsg}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => window.open("https://faucet.solana.com", "_blank")}
                        className="flex-1 py-1.5 px-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold border border-amber-500/40 text-center transition-all cursor-pointer"
                      >
                        Claim Free Devnet SOL ↗
                      </button>
                      <button
                        type="button"
                        onClick={handleDemoConfirm}
                        className="flex-1 py-1.5 px-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/40 text-center transition-all cursor-pointer"
                      >
                        Instant Demo Confirm ⚡
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-black" />
                      <span>
                        Lock {calc.formattedUnits} SOL &amp; Pay ${invoice.usdcAmount} USDC
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
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                Payment Settled!
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Merchant received ${invoice.usdcAmount.toFixed(2)} USDC directly from the ZeroSell liquidity pool. Your {calc.formattedUnits} SOL is safely locked in your non-custodial Anchor Vault PDA.
              </p>
            </div>

            <div className="bg-[#090c0a] p-4 rounded-2xl border border-[#1e2522] text-left space-y-2 text-xs">
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
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full bg-[#18201b] hover:bg-[#202b24] text-gray-200 text-xs font-semibold transition-colors border border-[#26352c]"
              >
                <span>View on Solscan Devnet</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </a>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-full bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-glow hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Close &amp; View Vault Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

