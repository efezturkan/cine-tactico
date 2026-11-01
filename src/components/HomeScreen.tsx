"use client";

import React, { useEffect, useState } from "react";
import { Swords, UserRound, Volume2, VolumeX, Vibrate } from "lucide-react";
import { UserProfile } from "@/types/profile";
import { ContentPoolType } from "@/core";
import { audio } from "@/utils/audio";
import { haptic, setHapticEnabled } from "@/utils/haptics";

interface HomeScreenProps {
  profile: UserProfile;
  onStartGame: (modeName: string, difficulty: "EASY" | "NORMAL" | "HARD", contentPool?: ContentPoolType) => void;
  onDirectStartMode?: (mode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL") => void;
  onOpenProfileModal: () => void;
  onOpenCustomLobby: () => void;
  onOpenDaily: () => void;
  onOpenQuests: () => void;
  onOpenDna: () => void;
  onOpenShop?: () => void;
  onOpenPro?: () => void;
  onOpenGameModesHub?: () => void;
  onOpenGameSelect?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenNotifications?: () => void;
  notifUnreadCount?: number;
  onOpenLiveAmbience?: () => void;
  onOpenHelp?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
}

function Mark() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <rect x="4" y="8" width="64" height="56" rx="8" fill="#0E1018" stroke="#8B151B" strokeWidth="2" />
      <rect x="4" y="8" width="64" height="14" rx="8" fill="#8B151B" />
      <rect x="4" y="16" width="64" height="6" fill="#8B151B" />
      <path d="M18 18 L26 8 L34 18 L42 8 L50 18 L58 8" stroke="#F8FAFC" strokeWidth="2.5" fill="none" />
      <path d="M24 44 L36 28 L48 44" stroke="#F8FAFC" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <circle cx="36" cy="48" r="3" fill="#D97706" />
    </svg>
  );
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onDirectStartMode,
  onOpenProfileModal,
  onOpenCustomLobby,
  onOpenHelp,
  muted = false,
  onToggleMute,
}) => {
  const [hapticOn, setHapticOn] = useState(true);

  useEffect(() => {
    try {
      setHapticOn(localStorage.getItem("cinexox_haptic") !== "0");
    } catch {
      setHapticOn(true);
    }
  }, []);

  const winRate =
    profile.totalMatches > 0 ? Math.round((profile.wins / profile.totalMatches) * 100) : 0;

  const startDuel = () => {
    audio.playSelect();
    haptic.light();
    onDirectStartMode?.("CLASSIC");
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[100dvh] text-white flex flex-col relative select-none antialiased overflow-x-hidden bg-[#07080B]">
      <div className="absolute inset-x-8 top-0 h-40 pointer-events-none blur-3xl opacity-80 bg-[radial-gradient(ellipse_at_top,rgba(139,21,27,0.45),transparent_70%)]" />
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#0a0b10] border-r border-[#1A1C24] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-3 bg-[#0a0b10] border-l border-[#1A1C24] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 pt-4">
        <button
          type="button"
          onClick={() => {
            audio.playSelect();
            onOpenProfileModal();
          }}
          className="flex items-center gap-2 rounded-2xl px-1 py-1 active:scale-95"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8B151B] bg-[#0E1018]">
            <UserRound className="h-5 w-5 text-[#F8FAFC]" />
          </span>
          <span className="text-left">
            <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-[#94A3B8]">Pasaport</span>
            <span className="block max-w-[140px] truncate text-sm font-black">{profile.username}</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={hapticOn ? "Titreşimi kapat" : "Titreşimi aç"}
            onClick={() => {
              const next = !hapticOn;
              setHapticOn(next);
              setHapticEnabled(next);
              if (next) haptic.light();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1A1C24] bg-[#0E1018] active:scale-95"
          >
            <Vibrate className={`h-4 w-4 ${hapticOn ? "text-[#D97706]" : "text-[#64748B]"}`} />
          </button>
          {onToggleMute && (
            <button
              type="button"
              aria-label={muted ? "Sesi aç" : "Sesi kapat"}
              onClick={onToggleMute}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1A1C24] bg-[#0E1018] active:scale-95"
            >
              {muted ? <VolumeX className="h-4 w-4 text-[#64748B]" /> : <Volume2 className="h-4 w-4 text-[#F8FAFC]" />}
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 text-center">
        <Mark />
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#D97706]">Cine-XOX</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#F8FAFC]">Üç kare. Bir hat.</h1>
        <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-[#94A3B8]">
          3×3 tahta. İki ipucu, bir film. 12 saniye. Üç hücre birleşince maç biter.
        </p>

        <button
          type="button"
          onClick={startDuel}
          className="tap-scale mt-8 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-[#8B151B] px-6 py-4 text-base font-black text-[#F8FAFC] shadow-[0_12px_40px_rgba(139,21,27,0.35)]"
        >
          <Swords className="h-5 w-5" />
          Düelloya Gir
        </button>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[#64748B]">Bot · 12 sn</p>

        <button
          type="button"
          onClick={() => {
            audio.playSelect();
            onOpenCustomLobby();
          }}
          className="tap-scale mt-6 w-full max-w-xs rounded-2xl border border-[#1A1C24] bg-[#0E1018] px-6 py-3 text-sm font-bold text-[#F8FAFC]"
        >
          Arkadaşınla oda aç
        </button>
        <p className="mt-2 max-w-[260px] text-[11px] leading-snug text-[#64748B]">
          İki telefon. Oda kodu gerçek bir rakip bağlanınca maç başlar.
        </p>

        {onOpenHelp && (
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              onOpenHelp();
            }}
            className="mt-8 text-xs font-bold uppercase tracking-widest text-[#94A3B8]"
          >
            Nasıl oynanır
          </button>
        )}
      </main>

      <footer className="relative z-10 grid grid-cols-3 gap-2 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {[
          ["Galibiyet", String(profile.wins)],
          ["Maç", String(profile.totalMatches)],
          ["Oran", `%${winRate}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#1A1C24] bg-[#0E1018] px-2 py-3 text-center">
            <span className="block font-mono text-[9px] uppercase tracking-wider text-[#64748B]">{label}</span>
            <span className="mt-1 block text-lg font-black text-[#F8FAFC]">{value}</span>
          </div>
        ))}
      </footer>
    </div>
  );
};
