import React from "react";

export const HeroRibbon: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Deep Atmospheric Gradient Nebulas */}
      <div className="absolute -top-32 right-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-600/20 via-violet-900/15 to-transparent rounded-full blur-[130px]" />
      <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-gradient-to-bl from-purple-700/25 via-fuchsia-900/10 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[400px] bg-gradient-to-tr from-cyan-600/15 via-teal-900/10 to-transparent rounded-full blur-[110px]" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-600/10 via-teal-950/5 to-transparent rounded-full blur-[100px]" />

      {/* 2. Abstract 3D Luminous Ribbon Wave (SVG Vector with metallic gradient highlights) */}
      <svg
        className="absolute right-0 top-1/2 -translate-y-[45%] w-[1000px] h-[600px] max-w-none opacity-85 mix-blend-screen"
        viewBox="0 0 1000 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main tube body gradient (Deep metallic violet to midnight cyan) */}
          <linearGradient id="tubeBody" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#1a0b2e" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#3b156b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#7928ca" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#2a104e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0a2a30" stopOpacity="0.6" />
          </linearGradient>

          {/* Top specular ridge light (Glossy glass reflection) */}
          <linearGradient id="ridgeLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="20%" stopColor="#e9d5ff" stopOpacity="0.6" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#c084fc" stopOpacity="0.7" />
            <stop offset="90%" stopColor="#67e8f9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Bottom neon reflection line */}
          <linearGradient id="underGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9945FF" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#14F195" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.3" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ambient glow path */}
        <path
          d="M 50,480 C 180,480 220,120 400,240 C 580,360 620,100 800,220 C 890,280 940,160 1020,130"
          stroke="url(#underGlow)"
          strokeWidth="38"
          strokeLinecap="round"
          filter="url(#softGlow)"
          opacity="0.45"
        />

        {/* Main 3D Tube Body */}
        <path
          d="M 50,480 C 180,480 220,120 400,240 C 580,360 620,100 800,220 C 890,280 940,160 1020,130"
          stroke="url(#tubeBody)"
          strokeWidth="20"
          strokeLinecap="round"
          className="transition-all duration-700"
        />

        {/* Secondary inner contour reflection */}
        <path
          d="M 50,480 C 180,480 220,120 400,240 C 580,360 620,100 800,220 C 890,280 940,160 1020,130"
          stroke="url(#underGlow)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Sharp Specular Ridge Highlight (The signature glossy glass edge) */}
        <path
          d="M 50,480 C 180,480 220,120 400,240 C 580,360 620,100 800,220 C 890,280 940,160 1020,130"
          stroke="url(#ridgeLight)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Additional intersecting orbital curve for depth */}
        <path
          d="M 200,560 C 350,560 420,380 620,440 C 820,500 880,320 1020,310"
          stroke="url(#underGlow)"
          strokeWidth="5"
          strokeDasharray="8 12"
          opacity="0.35"
        />
      </svg>
    </div>
  );
};
