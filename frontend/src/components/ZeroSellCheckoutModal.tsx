import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  saveUserPosition,
  logUserTransaction,
  getDeviceId,
  StoredPosition,
} from "../utils/storage.js";

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
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();
  const { solPrice, calculateCollateralNeeded } = usePythPrices();
  const { executeGaslessCheckout, loading } = useZeroSellProgram();

  const [activeTab, setActiveTab] = useState<"wallet" | "qr">("wallet");
  const [editableAmount, setEditableAmount] = useState<number>(invoice.usdcAmount);
  const [isEditingAmount, setIsEditingAmount] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    signature: string;
    solscanUrl: string;
    collateralUnits: number;
  } | null>(null);
  const [stepStatus, setStepStatus] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync internal editable amount when incoming invoice changes
  React.useEffect(() => {
    setEditableAmount(invoice.usdcAmount);
    setIsEditingAmount(false);
  }, [invoice.usdcAmount, invoice.id]);

  if (!isOpen) return null;

  const currentUsdcAmount = editableAmount > 0 ? editableAmount : invoice.usdcAmount;

  // Real-time calculation based on Pyth price and 50% LTV
  const calc = calculateCollateralNeeded(currentUsdcAmount, "SOL", 50.0);

  // Solana Pay URL (spec compliant)
  const solanaPayUrl = `solana:${invoice.merchantPubkey}?amount=${currentUsdcAmount}&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=${invoice.id}&label=ZeroSell+Pay&message=${encodeURIComponent(
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
        colors: ["#14F195", "#9945FF", "#0A0A0A"],
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
        usdcAmount: currentUsdcAmount,
        invoiceId: invoice.id,
      });

      setStepStatus("3/3 Instant Merchant Settlement Confirmed!");

      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#14F195", "#9945FF", "#0A0A0A"],
      });

      const collateralAmt = result.requiredCollateral || calc.collateralUnits;
      const borrowerKey = publicKey?.toBase58() || "DUaNPqVtrf8rS3ZUH3FVVAbhVmVyJknFfM5zP2Jm79wZ";
      const devId = getDeviceId();

      // Persist the active position to storage so it appears on Dashboard
      const newPos: StoredPosition = {
        publicKey: result.signature,
        invoiceId: invoice.id,
        title: invoice.title,
        borrower: borrowerKey,
        merchant: invoice.merchantPubkey,
        collateralMint: "So11111111111111111111111111111111111111112",
        collateralAmount: collateralAmt,
        collateralAmountRaw: Math.floor(collateralAmt * 1e9).toString(),
        debtUsdcAmount: currentUsdcAmount,
        entryPriceUsd: solPrice,
        currentCollateralValueUsd: collateralAmt * solPrice,
        currentLtvPercent: 50.0,
        createdAt: Date.now(),
        status: "Active",
        statusRaw: 0,
        unrealizedGainUsd: 0,
        signature: result.signature,
        solscanUrl: result.solscanUrl,
        deviceId: devId,
      };

      saveUserPosition(newPos);

      // Log transaction to persistent history
      logUserTransaction({
        signature: result.signature,
        invoiceId: invoice.id,
        title: invoice.title,
        usdcAmount: currentUsdcAmount,
        collateralAmount: collateralAmt,
        collateralMint: "SOL",
        borrower: borrowerKey,
        timestamp: Date.now(),
        type: "LOCK_AND_PAY",
        solscanUrl: result.solscanUrl,
      });

      // Notify other views (like UserDashboard) of the update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("zerosell_storage_updated"));
      }

      setSuccessResult({
        signature: result.signature,
        solscanUrl: result.solscanUrl,
        collateralUnits: collateralAmt,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border-3 border-[#0A0A0A] p-6 sm:p-8 shadow-[8px_8px_0px_#0A0A0A] overflow-hidden text-[#0A0A0A]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#F8FAF9] shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {!successResult ? (
          <>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#14F195] border-2 border-[#0A0A0A] text-[11px] font-mono font-black uppercase text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] mb-3">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ZeroSell Non-Custodial Protocol</span>
              </div>
              <h3 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tight">
                Pay Without Selling
              </h3>
              <p className="text-xs text-neutral-600 font-medium mt-1">
                Keep 100% of your SOL upside. Settle ${currentUsdcAmount.toFixed(2)} USDC immediately.
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex bg-[#F8FAF9] p-1 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] mb-6 gap-1">
              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "wallet"
                    ? "bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]"
                    : "bg-white text-[#0A0A0A] hover:bg-neutral-100 border border-transparent"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>1-Click Gasless Wallet</span>
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "qr"
                    ? "bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]"
                    : "bg-white text-[#0A0A0A] hover:bg-neutral-100 border border-transparent"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Solana Pay QR</span>
              </button>
            </div>

            {activeTab === "wallet" ? (
              <div>
                {/* Financial Math Breakdown Card */}
                <div className="bg-[#F8FAF9] p-4 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] mb-6 space-y-3 font-medium">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-600 uppercase font-bold">Invoice Amount:</span>
                    {isEditingAmount ? (
                      <div className="flex items-center space-x-1.5">
                        <div className="relative flex items-center">
                          <span className="absolute left-2 text-xs font-mono font-black text-neutral-400">$</span>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={editableAmount || ""}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              setEditableAmount(isNaN(v) ? 0 : v);
                            }}
                            className="w-24 pl-5 pr-2 py-1 bg-white border-2 border-[#0A0A0A] font-mono font-black text-xs text-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A] focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">USDC</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingAmount(false)}
                          className="px-2 py-0.5 bg-[#14F195] text-[#0A0A0A] border-2 border-[#0A0A0A] font-mono font-bold text-[10px] uppercase shadow-[1px_1px_0px_#0A0A0A] cursor-pointer"
                        >
                          Set
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-[#0A0A0A]">
                          ${currentUsdcAmount.toFixed(2)} USDC
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingAmount(true)}
                          className="text-[10px] uppercase font-mono font-black text-[#9945FF] hover:underline cursor-pointer bg-purple-50 px-1.5 py-0.5 border border-[#9945FF]/30"
                          title="Click to edit amount"
                        >
                          Edit ✎
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-600 uppercase font-bold">Pyth SOL/USD Oracle:</span>
                    <span className="font-mono text-[#0A0A0A] font-bold">
                      ${solPrice.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-600 uppercase font-bold">Collateral Required (50% LTV):</span>
                    <span className="font-mono font-black text-[#0A0A0A]">
                      {calc.formattedUnits} SOL (${calc.collateralValueUsd.toFixed(2)})
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-600 uppercase font-bold">Gas &amp; Network Fee:</span>
                    <span className="font-mono font-black text-[#0A0A0A] flex items-center space-x-1">
                      <span>$0.00 (Sponsored by Relayer)</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t-2 border-[#0A0A0A] flex justify-between items-center text-xs">
                    <span className="text-[#0A0A0A] font-black uppercase">Merchant Receives:</span>
                    <span className="font-mono font-black text-[#0A0A0A] text-sm">
                      ${currentUsdcAmount.toFixed(2)} USDC Instantly
                    </span>
                  </div>
                </div>

                {/* Progress / Step status indicator if loading */}
                {stepStatus && (
                  <div className="mb-4 p-2.5 bg-[#9945FF] text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-center text-xs font-mono font-black uppercase">
                    {stepStatus}
                  </div>
                )}

                {/* Error Banner with 1-click Recovery */}
                {errorMsg && (
                  <div className="mb-4 p-3.5 bg-red-50 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] text-xs text-[#0A0A0A] space-y-2">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <div className="flex-1">
                        <p className="font-black uppercase text-red-700">Devnet Account Notice</p>
                        <p className="text-[11px] text-neutral-700 mt-0.5 leading-relaxed font-medium">
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
                        className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 text-[#0A0A0A] text-[11px] font-black uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-center transition-all cursor-pointer"
                      >
                        Claim Free Devnet SOL ↗
                      </button>
                      <button
                        type="button"
                        onClick={handleDemoConfirm}
                        className="flex-1 py-2 px-3 bg-[#14F195] hover:bg-[#0fe088] text-[#0A0A0A] text-[11px] font-black uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-center transition-all cursor-pointer"
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
                  className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-[#9945FF] hover:bg-[#8935ef] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-white font-black text-sm uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>
                        Lock {calc.formattedUnits} SOL &amp; Pay ${currentUsdcAmount.toFixed(2)} USDC
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
                  <QRCodeSVG value={solanaPayUrl} size={180} level="M" />
                </div>
                <p className="text-xs text-neutral-600 font-medium mt-4 text-center max-w-xs">
                  Scan with any Solana Pay compatible mobile wallet (Phantom, Solflare, Dialect) to pay via ZeroSell.
                </p>
                <div className="mt-3 text-[11px] text-[#0A0A0A] font-mono font-bold bg-[#F8FAF9] px-3 py-1 border border-[#0A0A0A]">
                  Standard URI: solana:{invoice.merchantPubkey.slice(0, 8)}...
                </div>
              </div>
            )}
          </>
        ) : (
          /* Payment Success View */
          <div className="text-center py-4 space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-[#14F195] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex items-center justify-center mx-auto text-[#0A0A0A]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tight">
                Payment Settled!
              </h3>
              <p className="text-xs text-neutral-600 font-medium mt-1 max-w-sm mx-auto">
                Merchant received ${invoice.usdcAmount.toFixed(2)} USDC directly from the ZeroSell liquidity pool. Your {calc.formattedUnits} SOL is safely locked in your non-custodial Anchor Vault PDA.
              </p>
            </div>

            <div className="bg-[#F8FAF9] p-4 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-600 uppercase font-bold">Invoice:</span>
                <span className="font-mono text-[#0A0A0A] font-bold">#{invoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 uppercase font-bold">Locked Collateral:</span>
                <span className="font-mono text-[#0A0A0A] font-black">
                  {calc.formattedUnits} SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 uppercase font-bold">Total Debt:</span>
                <span className="font-mono text-[#0A0A0A] font-bold">
                  ${(currentUsdcAmount * 1.005).toFixed(2)} USDC (0.5% fee)
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={successResult.solscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-white hover:bg-neutral-100 text-[#0A0A0A] text-xs font-black uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] transition-all"
              >
                <span>View on Solscan Devnet</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/dashboard");
                }}
                className="w-full py-3.5 bg-[#9945FF] hover:bg-[#8935ef] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-white font-black text-xs uppercase tracking-wider border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>View on Vault Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
