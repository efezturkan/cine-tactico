"use client";

import React, { useState, useEffect, useRef } from "react";
import { Film } from "lucide-react";
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
  const [countdown, setCountdown] = useState<number>(5);
  const [isStickClosed, setIsStickClosed] = useState<boolean>(false);
  const [isLetterboxOpen, setIsLetterboxOpen] = useState<boolean>(false);
  const completedRef = useRef(false);

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  const triggerClapperSequence = () => {
    // Sinematik üst ve alt siyah bantları (letterbox) içeri al
    setIsLetterboxOpen(true);
    setPhase("CLAPPER_SNAP");

    // 150ms sonra klaket kolunu vurdur ve ses çıkar
    const snapTimer = setTimeout(() => {
      setIsStickClosed(true);
      if (!isMuted) audio.playChessMove();
      haptic.medium();
    }, 150);

    // 320ms sonra AKSİYON! yazısına geç
    const actionTimer = setTimeout(() => {
      setPhase("ACTION");
    }, 320);

    // 1050ms sonra açılışı bitir ve oyuna geç
    const finishTimer = setTimeout(() => {
      setIsLetterboxOpen(false);
      setTimeout(() => {
        handleFinish();
      }, 180);
    }, 1050);

    return () => {
      clearTimeout(snapTimer);
      clearTimeout(actionTimer);
      clearTimeout(finishTimer);
    };
  };

  const handleSkipOrSnap = () => {
    if (phase === "FIRST_LOOK") {
      // 5-4-3-2-1 anında dokunulursa beklemeden doğrudan klaket vuruşuna geç
      triggerClapperSequence();
    } else {
      // Klaket anında dokunulursa anında oyunu başlat
      handleFinish();
    }
  };

  // 1. AŞAMA: 5 saniyelik Tahtayı İnceleme / First Look geri sayımı (5, 4, 3, 2, 1)
  useEffect(() => {
    if (phase !== "FIRST_LOOK") return;

    if (!isMuted) audio.playTick(460);
    haptic.light();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Geri sayım bitti -> Klaket ve sinematik geçişi başlat
          triggerClapperSequence();
          return 0;
        }
        if (!isMuted) audio.playTick(460 + (6 - prev) * 35);
        haptic.light();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isMuted]);

  return (
    <>
      {/* ── SİNEMATİK ÜST VE ALT SİYAH GEÇİŞ BANTLARI (CINEMATIC LETTERBOX BARS) ─── */}
      <div
        className="fixed top-0 left-0 right-0 bg-[#07080B] z-50 pointer-events-none transition-transform duration-300 ease-out border-b border-[#D9A441]/20"
        style={{
          height: "15vh",
          transform: isLetterboxOpen ? "translateY(0)" : "translateY(-100%)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#07080B] z-50 pointer-events-none transition-transform duration-300 ease-out border-t border-[#D9A441]/20"
        style={{
          height: "15vh",
          transform: isLetterboxOpen ? "translateY(0)" : "translateY(100%)",
        }}
      />

      {/* ── 1. AŞAMA: KUTULARIN ORTASINDA 5-4-3-2-1 GERİ SAYIM ─── */}
      {phase === "FIRST_LOOK" && (
        <div
          onClick={handleSkipOrSnap}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-auto select-none cursor-pointer p-4"
          style={{
            background: "rgba(11, 13, 18, 0.25)",
          }}
        >
          {/* Üst Bilgi Rozeti */}
          <div className="absolute top-16 sm:top-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14171D]/90 border border-white/10 text-[10px] font-mono text-[#D9A441] animate-in fade-in slide-in-from-top-2 duration-200">
            <Film className="w-3 h-3 text-[#D9A441]" />
            <span>KADRAJI İNCELE</span>
          </div>

          {/* Tam Ortada (Seçilen Kutuların Üzerinde) 35mm Lens Geri Sayım Çemberi */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center bg-[#14171D]/90 border-2 border-[#D9A441] shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-sm">
              {/* Dış 35mm Çizgili Halka */}
              <div
                className="absolute inset-1.5 rounded-full border border-dashed border-[#D9A441]/40 animate-spin"
                style={{ animationDuration: "12s" }}
              />

              {/* Viewfinder Köşe İşaretleri Çember Üzerinde */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#D9A441]" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#D9A441]" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-[#D9A441]" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#D9A441]" />

              {/* 5-4-3-2-1 Sayısı (Her saniye yumuşak darbe ile yenilenir) */}
              <div
                key={countdown}
                className="font-serif text-5xl sm:text-6xl font-black text-[#D9A441] leading-none animate-in zoom-in-75 duration-200 select-none"
              >
                {countdown}
              </div>

              <span className="text-[8px] font-mono tracking-widest text-[#A5A8B0] uppercase mt-1">
                SANİYE
              </span>
            </div>

            {/* Alt İpucu Metni */}
            <span className="text-[10px] font-mono text-[#F1EEE7]/60 tracking-wider mt-5 bg-[#0F1115]/80 px-3 py-1 rounded-full border border-white/10">
              (Atlamak için ekrana dokun)
            </span>
          </div>
        </div>
      )}

      {/* ── 2. AŞAMA: ORTAYA GELEN VE VURAN KLAKET & AKSİYON ─── */}
      {(phase === "CLAPPER_SNAP" || phase === "ACTION") && (
        <div
          onClick={handleSkipOrSnap}
          className="fixed inset-0 z-50 flex items-center justify-center select-none cursor-pointer animate-in fade-in duration-150"
        >
          <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200 relative z-10">
            {/* Klaket Üst Çubuğu (Açılıp aşağı tokat gibi vuran 35mm kol) */}
            <div
              className="w-56 sm:w-64 h-8 rounded-t-lg relative overflow-hidden border border-white/20 origin-bottom-left transition-transform duration-150 ease-in"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #111, #111 14px, #E8E6E1 14px, #E8E6E1 28px)",
                transform: isStickClosed ? "rotate(0deg)" : "rotate(-22deg)",
              }}
            />

            {/* Klaket Gövdesi & Serif Tipografi */}
            <div className="bg-[#14171D] border border-white/15 rounded-b-2xl p-6 w-56 sm:w-64 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center relative -mt-0.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A8F9A] mb-2">
                SAHNE 01 · ÇEKİM 01
              </span>

              <div className="h-14 flex items-center justify-center">
                {phase === "ACTION" ? (
                  <span className="font-serif text-3xl sm:text-4xl font-black text-[#D9A441] tracking-wider animate-in zoom-in-90 duration-150">
                    AKSİYON!
                  </span>
                ) : (
                  <span className="font-serif text-lg font-bold text-[#E8E6E1] tracking-wide">
                    KAYIT
                  </span>
                )}
              </div>

              <span className="text-[9px] font-mono text-[#8A8F9A]/60 mt-2">
                (Atlamak için dokun)
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
