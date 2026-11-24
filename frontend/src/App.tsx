import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletContextProvider } from "./context/WalletContextProvider.js";
import { Navbar } from "./components/Navbar.js";
import { DemoStorefront } from "./pages/DemoStorefront.js";
import { UserDashboard } from "./pages/UserDashboard.js";
import { MerchantPortal } from "./pages/MerchantPortal.js";
import { CinematicFooter } from "./components/CinematicFooter.js";
import { FloatingAssistant } from "./components/FloatingAssistant.js";

export const App: React.FC = () => {
  return (
    <WalletContextProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-black text-gray-100 selection:bg-white/20 selection:text-white">
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

          {/* Cinematic Editorial Footer */}
          <CinematicFooter onLaunchClick={() => {
            if (window.location.pathname !== "/" && window.location.pathname !== "/checkout") {
              window.location.href = "/checkout";
            } else {
              const el = document.getElementById("checkout-experience");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }} />

          {/* Floating AI Assistant (Bottom Right) */}
          <FloatingAssistant />
        </div>
      </BrowserRouter>
    </WalletContextProvider>
  );
};

export default App;

