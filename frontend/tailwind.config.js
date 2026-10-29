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
        background: "#0B0F19",
        card: "#111827",
        "card-hover": "#162032",
        border: "#1F2937",
        solana: {
          emerald: "#14F195",
          purple: "#9945FF",
          cyan: "#00F0FF",
        },
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

