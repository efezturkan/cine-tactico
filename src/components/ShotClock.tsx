"use client";

import React from "react";
import { PlayerSymbol } from "@/types/game";
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
  totalSeconds = 15,
  winner,
  isBotThinking = false,
  botStatusMessage,
}) => {
  if (winner !== null) return null;

  const isLowTime = secondsRemaining <= 4;
  const percentage = (secondsRemaining / totalSeconds) * 100;
  const isPlayerX = currentTurn === "X";

  return (
    <div className="w-full max-w-md mx-auto my-3 px-4">
      <div className="flex items-center justify-between text-xs mb-1.5 font-bold tracking-wide">
        <div className="flex items-center gap-1.5">
          {isBotThinking ? (
            <div className="flex items-center gap-1.5 text-rose-400 font-black animate-pulse">
              <Bot className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              <span className="uppercase tracking-wider">{botStatusMessage || "YAPAY ZEKA FİLM SEÇİYOR..."}</span>
            </div>
          ) : (
            <>
              <span
                className={`w-3 h-3 rounded-full animate-ping ${
                  isPlayerX ? "bg-cyan-400" : "bg-rose-400"
                }`}
              />
              <span className={isPlayerX ? "text-cyan-400" : "text-rose-400"}>
                SIRA OYUNCU {currentTurn}&apos;DE
              </span>
            </>
          )}
        </div>
        <div
          className={`flex items-center gap-1 transition-all ${
            isLowTime ? "text-rose-400 animate-pulse-fast font-black text-sm" : "text-zinc-400"
          }`}
        >
          {isLowTime ? <AlertTriangle className="w-3.5 h-3.5" /> : <Timer className="w-3.5 h-3.5" />}
          <span>{secondsRemaining}s</span>
        </div>
      </div>

      {/* Süre İlerleme Çubuğu */}
      <div className="w-full h-1.5 bg-cinema-border rounded-full overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isLowTime
              ? "bg-rose-500 shadow-lg shadow-rose-500/50"
              : isPlayerX
              ? "bg-gradient-to-r from-cyan-500 to-blue-500"
              : "bg-gradient-to-r from-rose-500 to-pink-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
