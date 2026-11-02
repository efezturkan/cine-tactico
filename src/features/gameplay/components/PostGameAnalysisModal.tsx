"use client";

import React, { useState, useEffect, useRef } from "react";
import { PlayerSymbol, GameBoard, CellAnswer } from "@/core";
import { UserProfile } from "@/types/profile";
import { findMatchingMovies, getSharedActors } from "@/core";
import { LetterboxdShareCardModal } from "@/features/profile";
import {
  Crown,
  RotateCcw,
  Home,
  Share2,
  Heart,
  Eye,
  Sparkles,
  Check,
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
  const [isDoubleClaimed, setIsDoubleClaimed] = useState<boolean>(false);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [isRated, setIsRated] = useState<boolean>(false);
  const adIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
        adIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (winner === null) {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
        adIntervalRef.current = null;
      }
      setIsDoubleClaimed(false);
    }
  }, [winner]);

  if (winner === null) return null;

  const isVictory = winner === "X";
  const isDraw = winner === "DRAW";

  const playerAnswers = cells.filter((c) => c && c.answeredBy === "X");
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

  const handleShareResult = () => {
    audio.playSelect();
    const resultText = `🎬 CineXOX SONUCU 🏆\n${
      isVictory ? "👑 ZAFER KAZANDIM!" : isDraw ? "🤝 BERABERE BİTTİ!" : "🎬 GÜZEL MÜCADELE!"
    }\nTahta: ${board.title}\nSkor: +${isVictory ? "23" : "10"} Kupa | +60 XP\n\nSen de oyna: ${
      typeof window !== "undefined" ? window.location.origin : ""
    }`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(resultText);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-5 flex flex-col relative text-[#F1EEE7] max-h-[95vh] overflow-y-auto custom-scrollbar tactile-card"
        style={{
          background: "linear-gradient(180deg, #1E222B 0%, #14171D 100%)",
          borderColor: isVictory ? "rgba(245,166,35,0.55)" : "rgba(255,255,255,0.16)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 6px 0 #08090C, inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* 1. TAHTA İNCELEME GÖRÜNÜMÜ (CHESS.COM STYLE CELL ANALYSIS) */}
        {showAnalysis ? (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-xs font-black text-[#F5A623] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Eye className="w-4 h-4" />
                <span>Tahta İncelemesi (Hamle Analizi)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAnalysis(false)}
                className="text-[10px] font-black text-[#00D5E8] hover:underline"
              >
                &larr; Özet Ekrana Dön
              </button>
            </div>

            <p className="text-[11px] text-[#A5A8B0] mb-3">
              Bir hücreye tıklayarak o kesişime uyabilecek diğer sinema başyapıtlarını inceleyin:
            </p>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {cells.map((cell, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    audio.playSelect();
                    setSelectedCell(idx);
                  }}
                  className={`p-2 rounded-xl text-center text-[10px] font-bold border transition-all truncate ${
                    selectedCell === idx
                      ? "bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623] scale-105"
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
              <div className="bg-[#0F1115] border border-white/12 rounded-2xl p-3 mb-3">
                <div className="text-[11px] font-bold text-[#F1EEE7] mb-1.5">
                  Kesişim:{" "}
                  <span className="text-[#F5A623]">
                    {board.rows[Math.floor(selectedCell / 3)].label} +{" "}
                    {board.cols[selectedCell % 3].label}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {isReverseCast ? (
                    validActorsForSelected.map((actor, aIdx) => (
                      <div
                        key={aIdx}
                        className="text-[10px] p-2 rounded-xl bg-[#181B22] border border-white/10 text-[#00D5E8] flex items-center justify-between gap-2"
                      >
                        <span className="font-bold truncate">🎭 {actor}</span>
                        <span className="text-[8px] font-mono text-[#00D5E8] font-bold">
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
                          className="text-[10px] p-2 rounded-xl bg-[#181B22] border border-white/10 text-[#F1EEE7] flex items-center justify-between gap-2"
                        >
                          <span className="font-bold truncate">
                            {m.title} ({m.year})
                          </span>
                          <a
                            href={letterboxdSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8EBB70]/15 hover:bg-[#8EBB70]/25 text-[#8EBB70] border border-[#8EBB70]/35 text-[9px] font-black transition-all"
                            title="Letterboxd'da İncele"
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
              className="w-full py-2.5 rounded-xl tactile-btn-surface text-[#F1EEE7] font-black text-xs"
            >
              Tamam
            </button>
          </div>
        ) : (
          /* 2. CINEXOX FINAL FRAME KAZANMA / KAYBETME EKRANI */
          <div className="flex flex-col items-center text-center">
            <div className="text-[9px] font-mono font-black uppercase tracking-[0.22em] text-[#A5A8B0] mb-1">
              KODAK 5219 · FINAL FRAME
            </div>

            {/* Büyük Altın Taç 👑 */}
            <div className="mb-1.5">
              <Crown
                className={`w-14 h-14 ${
                  isVictory
                    ? "text-[#F5A623] fill-[#F5A623] animate-bounce"
                    : isDraw
                    ? "text-[#00D5E8] fill-[#00D5E8]"
                    : "text-[#A5A8B0]"
                }`}
              />
            </div>

            {/* VICTORY! / DEFEAT! */}
            <h2 className="text-2xl font-black text-[#F5A623] font-mono tracking-widest uppercase">
              {isVictory ? "VICTORY!" : isDraw ? "BERABERE!" : "DEFEAT!"}
            </h2>
            <p className="text-xs text-[#A5A8B0] font-bold mt-0.5">
              {isVictory
                ? "Harika maç şampiyon!"
                : isDraw
                ? "İki taraf da tahtayı zekice kilitledi!"
                : "Bir dahaki sefere daha iyi planla!"}
            </p>

            {/* Ödül & Skor Kutusu */}
            <div className="w-full my-4 p-3 rounded-2xl bg-[#181B22] border border-white/12 shadow-inner">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-[#A5A8B0] block font-mono">★ XP</span>
                  <span className="text-base font-black text-[#00D5E8] font-mono">
                    +{isVictory ? (isDoubleClaimed ? 120 : 60) : 25}
                  </span>
                </div>
                <div className="border-x border-white/10">
                  <span className="text-[10px] font-bold text-[#A5A8B0] block font-mono">🏆 SCORE</span>
                  <span className="text-base font-black text-[#8EBB70] font-mono">
                    +{isVictory ? (isDoubleClaimed ? 46 : 23) : 5}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A5A8B0] block font-mono">🎞️ COINS</span>
                  <span className="text-base font-black text-[#F5A623] font-mono">
                    +{isVictory ? (isDoubleClaimed ? 110 : 55) : 20}
                  </span>
                </div>
              </div>

              {/* Hard Bonus & Rarity (Nadirlik) Rozeti */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span className="text-[10px] font-bold text-[#F1EEE7]">
                      Nadirlik Puanı (Rarity):
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#F5A623] font-mono">%{rarityScore}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                      {rarityScore < 20
                        ? "💎 Çok Nadir Keşif"
                        : rarityScore < 35
                        ? "⭐ Prestijli Seçim"
                        : "🍿 Popüler"}
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-[#A5A8B0] text-left px-1">
                  Seçtiğin filmler diğer oyuncuların ortalama %{rarityScore}&apos;si tarafından akla getirildi.
                </div>
              </div>
            </div>

            {/* BUTON: PLAY AGAIN & NEXT BOARD */}
            <div className="grid grid-cols-2 gap-2 w-full mb-2.5">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  onPlayAgain();
                }}
                className="py-3 px-2 rounded-2xl tactile-btn-amber font-black text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                <span>TEKRAR OYNA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  onNextBoard();
                }}
                className="py-3 px-2 rounded-2xl tactile-btn-cyan font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5 stroke-[3]" />
                <span>FARKLI TAHTA</span>
              </button>
            </div>

            {/* VİRAL 35MM FİLM KARTI (LETTERBOXD & INSTAGRAM STORY İÇİN) */}
            <button
              type="button"
              onClick={() => {
                audio.playSelect();
                setShowViralShareModal(true);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8EBB70] via-teal-500 to-[#00D5E8] text-[#0F1115] font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_#2F5222] active:translate-y-[2px] transition-all mb-2.5"
            >
              <Sparkles className="w-4 h-4 text-[#0F1115] stroke-[2.5]" />
              <span>🎞️ 35MM VİRAL KART (LETTERBOXD & INSTAGRAM)</span>
            </button>

            {/* BUTON 3 & 4: SHARE & RATE US */}
            <div className="grid grid-cols-2 gap-2 w-full mb-2">
              <button
                type="button"
                onClick={handleShareResult}
                className="py-2.5 rounded-xl tactile-btn-surface text-[#F5A623] font-black text-xs flex items-center justify-center gap-1.5"
              >
                {isShared ? (
                  <Check className="w-3.5 h-3.5 text-[#8EBB70]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{isShared ? "Kopyalandı!" : "SHARE"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playVictory();
                  setIsRated(true);
                }}
                className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isRated
                    ? "bg-[#8EBB70] text-[#0F1115] border border-[#8EBB70]"
                    : "tactile-btn-surface text-[#F5A623]"
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{isRated ? "⭐ TEŞEKKÜRLER!" : "RATE US"}</span>
              </button>
            </div>

            {/* BUTON 5 & 6: REVIEW BOARD & BACK TO LOBBY */}
            <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setShowAnalysis(true);
                }}
                className="py-2.5 rounded-xl tactile-btn-surface text-[#F1EEE7] font-black text-[11px] flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#00D5E8]" />
                <span>REVIEW BOARD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  if (onBackToHome) onBackToHome();
                }}
                className="py-2.5 rounded-xl tactile-btn-surface text-[#F1EEE7] font-black text-[11px] flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>BACK TO LOBBY</span>
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
