"use client";

import React, { useEffect, useState } from "react";
import { audio } from "@/utils/audio";
import { Swords, Film } from "lucide-react";
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
  boardTitle = "Auteur Savaşları",
  onCountdownComplete,
}) => {
  const [countdown, setCountdown] = useState<number>(3);

  const userAvatar =
    AVATAR_OPTIONS.find((a) => a.id === userProfile.avatarId) || AVATAR_OPTIONS[0];
  const opponentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === opponentAvatarId) || AVATAR_OPTIONS[2];

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    audio.playPowerup();

    const interval = setInterval(() => {
      setCountdown((prev) => {
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
  }, [isOpen, onCountdownComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center relative text-[#F1EEE7] overflow-hidden tactile-card"
        style={{
          background: "linear-gradient(180deg, #1E222B 0%, #14171D 100%)",
          borderColor: "rgba(245,166,35,0.65)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 6px 0 #08090C, inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Viewfinder Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#F5A623]/70 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#00D5E8]/70 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#F5A623]/70 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#00D5E8]/70 pointer-events-none" />

        {/* Sinematik Arka Plan Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#F5A623]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-[#00D5E8]/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. BAŞLIK (MATCH FOUND!) */}
        <div className="flex items-center gap-2 mb-1.5">
          <Swords className="w-5 h-5 text-[#F5A623] fill-[#F5A623] animate-pulse" />
          <h2 className="text-xl font-black text-[#F5A623] tracking-wider uppercase font-mono">
            MATCH FOUND!
          </h2>
        </div>
        <p className="text-[11px] font-bold text-[#F1EEE7] mb-5 flex items-center gap-1.5 bg-[#0F1115] px-3 py-1 rounded-full border border-white/15 max-w-full truncate shadow-inner">
          <Film className="w-3.5 h-3.5 text-[#00D5E8] shrink-0" />
          <span className="truncate">{boardTitle}</span>
        </p>

        {/* 2. OYUNCULAR KARŞILAŞMASI (User X vs Opponent O) */}
        <div className="flex items-center justify-between w-full px-2 mb-6">
          {/* Sol: Sen (Player X - Amber) */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${userAvatar.iconBg} flex items-center justify-center text-3xl sm:text-4xl border-2 border-[#F5A623] shadow-[0_4px_0_#9E6300,0_8px_20px_rgba(245,166,35,0.25)]`}
              >
                {userAvatar.emoji}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#F5A623] text-[#0F1115] font-mono font-black text-xs flex items-center justify-center border border-[#0F1115] shadow">
                X
              </span>
            </div>
            <span className="text-xs font-black text-[#F5A623] mt-2.5 truncate max-w-[100px]">
              {userProfile.username}
            </span>
            <span className="text-[9px] font-bold text-[#F1EEE7] mt-0.5 font-mono">
              Level {userProfile.rankLevel || 1}
            </span>
            <span className="text-[8px] font-bold text-[#A5A8B0] truncate max-w-[105px] text-center mt-0.5">
              {userProfile.rankTitle || "Bilet Kontrolörü"}
            </span>
          </div>

          {/* Orta: VS */}
          <div className="flex flex-col items-center px-2">
            <div className="w-10 h-10 rounded-xl bg-[#0F1115] border border-white/15 flex items-center justify-center shadow-inner">
              <span className="text-sm font-black text-[#FF334B] font-mono tracking-widest animate-pulse">
                VS
              </span>
            </div>
          </div>

          {/* Sağ: Rakip (Player O - Cyan) */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${opponentAvatar.iconBg} flex items-center justify-center text-3xl sm:text-4xl border-2 border-[#00D5E8] shadow-[0_4px_0_#007B8A,0_8px_20px_rgba(0,213,232,0.25)]`}
              >
                {opponentAvatar.emoji}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#00D5E8] text-[#0F1115] font-mono font-black text-xs flex items-center justify-center border border-[#0F1115] shadow">
                O
              </span>
            </div>
            <span className="text-xs font-black text-[#00D5E8] mt-2.5 truncate max-w-[100px]">
              {opponentName}
            </span>
            <span className="text-[9px] font-bold text-[#F1EEE7] mt-0.5 font-mono">
              Level {opponentLevel}
            </span>
            <span className="text-[8px] font-bold text-[#A5A8B0] truncate max-w-[105px] text-center mt-0.5">
              {opponentRankTitle}
            </span>
          </div>
        </div>

        {/* 3. GERİ SAYIM ÇEMBERİ (3... 2... 1...) */}
        <div className="relative w-20 h-20 rounded-full border-4 border-[#F5A623]/30 bg-[#0F1115] flex items-center justify-center mb-2 shadow-inner">
          <div className="absolute inset-0 rounded-full border-4 border-t-[#F5A623] border-r-[#00D5E8] border-b-transparent border-l-transparent animate-spin" />
          <span className="text-3xl font-black text-[#F1EEE7] font-mono scale-110 animate-bounce">
            {countdown}
          </span>
        </div>

        <p className="text-[10px] font-black text-[#A5A8B0] uppercase tracking-[0.2em] mt-1 font-mono">
          35MM PERDE AÇILIYOR...
        </p>
      </div>
    </div>
  );
};
