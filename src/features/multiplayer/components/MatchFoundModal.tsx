"use client";

import React, { useEffect, useState } from "react";
import { audio } from "@/utils/audio";
import { Swords, Film } from "lucide-react";
import { UserProfile, AVATAR_OPTIONS } from "@/types/profile";
import { useTranslation } from "@/i18n";

interface MatchFoundModalProps {
  isOpen: boolean;
  userProfile: UserProfile;
  opponentName?: string;
  opponentAvatarId?: string;
  opponentLevel?: number;
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
  boardTitle = "Auteur Savaşları",
  onCountdownComplete,
}) => {
  const { locale, tBoardTitle } = useTranslation();
  const isEn = locale === "en";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center relative text-[#F1EEE7] overflow-hidden"
        style={{
          background: "#14171D",
          border: "1px solid rgba(217, 164, 65, 0.4)",
        }}
      >
        {/* Viewfinder Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D9A441]/70 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D9A441]/70 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#D9A441]/70 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#D9A441]/70 pointer-events-none" />

        {/* 1. BAŞLIK */}
        <div className="flex items-center gap-2 mb-1.5">
          <Swords className="w-4 h-4 text-[#D9A441]" />
          <h2 className="text-xl font-bold font-serif text-[#F1EEE7] tracking-wide">
            {isEn ? "Session Starting" : "Seans Başlıyor"}
          </h2>
        </div>
        <p className="text-[11px] font-medium text-[#A5A8B0] mb-5 flex items-center gap-1.5 bg-[#181B22] px-3 py-1 rounded-md border border-white/10 max-w-full truncate">
          <Film className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
          <span className="truncate">{tBoardTitle(boardTitle)}</span>
        </p>

        {/* 2. OYUNCULAR KARŞILAŞMASI (User X vs Opponent O) */}
        <div className="flex items-center justify-between w-full px-2 mb-6">
          {/* Sol: Sen (Player X) */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${userAvatar.iconBg} flex items-center justify-center text-3xl sm:text-4xl border border-[#D9A441]`}
              >
                {userAvatar.emoji}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#D9A441] text-[#0F1115] font-mono font-bold text-xs flex items-center justify-center border border-[#0F1115]">
                X
              </span>
            </div>
            <span className="text-xs font-bold text-[#D9A441] mt-2.5 truncate max-w-[100px]">
              {userProfile.username}
            </span>
            <span className="text-[9px] font-medium text-[#A5A8B0] mt-0.5 font-mono">
              {isEn ? `Level ${userProfile.rankLevel || 1}` : `Seviye ${userProfile.rankLevel || 1}`}
            </span>
          </div>

          {/* Orta: VS */}
          <div className="flex flex-col items-center px-2">
            <div className="w-9 h-9 rounded-lg bg-[#181B22] border border-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#A5A8B0] font-mono tracking-widest">
                VS
              </span>
            </div>
          </div>

          {/* Sağ: Rakip (Player O) */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${opponentAvatar.iconBg} flex items-center justify-center text-3xl sm:text-4xl border border-white/20`}
              >
                {opponentAvatar.emoji}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white/20 text-[#F1EEE7] font-mono font-bold text-xs flex items-center justify-center border border-[#0F1115]">
                O
              </span>
            </div>
            <span className="text-xs font-bold text-[#F1EEE7] mt-2.5 truncate max-w-[100px]">
              {opponentName}
            </span>
            <span className="text-[9px] font-bold text-[#D9A441] mt-0.5 font-mono">
              {isEn ? "Cinephile Bot" : "Sinefil Botu"}
            </span>
            <span className="text-[9px] font-medium text-[#A5A8B0] font-mono">
              {isEn ? `Level ${opponentLevel}` : `Seviye ${opponentLevel}`}
            </span>
          </div>
        </div>

        {/* 3. GERİ SAYIM ÇEMBERİ (3... 2... 1...) */}
        <div className="relative w-16 h-16 rounded-full border-2 border-[#D9A441]/30 bg-[#181B22] flex items-center justify-center mb-2">
          <div className="absolute inset-0 rounded-full border-2 border-t-[#D9A441] border-r-[#D9A441] border-b-transparent border-l-transparent animate-spin" />
          <span className="text-2xl font-bold text-[#F1EEE7] font-mono">
            {countdown}
          </span>
        </div>

        <p className="text-[10px] font-medium text-[#A5A8B0] uppercase tracking-[0.2em] mt-1 font-mono">
          {isEn ? "35MM Curtain Opening..." : "35MM Perde Açılıyor..."}
        </p>
      </div>
    </div>
  );
};
