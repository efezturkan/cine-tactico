"use client";

import React from "react";

/** Arama sheet'inin üstünde tek satırlık canlı kalan süre göstergesi (sayaç GameView'daki ile aynı kaynaktan). */
export const SearchClock: React.FC<{ secondsRemaining?: number; shotClock?: number }> = ({
  secondsRemaining,
  shotClock = 12,
}) => {
  if (secondsRemaining === undefined) return null;
  const urgent = secondsRemaining <= 3;
  const pct = Math.max(0, Math.min(100, (secondsRemaining / shotClock) * 100));
  return (
    <div className="flex items-center gap-2 mb-2.5 shrink-0" role="timer" aria-live="off" data-testid="search-clock">
      <div className="flex-1 h-1 bg-[#181B22] rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${urgent ? "bg-[#E5484D]" : "bg-[#D9A441]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-[11px] font-bold tabular-nums ${urgent ? "text-[#E5484D]" : "text-[#D9A441]"}`}>
        00:{String(Math.max(0, Math.ceil(secondsRemaining))).padStart(2, "0")}
      </span>
    </div>
  );
};
