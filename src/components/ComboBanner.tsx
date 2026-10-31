"use client";

import React, { useEffect, useState } from "react";
import { Flame, Sparkles } from "lucide-react";

interface ComboBannerProps {
  comboStreak: number;
  lastPoints: number;
}

export const ComboBanner: React.FC<ComboBannerProps> = ({ comboStreak, lastPoints }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (comboStreak > 0) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [comboStreak, lastPoints]);

  if (!visible || comboStreak <= 0) return null;

  const titles = [
    "İYİ HAMLE! +100",
    "COMBO x2! 🔥 HARİKA!",
    "COMBO x3! ⚡ SİNEFİL!",
    "COMBO x4! 💥 EFSANE VURUŞ!",
    "DURDURULAMAZ! 🏆 REKOR!",
  ];

  const title = titles[Math.min(comboStreak - 1, titles.length - 1)];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in zoom-in-50 fade-in slide-in-from-bottom-3 duration-200">
      <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-black text-sm sm:text-base tracking-wider shadow-2xl shadow-amber-500/50 border border-white/30 flex items-center gap-2">
        <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
        <span>{title}</span>
        <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full font-bold">
          +{lastPoints}
        </span>
      </div>
    </div>
  );
};
