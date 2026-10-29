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
        <div className="flex flex-col min-h-screen bg-[#0B0F19] text-gray-100">
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

          {/* Hackathon Footer */}
          <footer className="border-t border-gray-800/80 bg-gray-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-gray-500">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-bold text-gray-300">ZeroSell Pay</span>
                <span>— Atomic Collateralized Payments on Solana</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Dev3pack: Best App Overall ($10,000 Prize)
                </span>
                <span className="font-mono text-gray-400">
                  Program: 3TKiwrS9...4ddZDv
                </span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center space-x-1 transition-colors"
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

