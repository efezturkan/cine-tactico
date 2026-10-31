"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { PlayerSymbol, GameBoard, CellAnswer, Movie } from "@/core";
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
  Gift,
  Trophy,
  Sparkles,
  Check,
  Film,
  Zap,
  ExternalLink,
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
  onDoubleReward,
}) => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [showViralShareModal, setShowViralShareModal] = useState<boolean>(false);
  const [isDoubleClaimed, setIsDoubleClaimed] = useState<boolean>(false);
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(3);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [isRated, setIsRated] = useState<boolean>(false);
  const [rewardSeconds, setRewardSeconds] = useState<number>(7);
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
      setIsWatchingAd(false);
      setIsDoubleClaimed(false);
    }
  }, [winner]);

  // 7s Geri sayım (7s double reward badge)
  useEffect(() => {
    if (winner === null) return;
    const interval = setInterval(() => {
      setRewardSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [winner]);

  if (winner === null) return null;

  const isVictory = winner === "X";
  const isDraw = winner === "DRAW";

  // Oyuncunun (X) verdiği cevapların ortalama nadirlik (rarity) bonusunu hesapla
  const playerAnswers = cells.filter(c => c && c.answeredBy === "X");
  const rarityScore = playerAnswers.length > 0
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

  const handleClaimDouble = () => {
    if (isDoubleClaimed || isWatchingAd) return;
    setIsWatchingAd(true);
    setAdTimer(3);
    if (adIntervalRef.current) clearInterval(adIntervalRef.current);
    adIntervalRef.current = setInterval(() => {
      setAdTimer(t => {
        if (t <= 1) {
          if (adIntervalRef.current) {
            clearInterval(adIntervalRef.current);
            adIntervalRef.current = null;
          }
          setIsWatchingAd(false);
          setIsDoubleClaimed(true);
          audio.playSuccess();
          if (onDoubleReward) onDoubleReward();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="w-full max-w-sm bg-[#10182b] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col relative text-white max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* 1. TAHTA İNCELEME GÖRÜNÜMÜ (CHESS.COM STYLE CELL ANALYSIS) */}
        {showAnalysis ? (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-500/15 mb-3">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Tahta İncelemesi (Hamle Analizi)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAnalysis(false)}
                className="text-[10px] font-black text-cyan-400 hover:underline"
              >
                &larr; Özet Ekrana Dön
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 mb-3">
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
                      ? "bg-amber-400/20 border-amber-400 text-amber-300 scale-105"
                      : cell
                      ? cell.answeredBy === "X"
                        ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300"
                        : "bg-rose-950/40 border-rose-500/50 text-rose-300"
                      : "bg-[#0b101f] border-zinc-800 text-zinc-500"
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
              <div className="bg-[#0b101f] border border-sky-500/20 rounded-2xl p-3 mb-3">
                <div className="text-[11px] font-bold text-zinc-300 mb-1">
                  Kesişim:{" "}
                  <span className="text-amber-400">
                    {board.rows[Math.floor(selectedCell / 3)].label} + {board.cols[selectedCell % 3].label}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {isReverseCast ? (
                    validActorsForSelected.map((actor, aIdx) => (
                      <div
                        key={aIdx}
                        className="text-[10px] p-2 rounded-xl bg-[#121c33] border border-zinc-800 text-cyan-200 flex items-center justify-between gap-2"
                      >
                        <span className="font-bold truncate">🎭 {actor}</span>
                        <span className="text-[8px] font-mono text-cyan-400 font-bold">Ortak Aktör</span>
                      </div>
                    ))
                  ) : (
                    validMoviesForSelected.map(m => {
                      const letterboxdSearchUrl = `https://letterboxd.com/search/${encodeURIComponent(m.title)}/`;
                      return (
                        <div
                          key={m.id}
                          className="text-[10px] p-2 rounded-xl bg-[#121c33] border border-zinc-800 text-zinc-200 flex items-center justify-between gap-2"
                        >
                          <span className="font-bold truncate">{m.title} ({m.year})</span>
                          <a
                            href={letterboxdSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[9px] font-black transition-all"
                            title="Letterboxd'da İncele & Watchlist'e At"
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
              className="w-full py-2.5 rounded-xl bg-[#121c33] border border-zinc-700 text-white font-black text-xs"
            >
              Tamam
            </button>
          </div>
        ) : (
          /* 2. CINEXOX BİREBİR KAZANMA / KAYBETME EKRANI */
          <div className="flex flex-col items-center text-center">
            {/* Büyük Altın Taç 👑 */}
            <div className="mb-2">
              <Crown className="w-16 h-16 text-amber-400 fill-amber-400 animate-bounce" />
            </div>

            {/* VICTORY! / DEFEAT! */}
            <h2 className="text-2xl font-black text-amber-400 font-mono tracking-widest uppercase">
              {isVictory ? "VICTORY!" : isDraw ? "BERABERE!" : "DEFEAT!"}
            </h2>
            <p className="text-xs text-zinc-400 font-bold mt-0.5">
              {isVictory
                ? "Harika maç şampiyon!"
                : isDraw
                ? "İki taraf da tahtayı zekice kilitledi!"
                : "Bir dahaki sefere daha iyi planla!"}
            </p>

            {/* Ödül & Skor Kutusu */}
            <div className="w-full my-4 p-3 rounded-2xl bg-[#0b101f] border border-sky-500/15">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block">★ XP</span>
                  <span className="text-base font-black text-cyan-400">
                    +{isVictory ? (isDoubleClaimed ? 120 : 60) : 25}
                  </span>
                </div>
                <div className="border-x border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 block">🏆 SCORE</span>
                  <span className="text-base font-black text-emerald-400">
                    +{isVictory ? (isDoubleClaimed ? 46 : 23) : 5}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block">🎞️ COINS</span>
                  <span className="text-base font-black text-amber-400">
                    +{isVictory ? (isDoubleClaimed ? 110 : 55) : 20}
                  </span>
                </div>
              </div>

              {/* Hard Bonus & Rarity (Nadirlik) Rozeti */}
              <div className="mt-2.5 pt-2 border-t border-sky-500/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-zinc-300">Nadirlik Puanı (Rarity):</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-400 font-mono">%{rarityScore}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {rarityScore < 20 ? "💎 Çok Nadir Keşif" : rarityScore < 35 ? "⭐ Prestijli Seçim" : "🍿 Popüler"}
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-zinc-400 text-left px-1">
                  Seçtiğin filmler diğer oyuncuların ortalama %{rarityScore}'si tarafından akla getirildi.
                </div>
              </div>
            </div>

            {/* BUTON: PLAY AGAIN (Sarı Devasa Tekrar Oyna Butonu) */}
            <button
              type="button"
              onClick={() => {
                audio.playSelect();
                onPlayAgain();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all mb-2.5"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              <span>⚡ HEMEN YENİ MAÇ (PLAY AGAIN)</span>
            </button>

            {/* VİRAL 35MM FİLM KARTI (LETTERBOXD & INSTAGRAM STORY İÇİN) */}
            <button
              type="button"
              onClick={() => {
                audio.playSelect();
                setShowViralShareModal(true);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all mb-2"
            >
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
              <span>🎞️ 35MM VİRAL KART (LETTERBOXD & INSTAGRAM)</span>
            </button>

            {/* BUTON 3 & 4: SHARE & RATE US */}
            <div className="grid grid-cols-2 gap-2 w-full mb-2">
              <button
                type="button"
                onClick={handleShareResult}
                className="py-2.5 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {isShared ? <Check className="w-3.5 h-3.5 text-black" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{isShared ? "Kopyalandı!" : "SHARE"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playVictory();
                  setIsRated(true);
                }}
                className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                  isRated
                    ? "bg-emerald-500 text-black border border-emerald-400"
                    : "bg-amber-400/90 hover:bg-amber-400 text-black"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isRated ? "fill-black text-black" : "fill-black"}`} />
                <span>{isRated ? "⭐ TEŞEKKÜRLER!" : "RATE US"}</span>
              </button>
            </div>

            {/* BUTON 5 & 6: REVIEW BOARD & BACK TO LOBBY (Alt İkili Butonlar) */}
            <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-sky-500/10">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setShowAnalysis(true);
                }}
                className="py-2.5 rounded-xl bg-[#121c33] hover:bg-[#182747] text-zinc-300 font-black text-[11px] flex items-center justify-center gap-1.5 border border-zinc-700 transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>REVIEW BOARD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  if (onBackToHome) onBackToHome();
                }}
                className="py-2.5 rounded-xl bg-[#121c33] hover:bg-[#182747] text-zinc-300 font-black text-[11px] flex items-center justify-center gap-1.5 border border-zinc-700 transition-all active:scale-95"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
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
