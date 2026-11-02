"use client";

import React from "react";
import { Volume2, VolumeX, RotateCcw, Gift, HelpCircle, ArrowLeft } from "lucide-react";
import { PlayerSymbol } from "@/core";
import { AVATAR_OPTIONS } from "@/types/profile";

interface HeaderProps {
  scoreX: number;
  scoreO: number;
  currentTurn: PlayerSymbol;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  reelsBalance?: number;
  userAvatarId?: string;
  onOpenQuests?: () => void;
  onOpenProfile?: () => void;
  onOpenHelp?: () => void;
  onBackToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scoreX,
  scoreO,
  currentTurn,
  onReset,
  isMuted,
  onToggleMute,
  reelsBalance = 350,
  userAvatarId = "avatar_director",
  onOpenQuests,
  onOpenProfile,
  onOpenHelp,
  onBackToHome,
}) => {
  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === userAvatarId) || AVATAR_OPTIONS[0];

  return (
    <header
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between sticky top-0 z-30 relative"
      style={{
        background: "linear-gradient(180deg, rgba(24,27,34,0.98) 0%, rgba(15,17,21,0.98) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 3px 0 #08090C",
      }}
    >
      {/* 35mm sprocket holes left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-3.5 flex flex-col items-center justify-around py-1 pointer-events-none opacity-60">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 4,
              background: "#0F1115",
              borderRadius: 1,
              border: "1px solid #2A2E39",
            }}
          />
        ))}
      </div>
      {/* 35mm sprocket holes right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-3.5 flex flex-col items-center justify-around py-1 pointer-events-none opacity-60">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 4,
              background: "#0F1115",
              borderRadius: 1,
              border: "1px solid #2A2E39",
            }}
          />
        ))}
      </div>

      {/* Brand / Back */}
      <div className="flex items-center gap-1.5 ml-2.5 sm:ml-3 shrink-0">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            title="Ana Sayfaya Dön"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl font-black text-xs tactile-btn-surface text-[#F5A623]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lobi</span>
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            title="Profil ve Ayarlar"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg tactile-btn-surface"
          >
            {currentAvatar.emoji}
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-serif font-bold tracking-[0.08em] text-[#F1EEE7]">
            CINE<span className="text-[#F5A623] italic font-serif">·</span>XOX
          </h1>
        </div>
      </div>

      {/* Scoreboard — Tactile Duel Frame (Amber X vs Cyan O) */}
      <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#0F1115] border border-white/15 shrink-0">
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all relative font-mono ${
            currentTurn === "X"
              ? "bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/40"
              : "text-[#A5A8B0]"
          }`}
        >
          {currentTurn === "X" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
          )}
          <span className="text-xs font-black">X</span>
          <span className="text-xs sm:text-sm font-black">{scoreX}</span>
        </div>
        <span className="font-bold text-xs text-white/25 font-mono">:</span>
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all relative font-mono ${
            currentTurn === "O"
              ? "bg-[#00D5E8]/20 text-[#00D5E8] border border-[#00D5E8]/40"
              : "text-[#A5A8B0]"
          }`}
        >
          {currentTurn === "O" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D5E8]" />
          )}
          <span className="text-xs font-black">O</span>
          <span className="text-xs sm:text-sm font-black">{scoreO}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mr-2.5 sm:mr-3 shrink-0">
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            title="Nasıl Oynanır?"
            className="p-1.5 sm:p-2 rounded-xl tactile-btn-surface text-[#A5A8B0] hover:text-[#F1EEE7] hidden xs:flex"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#F5A623]" />
          </button>
        )}

        <button
          onClick={onToggleMute}
          title="Sesi Aç/Kapat"
          className="p-1.5 sm:p-2 rounded-xl tactile-btn-surface"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-[#A5A8B0]" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-[#F5A623]" />
          )}
        </button>

        <button
          onClick={onReset}
          title="Yeniden Başlat"
          className="p-1.5 sm:p-2 rounded-xl tactile-btn-surface text-[#A5A8B0] hover:text-[#F1EEE7]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
