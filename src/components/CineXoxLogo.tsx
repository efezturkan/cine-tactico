"use client";

import React from "react";

export interface CineXoxLogoProps {
  variant?: "full" | "symbol" | "badge" | "hero";
  size?: number;
  monochrome?: boolean;
  className?: string;
}

/**
 * CINE-XOX — Soft Game Identity & Illustrated Trajectory Mark
 * Includes a "hero" illustration variant inspired by Penalty Mentality's goal-net + dotted arc SVG,
 * translated for CINE-XOX as a 3×3 cinema screen grid with a golden dotted shot trajectory
 * hitting the top-right corner cell with a 35mm film reel.
 */
export const CineXoxLogo: React.FC<CineXoxLogoProps> = ({
  variant = "symbol",
  size = 64,
  monochrome = false,
  className = "",
}) => {
  const bgSurface = "#121A2B";
  const raisedCell = "#16213A";
  const gold = monochrome ? "#F4F6FA" : "#F5C451";
  const blue = monochrome ? "#9AA6BD" : "#4C9AFF";
  const red = monochrome ? "#F4F6FA" : "#FF6B4A";
  const ink = "#F4F6FA";
  const muted = "#9AA6BD";

  if (variant === "hero") {
    return (
      <svg
        viewBox="0 0 220 130"
        className={`mx-auto select-none ${className || "w-48 sm:w-56"}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Cinema Frame (like Penalty Mentality's goal post) */}
        <path
          d="M 24 92 L 24 16 L 196 16 L 196 92"
          stroke={ink}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 3x3 Grid Mesh Lines inside the Cinema Screen */}
        <g stroke={ink} strokeOpacity="0.16" strokeWidth="1.2">
          <line x1="81" y1="19" x2="81" y2="90" />
          <line x1="139" y1="19" x2="139" y2="90" />
          <line x1="27" y1="42" x2="193" y2="42" />
          <line x1="27" y1="66" x2="193" y2="66" />
          <line x1="27" y1="90" x2="193" y2="90" />
        </g>

        {/* Subtle X and O Marks inside the Screen Grid */}
        <g opacity="0.45">
          {/* Bottom-left X mark */}
          <path
            d="M 48 73 L 58 83 M 58 73 L 48 83"
            stroke={red}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Center O mark */}
          <circle
            cx="110"
            cy="54"
            r="6.5"
            stroke={blue}
            strokeWidth="2.5"
          />
        </g>

        {/* Golden Dotted Trajectory Arc from Bottom Center to Top-Right Corner Cell */}
        <path
          d="M 110 116 Q 116 58 168 29"
          stroke={gold}
          strokeWidth="3"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />

        {/* Target Top-Right Cell Glow & 35mm Film Reel / Ball */}
        <circle cx="168" cy="29" r="14" fill={gold} fillOpacity="0.18" />
        <circle cx="168" cy="29" r="10" fill={ink} stroke="#0B1220" strokeWidth="2" />
        <circle cx="168" cy="29" r="3" fill="#0B1220" />
        <circle cx="168" cy="22.5" r="1.4" fill="#0B1220" />
        <circle cx="168" cy="35.5" r="1.4" fill="#0B1220" />
        <circle cx="161.5" cy="29" r="1.4" fill="#0B1220" />
        <circle cx="174.5" cy="29" r="1.4" fill="#0B1220" />

        {/* Starting Cue Spot at Bottom Center */}
        <circle cx="110" cy="116" r="4.5" fill={gold} />
      </svg>
    );
  }

  const SymbolMark = ({ dim }: { dim: number }) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CINE-XOX Insignia"
      className="shrink-0 select-none"
    >
      <rect
        x="4"
        y="4"
        width="72"
        height="72"
        rx="18"
        fill={bgSurface}
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="2"
      />

      {/* 3x3 Grid Cells */}
      <rect x="15" y="15" width="14" height="14" rx="4" fill={gold} />
      <rect x="33" y="15" width="14" height="14" rx="4" fill={raisedCell} />
      <rect x="51" y="15" width="14" height="14" rx="4" fill={raisedCell} stroke={blue} strokeWidth="1.5" />

      <rect x="15" y="33" width="14" height="14" rx="4" fill={raisedCell} />
      <rect x="33" y="33" width="14" height="14" rx="4" fill={gold} />
      <rect x="51" y="33" width="14" height="14" rx="4" fill={raisedCell} />

      <rect x="15" y="51" width="14" height="14" rx="4" fill={raisedCell} stroke={blue} strokeWidth="1.5" />
      <rect x="33" y="51" width="14" height="14" rx="4" fill={raisedCell} />
      <rect x="51" y="51" width="14" height="14" rx="4" fill={gold} />

      {/* Diagonal X Marks */}
      <path d="M19.5 19.5L24.5 24.5M24.5 19.5L19.5 24.5" stroke="#0B1220" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M37.5 37.5L42.5 42.5M42.5 37.5L37.5 42.5" stroke="#0B1220" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M55.5 55.5L60.5 60.5M60.5 55.5L55.5 60.5" stroke="#0B1220" strokeWidth="2.4" strokeLinecap="round" />

      {/* Counter-Diagonal O Marks */}
      <circle cx="58" cy="22" r="3.2" stroke={blue} strokeWidth="2" />
      <circle cx="22" cy="58" r="3.2" stroke={blue} strokeWidth="2" />
    </svg>
  );

  if (variant === "badge") {
    return (
      <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
        <SymbolMark dim={size} />
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <SymbolMark dim={size} />
        <div className="mt-3 flex items-center gap-2">
          <span
            className="font-display text-3xl sm:text-4xl font-extrabold italic tracking-wide uppercase"
            style={{ color: ink }}
          >
            CINE-XOX
          </span>
        </div>
        <div
          className="mt-0.5 text-xs font-semibold uppercase tracking-widest"
          style={{ color: muted }}
        >
          <span>SİNEMA DÜELLOSU</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <SymbolMark dim={size} />
    </div>
  );
};
