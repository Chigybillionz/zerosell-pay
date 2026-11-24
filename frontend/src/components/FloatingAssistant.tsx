import React, { useState } from "react";
import { Sparkles, X, MessageSquare, ArrowRight, ShieldCheck, Zap, Coins, ChevronRight } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  icon: any;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "How does ZeroSell let me spend without selling?",
    a: "Instead of selling your SOL on a DEX and paying capital gains tax, ZeroSell deposits your SOL into an isolated, non-custodial smart contract vault. The protocol pool immediately disburses clean USDC directly to the merchant.",
    icon: Zap,
  },
  {
    q: "What happens if SOL drops in price?",
    a: "ZeroSell uses an ultra-conservative 50% initial LTV (150% overcollateralization). Your position remains completely safe unless SOL drops by more than 33.3% from the lock price. You can add collateral anytime from your Vault Dashboard.",
    icon: ShieldCheck,
  },
  {
    q: "How and when do I get my SOL back?",
    a: "Whenever you want! Go to your Vault Dashboard, click 'Repay', and return the exact USDC debt. Your personal smart contract PDA instantly releases 100% of your collateral with zero penalty.",
    icon: Coins,
  },
  {
    q: "Who pays for Solana gas fees?",
    a: "ZeroSell features an off-chain Node.js Gasless Relayer that co-signs transactions as feePayer. You pay $0.00 in SOL network gas fees.",
    icon: Sparkles,
  },
];

export const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null);

  return (
    <>
      {/* 1. Sleek Floating Pill Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="tracking-wide">Zero Sell Guide</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </button>
      </div>

      {/* 2. Interactive Assistant Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Zero Sell Protocol Guide</h3>
                    <p className="text-[11px] text-neutral-400">Instant answers on loans, collateral &amp; oracles</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedFaq(null);
                  }}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="py-6 space-y-4">
                {selectedFaq ? (
                  <div className="space-y-4 animate-fade-in">
                    <button
                      onClick={() => setSelectedFaq(null)}
                      className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1 font-medium cursor-pointer"
                    >
                      <span>← Back to questions</span>
                    </button>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                      <h4 className="text-sm font-bold text-white">{selectedFaq.q}</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{selectedFaq.a}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                      Frequently Asked Questions
                    </span>
                    {FAQ_ITEMS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedFaq(item)}
                          className="w-full p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-left transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5 text-neutral-300" />
                            </div>
                            <span className="text-xs font-medium text-neutral-200 group-hover:text-white">
                              {item.q}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-neutral-800 text-center">
              <span className="text-[11px] text-neutral-500">
                Zero Sell Protocol Smart Contracts on Solana Devnet
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
