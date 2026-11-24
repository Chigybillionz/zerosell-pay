import React from "react";

export const HeroRibbon: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Swiss / Neo-Brutalist Technical Grid Matrix */}
      <div 
        className="absolute inset-0 opacity-[0.25]" 
        style={{
          backgroundImage: "linear-gradient(to right, #0A0A0A 1px, transparent 1px), linear-gradient(to bottom, #0A0A0A 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      {/* 2. Architectural Accent Vectors */}
      <svg
        className="absolute right-0 top-1/2 -translate-y-[45%] w-[900px] h-[550px] max-w-none opacity-90"
        viewBox="0 0 900 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hard drop shadow line */}
        <path
          d="M 50,450 C 180,450 220,130 400,250 C 580,370 620,110 800,230 L 860,170"
          stroke="#0A0A0A"
          strokeWidth="10"
          strokeLinecap="square"
        />
        {/* Solana Vivid Violet Core Line */}
        <path
          d="M 44,444 C 174,444 214,124 394,244 C 574,364 614,104 794,224 L 854,164"
          stroke="#9945FF"
          strokeWidth="8"
          strokeLinecap="square"
        />
        {/* Solana Mint Signal Accent */}
        <path
          d="M 38,438 C 168,438 208,118 388,238 C 568,358 608,98 788,218 L 848,158"
          stroke="#14F195"
          strokeWidth="3"
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
};
