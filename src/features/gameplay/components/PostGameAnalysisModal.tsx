"use client";

import React, { useState } from "react";
import { PlayerSymbol, GameBoard, CellAnswer, findMatchingMovies, getSharedActors } from "@/core";
import { UserProfile } from "@/types/profile";
import { LetterboxdShareCardModal } from "@/features/profile";
import {
  Crown,
  RotateCcw,
  Home,
  Share2,
  Eye,
  Sparkles,
  ExternalLink,
  Shuffle,
} from "lucide-react";
import { audio } from "@/utils/audio";

interface PostGameAnalysisModalProps {
  winner: PlayerSymbol | "DRAW" | null;
  board: GameBoard;
  cells: (CellAnswer | null)[];
  profile?: UserProfile;
  totalArcadeScore?: number;
  onPlayAgain: () => void;
  onNextBoard: () => void;
  onBackToHome?: () => void;
  onDoubleReward?: () => void;
}

export const PostGameAnalysisModal: React.FC<PostGameAnalysisModalProps> = ({
  winner,
  board,
  cells,
  profile,
  totalArcadeScore,
  onPlayAgain,
  onNextBoard,
  onBackToHome,
}) => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [showViralShareModal, setShowViralShareModal] = useState<boolean>(false);

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

  const isReverseCast = board.boardMode === "REVERSE_CAST";

  const validMoviesForSelected =
    selectedCell !== null && !isReverseCast
      ? findMatchingMovies(
          board.rows[Math.floor(selectedCell / 3)],
          board.cols[selectedCell % 3]
        )
      : [];

  const validActorsForSelected =
    selectedCell !== null && isReverseCast
      ? getSharedActors(
          board.rows[Math.floor(selectedCell / 3)].value,
          board.cols[selectedCell % 3].value
        )
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-5 sm:p-6 flex flex-col relative text-[#F1EEE7] max-h-[94dvh] overflow-y-auto custom-scrollbar"
        style={{
          background: "linear-gradient(180deg, #1E222B 0%, #13161D 100%)",
          border: isVictory
            ? "1.5px solid rgba(245,166,35,0.55)"
            : "1.5px solid rgba(255,255,255,0.16)",
          borderBottom: isVictory ? "5px solid #78350F" : "5px solid #090A0E",
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.6)",
        }}
      >
        {showAnalysis ? (
          /* 1. BOARD CELL ANALYSIS VIEW */
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-xs font-black text-[#F5A623] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Eye className="w-4 h-4" />
                <span>Tahta İncelemesi</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAnalysis(false)}
                className="text-xs font-bold text-[#00D5E8] hover:underline"
              >
                &larr; Sonuca Dön
              </button>
            </div>

            <p className="text-xs text-[#A5A8B0] mb-3">
              Bir hücreye dokunarak o kesişimi sağlayan geçerli cevapları inceleyin:
            </p>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {cells.map((cell, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    audio.playSelect();
                    setSelectedCell(idx);
                  }}
                  className={`p-2.5 rounded-xl text-center text-[10px] font-bold border transition-all truncate ${
                    selectedCell === idx
                      ? "bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]"
                      : cell
                      ? cell.answeredBy === "X"
                        ? "bg-[#F5A623]/15 border-[#F5A623]/50 text-[#F5A623]"
                        : "bg-[#00D5E8]/15 border-[#00D5E8]/50 text-[#00D5E8]"
                      : "bg-[#0F1115] border-white/10 text-[#A5A8B0]"
                  }`}
                >
                  {cell?.isLockedNeutral
                    ? "🔒 Sahipsiz"
                    : cell
                    ? cell.actorName || cell.movie.title
                    : "Boş"}
                </button>
              ))}
            </div>

            {selectedCell !== null && (
              <div className="bg-[#0F1115] border border-white/12 rounded-2xl p-3 mb-4">
                <div className="text-xs font-bold text-[#F1EEE7] mb-2">
                  Kesişim:{" "}
                  <span className="text-[#F5A623]">
                    {board.rows[Math.floor(selectedCell / 3)].label} ×{" "}
                    {board.cols[selectedCell % 3].label}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {isReverseCast ? (
                    validActorsForSelected.map((actor, aIdx) => (
                      <div
                        key={aIdx}
                        className="text-xs p-2 rounded-xl bg-[#181B22] border border-white/10 text-[#00D5E8] flex items-center justify-between gap-2"
                      >
                        <span className="font-bold truncate">🎭 {actor}</span>
                        <span className="text-[9px] font-mono text-[#00D5E8] font-bold">
                          Ortak Aktör
                        </span>
                      </div>
                    ))
                  ) : (
                    validMoviesForSelected.map((m) => {
                      const letterboxdSearchUrl = `https://letterboxd.com/search/${encodeURIComponent(
                        m.title
                      )}/`;
                      return (
                        <div
                          key={m.id}
                          className="text-xs p-2 rounded-xl bg-[#181B22] border border-white/10 text-[#F1EEE7] flex items-center justify-between gap-2"
                        >
                          <span className="font-bold truncate">
                            {m.title} ({m.year})
                          </span>
                          <a
                            href={letterboxdSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8EBB70]/15 hover:bg-[#8EBB70]/25 text-[#8EBB70] border border-[#8EBB70]/35 text-[9px] font-black transition-all"
                          >
                            <span>Letterboxd</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAnalysis(false)}
              className="w-full py-3 rounded-2xl tactile-btn-surface text-[#F1EEE7] font-black text-xs uppercase tracking-wider"
            >
              Özete Dön
            </button>
          </div>
        ) : (
          /* 2. EDITORIAL FINAL FRAME OUTCOME VIEW */
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#14171E] border border-white/10 flex items-center justify-center mb-3">
              <Crown
                className={`w-8 h-8 ${
                  isVictory
                    ? "text-[#F5A623] fill-[#F5A623]"
                    : isDraw
                    ? "text-[#00D5E8] fill-[#00D5E8]"
                    : "text-[#A5A8B0]"
                }`}
              />
            </div>

            <h2
              className="text-3xl font-serif font-bold tracking-[0.1em] uppercase"
              style={{
                color: isVictory
                  ? "#F5A623"
                  : isDraw
                  ? "#00D5E8"
                  : "#F1EEE7",
              }}
            >
              {isVictory ? "ZAFER" : isDraw ? "BERABERE" : "MAĞLUBİYET"}
            </h2>

            <p className="text-xs text-[#A5A8B0] font-medium mt-1">
              {board.title}
            </p>

            {/* Clean Match Summary Card */}
            <div className="w-full my-5 p-3.5 rounded-2xl bg-[#111319] border border-white/10 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#A5A8B0] uppercase block">
                  SEN (X)
                </span>
                <span className="text-lg font-black text-[#F5A623] font-mono mt-0.5 block">
                  {playerAnswers.length} Kare
                </span>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[9px] font-mono font-bold text-[#A5A8B0] uppercase block">
                  RAKİP (O)
                </span>
                <span className="text-lg font-black text-[#00D5E8] font-mono mt-0.5 block">
                  {opponentAnswers.length} Kare
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-[#A5A8B0] uppercase block flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#F5A623]" />
                  NADİRLİK
                </span>
                <span className="text-lg font-black text-[#F1EEE7] font-mono mt-0.5 block">
                  %{rarityScore}
                </span>
              </div>
            </div>

            {/* PRIMARY ACTION: PLAY AGAIN */}
            <button
              type="button"
              data-testid="final-frame-play-again-btn"
              onClick={() => {
                audio.playSelect();
                onPlayAgain();
              }}
              className="w-full py-3.5 px-5 rounded-2xl tactile-btn-amber font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 mb-3 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>TEKRAR OYNA</span>
            </button>

            {/* SECONDARY ACTIONS GRID */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setShowAnalysis(true);
                }}
                className="py-2.5 px-3 rounded-xl tactile-btn-surface text-[#F1EEE7] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#00D5E8]" />
                <span>Tahta Analizi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  onNextBoard();
                }}
                className="py-2.5 px-3 rounded-xl tactile-btn-surface text-[#F1EEE7] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Farklı Tahta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setShowViralShareModal(true);
                }}
                className="py-2.5 px-3 rounded-xl tactile-btn-surface text-[#F1EEE7] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#8EBB70]" />
                <span>35mm Kart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  if (onBackToHome) onBackToHome();
                }}
                className="py-2.5 px-3 rounded-xl tactile-btn-surface text-[#F1EEE7] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Lobiye Dön</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showViralShareModal && (
        <LetterboxdShareCardModal
          isOpen={showViralShareModal}
          onClose={() => setShowViralShareModal(false)}
          board={board}
          cells={cells}
          score={totalArcadeScore || (isVictory ? 1850 : 920)}
          username={profile?.username || "Sinefil"}
          letterboxdUsername={profile?.letterboxdUsername}
          isVictory={isVictory}
        />
      )}
    </div>
  );
};
