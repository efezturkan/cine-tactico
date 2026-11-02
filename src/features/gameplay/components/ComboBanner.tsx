"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface ComboBannerProps {
  comboStreak: number;
  lastPoints: number;
}

export const ComboBanner: React.FC<ComboBannerProps> = ({ comboStreak, lastPoints }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (comboStreak > 0) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [comboStreak, lastPoints]);

  if (!visible || comboStreak <= 0) return null;

  const titles = [
    "KARE MÜHÜRLENDİ",
    "İKİLİ SERİ · ×2",
    "SİNEFİL SERİSİ · ×3",
    "KUSURSUZ KADRAJ · ×4",
    "USTA YÖNETMEN · ×5",
  ];

  const title = titles[Math.min(comboStreak - 1, titles.length - 1)];

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-banner-in">
      <div className="px-4 py-1.5 rounded-2xl bg-panel border-2 border-scored text-ink font-display font-extrabold italic uppercase text-sm tracking-wide shadow-2xl flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-scored" />
        <span>{title}</span>
        <span className="text-xs font-mono bg-scored/20 text-scored border border-scored/40 px-2 py-0.5 rounded-lg font-bold">
          +{lastPoints}
        </span>
      </div>
    </div>
  );
};
