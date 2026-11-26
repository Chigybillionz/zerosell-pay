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
      <div className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 px-4 py-2.5 bg-white hover:bg-[#F8FAF9] border-2 border-[#0A0A0A] text-[#0A0A0A] text-xs font-black uppercase shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] transition-all group cursor-pointer"
        >
          <div className="w-5 h-5 bg-[#9945FF] flex items-center justify-center border border-[#0A0A0A]">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="tracking-wider">Zero Sell Guide</span>
          <span className="w-2 h-2 bg-[#14F195] border border-[#0A0A0A]" />
        </button>
      </div>

      {/* 2. Interactive Assistant Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-white border-l-3 border-[#0A0A0A] p-6 flex flex-col justify-between shadow-[-8px_0px_0px_#0A0A0A] overflow-y-auto text-[#0A0A0A]">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#0A0A0A]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-[#9945FF] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-[#0A0A0A]">Zero Sell Protocol Guide</h3>
                    <p className="text-[11px] font-medium text-neutral-600">Instant answers on loans, collateral &amp; oracles</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedFaq(null);
                  }}
                  className="p-1.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-[#0A0A0A] hover:bg-[#F8FAF9] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Body */}
              <div className="py-6 space-y-4">
                {selectedFaq ? (
                  <div className="space-y-4 animate-fade-in">
                    <button
                      onClick={() => setSelectedFaq(null)}
                      className="text-xs font-black uppercase text-neutral-600 hover:text-black flex items-center space-x-1 cursor-pointer"
                    >
                      <span>← Back to questions</span>
                    </button>

                    <div className="p-4 bg-[#F8FAF9] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] space-y-2">
                      <h4 className="text-sm font-black uppercase text-[#0A0A0A]">{selectedFaq.q}</h4>
                      <p className="text-xs text-neutral-700 leading-relaxed font-medium">{selectedFaq.a}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <span className="text-[11px] uppercase font-black tracking-wider text-neutral-600 block mb-1">
                      Frequently Asked Questions
                    </span>
                    {FAQ_ITEMS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedFaq(item)}
                          className="w-full p-3.5 bg-[#F8FAF9] hover:bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#0A0A0A] text-left transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 bg-white border border-[#0A0A0A] flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5 text-[#0A0A0A]" />
                            </div>
                            <span className="text-xs font-black uppercase text-[#0A0A0A]">
                              {item.q}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#0A0A0A] stroke-[2.5] shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t-2 border-[#0A0A0A] text-center">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-600">
                Zero Sell Protocol Smart Contracts on Solana Devnet
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
