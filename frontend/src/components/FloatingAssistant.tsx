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
      {/* 1. Sleek Floating Pill Button (Bottom Right, matching Solana "Ask AI") */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-[#120f1c]/90 hover:bg-[#1a1529] border border-[#3b235d] text-white text-xs font-semibold shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#0d0915] rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
            </div>
          </div>
          <span className="tracking-wide">Ask ZeroSell AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* 2. Interactive Assistant Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-[#0a0812] border-l border-[#241738] p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1c122c]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1.5px] flex items-center justify-center">
                    <div className="w-full h-full bg-[#0d0915] rounded-[10px] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ZeroSell AI Assistant</h3>
                    <p className="text-[11px] text-gray-400">Instant answers on loans, collateral &amp; oracles</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedFaq(null);
                  }}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1a1228] transition-colors cursor-pointer"
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
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1 font-medium cursor-pointer"
                    >
                      <span>← Back to questions</span>
                    </button>

                    <div className="p-4 rounded-2xl bg-[#140e24] border border-[#2d1b4a] space-y-2">
                      <h4 className="text-sm font-bold text-white">{selectedFaq.q}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedFaq.a}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1">
                      Frequently Asked Questions
                    </span>
                    {FAQ_ITEMS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedFaq(item)}
                          className="w-full p-3.5 rounded-xl bg-[#120c1f] hover:bg-[#19112a] border border-[#23153b] hover:border-[#3d2466] text-left transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 rounded-lg bg-[#1e1333] flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5 text-purple-300" />
                            </div>
                            <span className="text-xs font-medium text-gray-200 group-hover:text-white">
                              {item.q}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-300 transition-colors shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#1c122c] text-center">
              <span className="text-[11px] text-gray-500">
                Powered by ZeroSell Protocol Smart Contracts on Solana Devnet
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
