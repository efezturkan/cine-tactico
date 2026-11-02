"use client";

import React from "react";
import { PlayerSymbol } from "@/core";
import { Timer, AlertTriangle, Bot } from "lucide-react";

interface ShotClockProps {
  currentTurn: PlayerSymbol;
  secondsRemaining: number;
  totalSeconds?: number;
  winner: PlayerSymbol | "DRAW" | null;
  isBotThinking?: boolean;
  botStatusMessage?: string;
}

export const ShotClock: React.FC<ShotClockProps> = ({
  currentTurn,
  secondsRemaining,
  totalSeconds = 12,
  winner,
  isBotThinking = false,
  botStatusMessage,
}) => {
  if (winner !== null) return null;

  const isLowTime = secondsRemaining <= 4;
  const percentage = Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100));
  const isPlayerX = currentTurn === "X";

  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto my-1 px-1.5 sm:px-4 min-w-0">
      <div
        className="p-2 sm:p-2.5 rounded-2xl tactile-card"
        style={{
          background: "linear-gradient(180deg, #1E222B 0%, #15181F 100%)",
          borderColor: isLowTime
            ? "rgba(255,51,75,0.55)"
            : isPlayerX
            ? "rgba(245,166,35,0.4)"
            : "rgba(0,213,232,0.4)",
          boxShadow: "0 4px 0 #090A0E, inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between text-xs mb-1.5 font-bold tracking-wide">
          <div className="flex items-center gap-2">
            {isBotThinking ? (
              <div className="flex items-center gap-1.5 text-[#00D5E8] font-black animate-pulse">
                <Bot className="w-3.5 h-3.5 text-[#00D5E8] animate-spin" />
                <span className="uppercase tracking-wider text-[11px]">
                  {botStatusMessage || "YAPAY ZEKA FİLM SEÇİYOR..."}
                </span>
              </div>
            ) : (
              <>
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span
                    className={`inline-flex rounded-full h-2 w-2 ${
                      isPlayerX ? "bg-[#F5A623]" : "bg-[#00D5E8]"
                    }`}
                  />
                </span>
                <span
                  className={
                    isPlayerX
                      ? "text-[#F5A623] tracking-wide font-black text-[11px] uppercase"
                      : "text-[#00D5E8] tracking-wide font-black text-[11px] uppercase"
                  }
                >
                  SIRA OYUNCU {currentTurn}&apos;DE {isPlayerX ? "(SEN)" : "(RAKİP)"}
                </span>
              </>
            )}
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono transition-all ${
              isLowTime
                ? "bg-[#FF334B]/20 border border-[#FF334B]/50 text-[#FF334B] animate-pulse-fast font-black text-xs"
                : "bg-[#0F1115] border border-white/10 text-[#F1EEE7] font-black text-xs"
            }`}
          >
            {isLowTime ? (
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF334B]" />
            ) : (
              <Timer className="w-3.5 h-3.5 text-[#F5A623]" />
            )}
            <span>{secondsRemaining}s</span>
          </div>
        </div>

        {/* Süre İlerleme Çubuğu */}
        <div className="w-full h-2 bg-[#0F1115] rounded-full overflow-hidden p-[1px] border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isLowTime
                ? "bg-[#FF334B]"
                : isPlayerX
                ? "bg-gradient-to-r from-[#D9820B] to-[#F5A623]"
                : "bg-gradient-to-r from-[#00A8B8] to-[#00D5E8]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
