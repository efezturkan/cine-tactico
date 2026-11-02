"use client";

import React from "react";
import { PlayerSymbol, GameBoard, CellAnswer } from "@/core";
import { UserProfile } from "@/types/profile";
import { RotateCcw, Home } from "lucide-react";
import { audio } from "@/utils/audio";

interface PostGameAnalysisModalProps {
  winner: PlayerSymbol | "DRAW" | null;
  board: GameBoard;
  cells: (CellAnswer | null)[];
  profile?: UserProfile;
  totalArcadeScore?: number;
  onPlayAgain: () => void;
  onNextBoard?: () => void;
  onBackToHome?: () => void;
  onDoubleReward?: () => void;
}

// 35mm film edge perforations for modal
const ModalSprocketColumn = ({ count = 12 }: { count?: number }) => (
  <div className="flex flex-col items-center justify-around py-2 gap-2 h-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-2 h-3 rounded-[2px] bg-[#07080b] border border-white/10 shrink-0"
      />
    ))}
  </div>
);

export const PostGameAnalysisModal: React.FC<PostGameAnalysisModalProps> = ({
  winner,
  board,
  cells,
  onPlayAgain,
  onBackToHome,
}) => {
  if (winner === null) return null;

  const isVictory = winner === "X";
  const isDraw = winner === "DRAW";

  const playerAnswers = cells.filter((c) => c && c.answeredBy === "X");
  const opponentAnswers = cells.filter((c) => c && c.answeredBy === "O");
  const rarityScore =
    playerAnswers.length > 0
      ? Math.round(
          playerAnswers.reduce((acc, c) => {
            const bonus = c?.rarityScore ?? (c?.movie?.hasOscar ? 5 : 8);
            return acc + bonus;
          }, 0) / playerAnswers.length
        )
      : 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col relative text-[#E8E6E1] bg-[#14171D] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Left & Right 35mm Film Edge Perforations */}
        <div className="absolute left-1.5 top-0 bottom-0 w-2.5 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none">
          <ModalSprocketColumn count={14} />
        </div>
        <div className="absolute right-1.5 top-0 bottom-0 w-2.5 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none">
          <ModalSprocketColumn count={14} />
        </div>

        {/* Viewfinder corner brackets */}
        <div className="absolute top-2 left-5 w-2.5 h-2.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-2 right-5 w-2.5 h-2.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 left-5 w-2.5 h-2.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 right-5 w-2.5 h-2.5 border-b border-r border-white/20 pointer-events-none" />

        {/* Top Micro Tag */}
        <div className="text-center mb-1">
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#D9A441] uppercase">
            CINE-XOX · 35MM
          </span>
        </div>

        {/* Main Result Serif Title */}
        <div className="text-center my-3">
          <h2
            className={`font-serif font-bold text-3xl sm:text-4xl tracking-tight leading-tight ${
              isVictory
                ? "text-[#D9A441]"
                : isDraw
                ? "text-[#4FA3C7]"
                : "text-[#E8E6E1]"
            }`}
          >
            {isVictory ? "Kesin!" : isDraw ? "Berabere" : "Kurgu masasına dönüyoruz."}
          </h2>

          <p className="text-xs text-[#8A8F9A] font-sans truncate mt-1 px-4">
            {board.title}
          </p>
        </div>

        {/* Clean Match Summary Card */}
        <div className="w-full my-4 py-3 px-2 rounded-xl bg-[#0F1115] border border-white/5 grid grid-cols-3 gap-1 text-center">
          <div>
            <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
              SEN (X)
            </span>
            <span className="text-base font-mono font-bold text-[#D9A441] mt-0.5 block">
              {playerAnswers.length} Kare
            </span>
          </div>
          <div className="border-x border-white/5">
            <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
              RAKİP (O)
            </span>
            <span className="text-base font-mono font-bold text-[#4FA3C7] mt-0.5 block">
              {opponentAnswers.length} Kare
            </span>
          </div>
          <div>
            <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
              NADİRLİK
            </span>
            <span className="text-base font-mono font-bold text-[#E8E6E1] mt-0.5 block">
              %{rarityScore}
            </span>
          </div>
        </div>

        {/* Primary Action Button: "Tekrar çek" */}
        <button
          type="button"
          data-testid="final-frame-play-again-btn"
          onClick={() => {
            audio.playSelect();
            onPlayAgain();
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-[#D9A441] hover:bg-[#c99535] text-[#0B0D12] font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 mb-2 transition-all active:scale-[0.98] shadow-md"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>Tekrar çek</span>
        </button>

        {/* Secondary Action Button: "Gişe'ye dön" */}
        <button
          type="button"
          onClick={() => {
            audio.playSelect();
            if (onBackToHome) onBackToHome();
          }}
          className="w-full py-3 px-4 rounded-xl bg-[#181B22] hover:bg-[#20242D] border border-white/10 text-[#E8E6E1] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Home className="w-3.5 h-3.5 text-[#8A8F9A]" />
          <span>Gişe&apos;ye dön</span>
        </button>

        {/* Bottom Micro Tag: 30% Opacity */}
        <div className="text-center mt-3">
          <span className="text-[8px] font-mono tracking-widest text-[#8A8F9A] opacity-30 uppercase">
            KODAK 5219 · 35MM
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostGameAnalysisModal;
