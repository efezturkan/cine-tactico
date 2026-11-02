"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Film } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";

export type IntroPhase = "3" | "2" | "1" | "ACTION" | null;

interface ClapperCountdownProps {
  onComplete: () => void;
  onImpact?: () => void;
  isMuted?: boolean;
  onPhaseChange?: (phase: IntroPhase) => void;
}

export const ClapperCountdown: React.FC<ClapperCountdownProps> = ({
  onComplete,
  onImpact,
  isMuted = false,
  onPhaseChange,
}) => {
  const [isLetterboxOpen, setIsLetterboxOpen] = useState<boolean>(true);
  const isCompletedRef = useRef<boolean>(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onImpactRef = useRef(onImpact);
  onImpactRef.current = onImpact;

  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

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
    onPhaseChangeRef.current?.(null);
    onCompleteRef.current?.();
  }, []);

  // Ses ve Haptic Koruyucu Yürütme (Fail-Safe)
  const safePlayAudio = useCallback((action: () => void) => {
    if (isMutedRef.current) return;
    try {
      action();
    } catch {
      // Ses engellense dahi akış durmaz
    }
  }, []);

  const safePlayHaptic = useCallback((action: () => void) => {
    try {
      action();
    } catch {
      // Fail-safe
    }
  }, []);

  // Klaket Vuruşu ve Aksiyon Geçiş Sekansı
  const triggerActionAndComplete = useCallback(() => {
    clearAllTimeouts();
    onPhaseChangeRef.current?.("ACTION");

    // 1. Klaket kolu tam 160ms'de sert ve tok bir şekilde kapanıp çarpar
    registerTimeout(() => {
      // Tam temas anında ahşap klaket çarpma sesi ve medium haptic
      safePlayAudio(() => audio.playClapperSnap());
      safePlayHaptic(() => haptic.medium());

      // 12 saniyelik hamle sayacı tam klaketin çarptığı o temas anında başlar
      onImpactRef.current?.();

      // 2. Çarpmanın hemen ardından sinematik bantlar çekilir ve klaket 200ms içinde kaybolur
      // Toplam süre: 160ms + 80ms + 120ms = 360ms (500ms tavan kuralına kesinlikle sadık)
      registerTimeout(() => {
        setIsLetterboxOpen(false);
        registerTimeout(() => {
          completeCountdown();
        }, 120);
      }, 80);
    }, 160);
  }, [completeCountdown, safePlayAudio, safePlayHaptic]);

  // ── TEMPO KURALI (Toplam sekans <= 3.2 sn) ───
  // Mount anında tek seferlik başlar; dokunmaya duyarsız (unskippable) doğal akışında tamamlanır
  useEffect(() => {
    onPhaseChangeRef.current?.("3");
    safePlayAudio(() => audio.playTick(480));
    safePlayHaptic(() => haptic.light());

    registerTimeout(() => {
      onPhaseChangeRef.current?.("2");
      safePlayAudio(() => audio.playTick(520));
      safePlayHaptic(() => haptic.light());
    }, 800);

    registerTimeout(() => {
      onPhaseChangeRef.current?.("1");
      safePlayAudio(() => audio.playTick(560));
      safePlayHaptic(() => haptic.light());
    }, 1600);

    registerTimeout(() => {
      triggerActionAndComplete();
    }, 2400);

    return () => {
      clearAllTimeouts();
      onPhaseChangeRef.current?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── 1. GÜVENLİ ALAN: 2.39:1 SİNEMATİK SİYAH BANTLAR (max-h-[20px]) ─── */}
      <div
        className="fixed top-0 left-0 right-0 bg-[#07080B] z-20 pointer-events-none transition-transform duration-200 ease-out border-b border-[#D9A441]/20 h-[3vh] max-h-[20px] overflow-hidden"
        style={{
          transform: isLetterboxOpen ? "translateY(0)" : "translateY(-100%)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#07080B] z-20 pointer-events-none transition-transform duration-200 ease-out border-t border-[#D9A441]/20 h-[3vh] max-h-[20px] overflow-hidden"
        style={{
          transform: isLetterboxOpen ? "translateY(0)" : "translateY(100%)",
        }}
      />

      {/* ── 2. DOKUNMA ENGELLEYİCİ KORUMA KATMANI (UNSKIPPABLE: TIKLAMALARI ENGELLEYİP AKIŞI KORUR) ─── */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="fixed inset-0 z-40 select-none cursor-default overflow-hidden pointer-events-auto"
        style={{
          background: "transparent",
          touchAction: "none",
        }}
      />
    </>
  );
};
