"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Film } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";

interface ClapperCountdownProps {
  onComplete: () => void;
  isMuted?: boolean;
}

type IntroPhase = "COUNTDOWN" | "CLAPPER_SNAP" | "ACTION";

export const ClapperCountdown: React.FC<ClapperCountdownProps> = ({
  onComplete,
  isMuted = false,
}) => {
  const [phase, setPhase] = useState<IntroPhase>("COUNTDOWN");
  const [count, setCount] = useState<3 | 2 | 1>(3);
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
    onComplete();
  }, [onComplete]);

  // Ses ve Haptic Koruyucu Yürütme (Fail-Safe)
  const safePlayAudio = useCallback(
    (action: () => void) => {
      if (isMuted) return;
      try {
        action();
      } catch {
        // Ses çalmasa veya izin verilmese dahi akış asla durmaz
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
      setIsLetterboxOpen(true);
      setPhase("CLAPPER_SNAP");

      // Kol vurma gecikmesi: Hızlı skip'te anında, normal akışta 80ms
      const snapDelay = isImmediateSkip ? 20 : 80;
      registerTimeout(() => {
        setIsStickClosed(true);
        safePlayAudio(() => audio.playChessMove());
        safePlayHaptic(() => haptic.medium());
        setPhase("ACTION");
      }, snapDelay);

      // AKSİYON süresi: Skip ise 180ms, normal akışta 650ms
      const actionHoldDuration = isImmediateSkip ? 220 : 650;
      registerTimeout(() => {
        setIsLetterboxOpen(false);
        // DOM'dan kalkmadan önce ghost-click'i önleyen mikro aralık
        registerTimeout(() => {
          completeCountdown();
        }, 50);
      }, snapDelay + actionHoldDuration);
    },
    [completeCountdown, safePlayAudio, safePlayHaptic]
  );

  // Tap-to-Skip (Gecikmesiz, Idempotent ve Ghost-Click Korumalı)
  const handleUserTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompletedRef.current) return;

    if (phase === "COUNTDOWN") {
      // 3-2-1 anında dokunulursa anında klaketi kapatıp maçı başlat
      triggerClapperSnap(true);
    } else {
      // Klaket açıkken dokunulursa anında bitir
      completeCountdown();
    }
  };

  // ── TEMPO KURALI (Toplam sekans <= 3.2 sn) ───
  // 0ms: 3 -> 800ms: 2 -> 1600ms: 1 -> 2400ms: Klaket Vuruşu & AKSİYON! -> 3050ms: Başlangıç
  useEffect(() => {
    // 0ms: "3"
    safePlayAudio(() => audio.playTick(480));
    safePlayHaptic(() => haptic.light());

    // 800ms: "2"
    registerTimeout(() => {
      setCount(2);
      safePlayAudio(() => audio.playTick(520));
      safePlayHaptic(() => haptic.light());
    }, 800);

    // 1600ms: "1"
    registerTimeout(() => {
      setCount(1);
      safePlayAudio(() => audio.playTick(560));
      safePlayHaptic(() => haptic.light());
    }, 1600);

    // 2400ms: Klaket vuruşu ve AKSİYON
    registerTimeout(() => {
      triggerClapperSnap(false);
    }, 2400);

    return () => {
      clearAllTimeouts();
    };
  }, [triggerClapperSnap, safePlayAudio, safePlayHaptic]);

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

      {/* ── 2. ŞEFFAF VİZÖR & 3-2-1 GERİ SAYIM (Arkası %90 Görünür) ─── */}
      {phase === "COUNTDOWN" && (
        <div
          onClick={handleUserTap}
          onTouchStart={handleUserTap}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden pointer-events-auto"
          style={{
            background: "rgba(11, 13, 18, 0.12)", // %88-%90 transparan, tahta net okunur
            touchAction: "manipulation",
          }}
        >
          {/* Üstte Sinematik Mikro Etiket */}
          <div className="absolute top-14 sm:top-18 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14171D]/80 border border-white/10 text-[9px] font-mono text-[#D9A441] shadow-sm pointer-events-none">
            <Film className="w-3 h-3 text-[#D9A441]" />
            <span>KADRAJ KONTROLÜ · 35MM</span>
          </div>

          {/* Merkez Vizör Halkası (%90 Transparan + Kehribar Nişangahlar + Film Lider Çizgileri) */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center bg-black/10 border border-[#D9A441]/40 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Kehribar Vizör Köşe Nişangahları [ ┌ ┐ └ ┘ ] */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D9A441]" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D9A441]" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D9A441]" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D9A441]" />

            {/* Merkez Analog Film Lideri Kıl Çaprazı (Film Reticle Lines) */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#D9A441]/20 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#D9A441]/20 pointer-events-none" />

            {/* Döner İnce Odak Çemberi */}
            <div
              className="absolute inset-2 rounded-full border border-dashed border-[#D9A441]/30 animate-spin pointer-events-none"
              style={{ animationDuration: "10s" }}
            />

            {/* 3... 2... 1... Sayı Gösterimi (Her saniye yumuşak darbe ile girer) */}
            <div
              key={count}
              className="font-serif text-5xl sm:text-6xl font-black text-[#D9A441] leading-none animate-in zoom-in-75 duration-200 select-none z-10"
            >
              {count}
            </div>
          </div>

          {/* Alt İpucu Metni */}
          <span className="text-[10px] font-mono text-[#F1EEE7]/60 tracking-wider mt-5 bg-[#0F1115]/80 px-3 py-1 rounded-full border border-white/10 pointer-events-none">
            (Atlamak için dokun)
          </span>
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
