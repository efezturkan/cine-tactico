"use client";

import React from "react";
import { Volume2, VolumeX, RotateCcw, Clapperboard, Gift, HelpCircle, User, ArrowLeft, Home } from "lucide-react";
import { PlayerSymbol } from "@/types/game";
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
  reelsBalance = 150,
  userAvatarId = "avatar_director",
  onOpenQuests,
  onOpenProfile,
  onOpenHelp,
  onBackToHome,
}) => {
  const currentAvatar =
    AVATAR_OPTIONS.find(a => a.id === userAvatarId) || AVATAR_OPTIONS[0];

  return (
    <header
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between sticky top-0 z-30"
      style={{
        background: "rgba(7,8,11,0.97)",
        borderBottom: "1px solid #1a1c24",
        backdropFilter: "blur(20px)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.6)",
      }}
    >
      {/* 35mm sprocket holes left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col items-center justify-around py-1 pointer-events-none opacity-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{ width: 7, height: 5, background: "#07080b", borderRadius: 1, border: "1px solid #2a2b35" }}
          />
        ))}
      </div>
      {/* 35mm sprocket holes right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col items-center justify-around py-1 pointer-events-none opacity-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{ width: 7, height: 5, background: "#07080b", borderRadius: 1, border: "1px solid #2a2b35" }}
          />
        ))}
      </div>

      {/* Brand / Back */}
      <div className="flex items-center gap-2 ml-4">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            title="Ana Sayfaya Dön"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95"
            style={{
              background: "rgba(139,21,27,0.08)",
              border: "1px solid rgba(139,21,27,0.3)",
              color: "#d97706",
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-black">Lobi</span>
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            title="Profil ve Ayarlar"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-md active:scale-95 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${currentAvatar.iconBg?.split(" ")[1] || "#1a1c24"}, #0e1018)`,
              border: "1.5px solid rgba(217,119,6,0.4)",
            }}
          >
            {currentAvatar.emoji}
          </button>
        )}
        <div>
          <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1">
            CINE<span style={{ color: "#d97706" }}>XOX</span>
            <span
              className="text-[8px] font-black px-1.5 py-0.5 rounded"
              style={{ background: "rgba(139,21,27,0.1)", border: "1px solid rgba(139,21,27,0.3)", color: "#8b151b" }}
            >
              3×3
            </span>
          </h1>
          <div
            className="text-[7px] font-black tracking-[0.2em] uppercase"
            style={{ color: "#2a2b35", fontFamily: "monospace" }}
          >
            KODAK 35mm
          </div>
        </div>
      </div>

      {/* Scoreboard — velvet frame */}
      <div
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-xl shadow-inner"
        style={{
          background: "#0a0b10",
          border: "1px solid #1e1f28",
        }}
      >
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all"
          style={
            currentTurn === "X"
              ? { background: "rgba(6,182,212,0.15)", color: "#06b6d4" }
              : { color: "#4b5563" }
          }
        >
          <span className="text-xs font-black">X</span>
          <span className="text-sm font-semibold">{scoreX}</span>
        </div>
        <span className="font-bold text-xs" style={{ color: "#2a2b35" }}>:</span>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all"
          style={
            currentTurn === "O"
              ? { background: "rgba(139,21,27,0.15)", color: "#8b151b" }
              : { color: "#4b5563" }
          }
        >
          <span className="text-xs font-black">O</span>
          <span className="text-sm font-semibold">{scoreO}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 mr-4">
        {onOpenQuests && (
          <button
            onClick={onOpenQuests}
            title="Günlük Ödüller & Görevler"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
            style={{
              background: "rgba(217,119,6,0.08)",
              border: "1px solid rgba(217,119,6,0.25)",
              color: "#d97706",
            }}
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{reelsBalance}</span>
          </button>
        )}

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            title="Nasıl Oynanır?"
            className="p-2 rounded-xl transition-all active:scale-95"
            style={{ background: "#0a0b10", border: "1px solid #1e1f28", color: "#4b5563" }}
          >
            <HelpCircle className="w-4 h-4" style={{ color: "#8b151b" }} />
          </button>
        )}

        <button
          onClick={onToggleMute}
          title="Sesi Aç/Kapat"
          className="p-2 rounded-xl transition-all active:scale-95"
          style={{ background: "#0a0b10", border: "1px solid #1e1f28" }}
        >
          {isMuted
            ? <VolumeX className="w-4 h-4" style={{ color: "#4b5563" }} />
            : <Volume2 className="w-4 h-4" style={{ color: "#d97706" }} />
          }
        </button>

        <button
          onClick={onReset}
          title="Yeniden Başlat"
          className="p-2 rounded-xl transition-all active:scale-95"
          style={{ background: "#0a0b10", border: "1px solid #1e1f28", color: "#4b5563" }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
