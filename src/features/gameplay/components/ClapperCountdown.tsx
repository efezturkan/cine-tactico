"use client";

import React, { useState, useEffect } from "react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";

interface ClapperCountdownProps {
  onComplete: () => void;
  isMuted?: boolean;
}

export const ClapperCountdown: React.FC<ClapperCountdownProps> = ({
  onComplete,
  isMuted = false,
}) => {
  const [phase, setPhase] = useState<"3" | "2" | "1" | "ACTION">("3");

  useEffect(() => {
    if (!isMuted) audio.playSelect();
    haptic.light();

    const t1 = setTimeout(() => {
      setPhase("2");
      if (!isMuted) audio.playSelect();
      haptic.light();
    }, 380);

    const t2 = setTimeout(() => {
      setPhase("1");
      if (!isMuted) audio.playSelect();
      haptic.light();
    }, 760);

    const t3 = setTimeout(() => {
      setPhase("ACTION");
      if (!isMuted) audio.playChessMove();
      haptic.medium();
    }, 1140);

    const t4 = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, isMuted]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none cursor-pointer transition-opacity duration-200"
    >
      <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-150">
        {/* Klaket Çubuğu (35mm Siyah-Beyaz Çapraz Çizgiler) */}
        <div
          className="w-48 sm:w-56 h-6 rounded-t-lg mb-2 relative overflow-hidden border border-white/20"
          style={{
            background:
              "repeating-linear-gradient(45deg, #111, #111 12px, #E8E6E1 12px, #E8E6E1 24px)",
          }}
        />

        {/* Klaket Gövdesi & Büyük Serif Metin */}
        <div className="bg-[#14171D] border border-white/15 rounded-b-2xl p-6 w-48 sm:w-56 shadow-2xl flex flex-col items-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A8F9A] mb-2">
            SAHNE 01 · ÇEKİM 01
          </span>

          <div className="h-16 flex items-center justify-center">
            {phase === "ACTION" ? (
              <span className="font-serif text-2xl sm:text-3xl font-black text-[#D9A441] tracking-wider animate-pulse">
                AKSİYON!
              </span>
            ) : (
              <span className="font-serif text-5xl font-black text-[#E8E6E1] tracking-tight">
                {phase}
              </span>
            )}
          </div>

          <span className="text-[9px] font-mono text-[#8A8F9A]/60 mt-3">
            (Atlamak için dokun)
          </span>
        </div>
      </div>
    </div>
  );
};
