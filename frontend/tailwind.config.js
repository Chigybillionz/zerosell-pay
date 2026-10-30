/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080A09",
        card: "#111413",
        "card-hover": "#171B1A",
        border: "#1E2522",
        web3: {
          dark: "#080A09",
          card: "#111413",
          cardBorder: "#1E2522",
          cardGreen: "#0C2317",
          cardGreenBorder: "#1B402B",
          neon: "#00FF66",
          emerald: "#14F195",
          accent: "#FBBF24",
        },
        solana: {
          emerald: "#14F195",
          purple: "#9945FF",
          cyan: "#00F0FF",
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
        "grid-emerald": "linear-gradient(to right, rgba(20, 241, 149, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 241, 149, 0.05) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(20, 241, 149, 0.3)",
        "glow-purple": "0 0 25px -5px rgba(153, 69, 255, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};

