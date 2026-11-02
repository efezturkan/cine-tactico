"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Film } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";

interface ClapperCountdownProps {
  onComplete: () => void;
  isMuted?: boolean;
  onCountChange?: (count: 3 | 2 | 1 | null) => void;
}

type IntroPhase = "COUNTDOWN" | "CLAPPER_SNAP" | "ACTION";

export const ClapperCountdown: React.FC<ClapperCountdownProps> = ({
  onComplete,
  isMuted = false,
  onCountChange,
}) => {
  const [phase, setPhase] = useState<IntroPhase>("COUNTDOWN");
  const [isStickClosed, setIsStickClosed] = useState<boolean>(false);
  const [isLetterboxOpen, setIsLetterboxOpen] = useState<boolean>(false);

  const isCompletedRef = useRef<boolean>(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const registerTimeout = (fn: () => void, ms: number): NodeJS.Timeout => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  // Atomik, Idempotent Tekil Bitiş / Başlangıç Akışı
  const completeCountdown = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    clearAllTimeouts();
    onCountChange?.(null);
    onComplete();
  }, [onComplete, onCountChange]);

  // Ses ve Haptic Koruyucu Yürütme (Fail-Safe)
  const safePlayAudio = useCallback(
    (action: () => void) => {
      if (isMuted) return;
      try {
        action();
      } catch {
        // Ses engellense dahi akış durmaz
      }
    },
    [isMuted]
  );

  const safePlayHaptic = useCallback((action: () => void) => {
    try {
      action();
    } catch {
      // Fail-safe
    }
  }, []);

  // Klaket Vuruşu ve Aksiyon Geçiş Sekansı
  const triggerClapperSnap = useCallback(
    (isImmediateSkip = false) => {
      clearAllTimeouts();
      onCountChange?.(null);
      setIsLetterboxOpen(true);
      setPhase("CLAPPER_SNAP");

      // Kol vurma gecikmesi: Hızlı skip'te anında (20ms), normal akışta 80ms
      const snapDelay = isImmediateSkip ? 20 : 80;
      registerTimeout(() => {
        setIsStickClosed(true);
        safePlayAudio(() => audio.playChessMove());
        safePlayHaptic(() => haptic.medium());
        setPhase("ACTION");
      }, snapDelay);

      // AKSİYON süresi: Skip ise 200ms, normal akışta 650ms
      const actionHoldDuration = isImmediateSkip ? 200 : 650;
      registerTimeout(() => {
        setIsLetterboxOpen(false);
        // DOM'dan kalkmadan önce ghost-click'i önleyen mikro aralık
        registerTimeout(() => {
          completeCountdown();
        }, 50);
      }, snapDelay + actionHoldDuration);
    },
    [completeCountdown, onCountChange, safePlayAudio, safePlayHaptic]
  );

  // Tap-to-Skip (Gecikmesiz, Idempotent ve Ghost-Click Korumalı)
  const handleUserTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompletedRef.current) return;

    if (phase === "COUNTDOWN") {
      triggerClapperSnap(true);
    } else {
      completeCountdown();
    }
  };

  // ── TEMPO KURALI (Toplam sekans <= 3.2 sn) ───
  // 0ms: 3 -> 800ms: 2 -> 1600ms: 1 -> 2400ms: Klaket Vuruşu & AKSİYON! -> 3050ms: Başlangıç
  useEffect(() => {
    onCountChange?.(3);
    safePlayAudio(() => audio.playTick(480));
    safePlayHaptic(() => haptic.light());

    registerTimeout(() => {
      onCountChange?.(2);
      safePlayAudio(() => audio.playTick(520));
      safePlayHaptic(() => haptic.light());
    }, 800);

    registerTimeout(() => {
      onCountChange?.(1);
      safePlayAudio(() => audio.playTick(560));
      safePlayHaptic(() => haptic.light());
    }, 1600);

    registerTimeout(() => {
      triggerClapperSnap(false);
    }, 2400);

    return () => {
      clearAllTimeouts();
      onCountChange?.(null);
    };
  }, [triggerClapperSnap, onCountChange, safePlayAudio, safePlayHaptic]);

  return (
    <>
      {/* ── 1. GÜVENLİ ALAN: 2.39:1 SİNEMATİK SİYAH BANTLAR (max-h-[12vh]) ─── */}
      <div
        className="fixed top-0 left-0 right-0 bg-[#07080B] z-50 pointer-events-none transition-transform duration-250 ease-out border-b border-[#D9A441]/25 max-h-[12vh] h-[10vh] overflow-hidden"
        style={{
          transform: isLetterboxOpen ? "translateY(0)" : "translateY(-100%)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#07080B] z-50 pointer-events-none transition-transform duration-250 ease-out border-t border-[#D9A441]/25 max-h-[12vh] h-[10vh] overflow-hidden"
        style={{
          transform: isLetterboxOpen ? "translateY(0)" : "translateY(100%)",
        }}
      />

      {/* ── 2. TAP-TO-SKIP VE GHOST-CLICK KORUMA KATMANI ─── */}
      {phase === "COUNTDOWN" && (
        <div
          onClick={handleUserTap}
          onTouchStart={handleUserTap}
          className="fixed inset-0 z-40 flex flex-col items-center justify-between select-none cursor-pointer overflow-hidden pointer-events-auto"
          style={{
            background: "rgba(11, 13, 18, 0.08)", // Tahta %92 net okunur
            touchAction: "manipulation",
          }}
        >
          {/* Üstte Sinematik Mikro Etiket */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14171D]/80 border border-white/10 text-[9px] font-mono text-[#D9A441] shadow-sm pointer-events-none mt-14 sm:mt-18">
            <Film className="w-3 h-3 text-[#D9A441]" />
            <span>KADRAJ KONTROLÜ · 35MM</span>
          </div>

          <div />
        </div>
      )}

      {/* ── 3. KLAKET VURUŞU & AKSİYON! ─── */}
      {(phase === "CLAPPER_SNAP" || phase === "ACTION") && (
        <div
          onClick={handleUserTap}
          onTouchStart={handleUserTap}
          className="fixed inset-0 z-50 flex items-center justify-center select-none cursor-pointer overflow-hidden pointer-events-auto"
          style={{ touchAction: "manipulation" }}
        >
          <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-150 relative z-10 pointer-events-none">
            {/* Klaket Üst Çubuğu (Tokat gibi aşağı inen ahşap şerit kol) */}
            <div
              className="w-56 sm:w-64 h-8 rounded-t-lg relative overflow-hidden border border-white/20 origin-bottom-left transition-transform duration-120 ease-in"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #111, #111 14px, #E8E6E1 14px, #E8E6E1 28px)",
                transform: isStickClosed ? "rotate(0deg)" : "rotate(-24deg)",
              }}
            />

            {/* Klaket Gövdesi & Büyük Serif Tipografi */}
            <div className="bg-[#14171D] border border-white/15 rounded-b-2xl p-6 w-56 sm:w-64 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center relative -mt-0.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A8F9A] mb-2">
                SAHNE 01 · ÇEKİM 01
              </span>

              <div className="h-14 flex items-center justify-center">
                {phase === "ACTION" ? (
                  <span className="font-serif text-3xl sm:text-4xl font-black text-[#D9A441] tracking-wider animate-in zoom-in-90 duration-120">
                    AKSİYON!
                  </span>
                ) : (
                  <span className="font-serif text-lg font-bold text-[#E8E6E1] tracking-wide">
                    KAYIT
                  </span>
                )}
              </div>

              <span className="text-[8px] font-mono tracking-widest text-[#D9A441]/80 uppercase mt-2 font-bold">
                TAP TO SKIP
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
