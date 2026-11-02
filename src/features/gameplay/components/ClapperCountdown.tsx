"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, Film } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";

interface ClapperCountdownProps {
  onComplete: () => void;
  isMuted?: boolean;
}

type IntroPhase = "FIRST_LOOK" | "CLAPPER_SNAP" | "ACTION";

export const ClapperCountdown: React.FC<ClapperCountdownProps> = ({
  onComplete,
  isMuted = false,
}) => {
  const [phase, setPhase] = useState<IntroPhase>("FIRST_LOOK");
  const [countdown, setCountdown] = useState<number>(3);
  const [isStickClosed, setIsStickClosed] = useState<boolean>(false);
  const completedRef = useRef(false);

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  const handleSkipOrSnap = () => {
    if (phase === "FIRST_LOOK") {
      // First look'tayken dokunulduğunda hemen klakete geç ve vurdur
      setPhase("CLAPPER_SNAP");
      if (!isMuted) audio.playChessMove();
      haptic.medium();
      setIsStickClosed(true);
      setTimeout(() => {
        setPhase("ACTION");
      }, 180);
      setTimeout(() => {
        handleFinish();
      }, 750);
    } else {
      // Klaket anındayken dokunulursa anında oyunu başlat
      handleFinish();
    }
  };

  // 1. AŞAMA: 3 saniyelik "Tahtayı İnceleme / First Look" süresi
  useEffect(() => {
    if (phase !== "FIRST_LOOK") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // First look bitti -> Klaket vurma aşamasına geç
          setPhase("CLAPPER_SNAP");
          return 0;
        }
        if (!isMuted) audio.playTick(500);
        haptic.light();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isMuted]);

  // 2. AŞAMA: Klaket animasyonu ve "AKSİYON!" geçişi
  useEffect(() => {
    if (phase !== "CLAPPER_SNAP") return;

    // Klaket kolunu kapat ve ses çıkar
    const snapTimer = setTimeout(() => {
      setIsStickClosed(true);
      if (!isMuted) audio.playChessMove();
      haptic.medium();
    }, 120);

    const actionTimer = setTimeout(() => {
      setPhase("ACTION");
    }, 280);

    const finishTimer = setTimeout(() => {
      handleFinish();
    }, 1050);

    return () => {
      clearTimeout(snapTimer);
      clearTimeout(actionTimer);
      clearTimeout(finishTimer);
    };
  }, [phase, isMuted]);

  // ── FIRST LOOK GÖRÜNÜMÜ: Tahta tamamen açık ve net görünür ───
  if (phase === "FIRST_LOOK") {
    return (
      <div
        onClick={handleSkipOrSnap}
        className="fixed inset-0 z-40 flex flex-col items-center justify-between pointer-events-auto select-none cursor-pointer p-4 pb-8"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      >
        {/* Üst Bilgi Kartı: Tahtayı İncele Süresi */}
        <div className="w-full max-w-sm flex flex-col items-center gap-1.5 mt-16 sm:mt-20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#14171D]/95 border border-[#D9A441]/60 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <Eye className="w-4 h-4 text-[#D9A441]" />
            <span className="text-xs font-mono font-bold tracking-[0.18em] text-[#D9A441] uppercase">
              TAHTAYI İNCELE · {countdown}S
            </span>
          </div>

          <span className="text-[10px] font-mono text-[#F1EEE7]/70 tracking-wider">
            (Hemen başlamak için ekrana dokun)
          </span>
        </div>

        {/* Alt Vizör Çerçevesi Notu */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F1115]/80 border border-white/10 text-[9px] font-mono text-[#8A8F9A]">
          <Film className="w-3 h-3 text-[#D9A441]" />
          <span>KODAK 5219 · KADRAJ HAZIRLANIYOR</span>
        </div>
      </div>
    );
  }

  // ── KLAKET & AKSİYON GÖRÜNÜMÜ: Tatlı analog klaket sahnesi ───
  return (
    <div
      onClick={handleSkipOrSnap}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] select-none cursor-pointer animate-in fade-in duration-200"
    >
      <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
        {/* Klaket Üst Çubuğu (Açılıp kapanan 35mm ahşap kol) */}
        <div
          className="w-52 sm:w-60 h-7 rounded-t-lg relative overflow-hidden border border-white/20 origin-bottom-left transition-transform duration-150 ease-out"
          style={{
            background:
              "repeating-linear-gradient(45deg, #111, #111 14px, #E8E6E1 14px, #E8E6E1 28px)",
            transform: isStickClosed ? "rotate(0deg)" : "rotate(-18deg)",
          }}
        />

        {/* Klaket Gövdesi & Serif Tipografi */}
        <div className="bg-[#14171D] border border-white/15 rounded-b-2xl p-6 w-52 sm:w-60 shadow-2xl flex flex-col items-center relative -mt-0.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A8F9A] mb-2">
            SAHNE 01 · ÇEKİM 01
          </span>

          <div className="h-16 flex items-center justify-center">
            {phase === "ACTION" ? (
              <span className="font-serif text-3xl font-black text-[#D9A441] tracking-wider animate-in zoom-in-90 duration-150">
                AKSİYON!
              </span>
            ) : (
              <span className="font-serif text-xl font-bold text-[#E8E6E1] tracking-wide">
                KAYIT BAŞLIYOR
              </span>
            )}
          </div>

          <span className="text-[9px] font-mono text-[#8A8F9A]/60 mt-2">
            (Atlamak için dokun)
          </span>
        </div>
      </div>
    </div>
  );
};
