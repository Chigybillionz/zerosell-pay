import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletContextProvider } from "./context/WalletContextProvider.js";
import { Navbar } from "./components/Navbar.js";
import { DemoStorefront } from "./pages/DemoStorefront.js";
import { UserDashboard } from "./pages/UserDashboard.js";
import { MerchantPortal } from "./pages/MerchantPortal.js";
import { Zap, ShieldCheck, Github, ExternalLink } from "lucide-react";

export const App: React.FC = () => {
  return (
    <WalletContextProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-web3-mesh text-gray-100 selection:bg-emerald-500/30 selection:text-emerald-300">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DemoStorefront />} />
              <Route path="/checkout" element={<DemoStorefront />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/merchant" element={<MerchantPortal />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Hackathon Modern Web3 Footer */}
          <footer className="border-t border-[#1a231d] bg-[#070908]/90 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-gray-400">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-bold text-gray-200">ZeroSell Pay</span>
                <span className="text-gray-500">— Non-Custodial Collateralized Payments on Solana</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                  Dev3pack: Best App Overall ($10,000 Prize)
                </span>
                <span className="font-mono text-gray-400 bg-[#121614] px-2.5 py-1 rounded-full border border-[#1f2923]">
                  PDA: 3TKiwr...4ddZDv
                </span>
                <a
                  href="https://github.com/Chigybillionz/zerosell-pay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center space-x-1.5 transition-colors bg-[#121614] px-2.5 py-1 rounded-full border border-[#1f2923]"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </WalletContextProvider>
  );
};

export default App;

