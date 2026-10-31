"use client";

import React, { useEffect, useState } from "react";
import { audio } from "@/utils/audio";
import { Swords, Film, Shield, Trophy } from "lucide-react";
import { UserProfile, AVATAR_OPTIONS } from "@/types/profile";

interface MatchFoundModalProps {
  isOpen: boolean;
  userProfile: UserProfile;
  opponentName?: string;
  opponentAvatarId?: string;
  opponentLevel?: number;
  opponentRankTitle?: string;
  opponentWinRate?: number;
  boardTitle?: string;
  onCountdownComplete: () => void;
}

export const MatchFoundModal: React.FC<MatchFoundModalProps> = ({
  isOpen,
  userProfile,
  opponentName = "TarantinoKult",
  opponentAvatarId = "avatar_noir",
  opponentLevel = 7,
  opponentRankTitle = "Kült Film Koleksiyoneri 🎬",
  opponentWinRate = 68,
  boardTitle = "Auteur Savaşları",
  onCountdownComplete,
}) => {
  const [countdown, setCountdown] = useState<number>(3);

  const userAvatar =
    AVATAR_OPTIONS.find(a => a.id === userProfile.avatarId) || AVATAR_OPTIONS[0];
  const opponentAvatar =
    AVATAR_OPTIONS.find(a => a.id === opponentAvatarId) || AVATAR_OPTIONS[2];

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    // Maç bulundu sesi (Enerjik gong/powerup tonu)
    audio.playPowerup();

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          audio.playCombo(3);
          onCountdownComplete();
          return 0;
        }
        audio.playSelect();
        return prev - 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm bg-[#10182b] border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative text-white overflow-hidden">
        {/* Sinematik Arka Plan Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. BAŞLIK (MATCH FOUND!) */}
        <div className="flex items-center gap-2 mb-1.5">
          <Swords className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
          <h2 className="text-xl font-black text-amber-400 tracking-wider uppercase font-mono">
            MATCH FOUND!
          </h2>
        </div>
        <p className="text-[11px] font-bold text-zinc-300 mb-5 flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-700/60 max-w-full truncate">
          <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{boardTitle}</span>
        </p>

        {/* 2. OYUNCULAR KARŞILAŞMASI (User vs Bot Opponent) */}
        <div className="flex items-center justify-between w-full px-2 mb-6">
          {/* Sol: Sen (Player X) */}
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${userAvatar.iconBg} flex items-center justify-center text-3xl sm:text-4xl border-3 border-amber-400 shadow-xl shadow-amber-400/20`}
            >
              {userAvatar.emoji}
            </div>
            <span className="text-xs font-black text-amber-400 mt-2 truncate max-w-[95px]">
              {userProfile.username}
            </span>
            <span className="text-[9px] font-bold text-zinc-300 mt-0.5">
              Level {userProfile.rankLevel || 1}
            </span>
            <span className="text-[8px] font-bold text-zinc-400 truncate max-w-[100px] text-center mt-0.5">
              {userProfile.rankTitle || "Bilet Kontrolörü"}
            </span>
          </div>

          {/* Orta: VS */}
          <div className="flex flex-col items-center px-2">
            <span className="text-xl font-black text-rose-500 font-mono tracking-widest animate-pulse">
              VS
            </span>
          </div>

          {/* Sağ: Bot Rakip */}
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${opponentAvatar.iconBg} flex items-center justify-center text-3xl sm:text-4xl border-3 border-rose-500 shadow-xl shadow-rose-500/20`}
            >
              {opponentAvatar.emoji}
            </div>
            <span className="text-xs font-black text-rose-400 mt-2 truncate max-w-[95px]">
              {opponentName}
            </span>
            <span className="text-[9px] font-bold text-zinc-300 mt-0.5">
              Level {opponentLevel}
            </span>
            <span className="text-[8px] font-bold text-zinc-400 truncate max-w-[100px] text-center mt-0.5">
              {opponentRankTitle}
            </span>
          </div>
        </div>

        {/* 3. GERİ SAYIM ÇEMBERİ (3... 2... 1...) */}
        <div className="relative w-22 h-22 rounded-full border-4 border-amber-400/30 flex items-center justify-center mb-2 shadow-inner">
          <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-amber-400 border-b-transparent border-l-transparent animate-spin" />
          <span className="text-4xl font-black text-white font-mono scale-110 animate-bounce">
            {countdown}
          </span>
        </div>

        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">
          OYUN BAŞLIYOR...
        </p>
      </div>
    </div>
  );
};
