"use client";

import React, { useState } from "react";
import { MatchRecord, UserProfile } from "@/types/profile";
import { GameBoard, CellAnswer } from "@/types/game";
import { PRESET_BOARDS } from "@/data/boards";
import { findMatchingMovies, getSharedActors } from "@/engine/validator";
import { LetterboxdShareCardModal } from "@/components/LetterboxdShareCardModal";
import { audio } from "@/utils/audio";
import {
  Trophy,
  Swords,
  X,
  Eye,
  Share2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [inspectCellIndex, setInspectCellIndex] = useState<number | null>(null);
  const [shareMatch, setShareMatch] = useState<MatchRecord | null>(null);

  if (!isOpen) return null;

  // Profilde kayıtlı maçlar veya ilk giriş için temsili maç geçmişi
  const matches: MatchRecord[] =
    profile.matchHistory && profile.matchHistory.length > 0
      ? profile.matchHistory
      : [
          {
            id: "m_seed_1",
            timestamp: Date.now() - 1000 * 60 * 12, // 12 dk önce
            outcome: "VICTORY",
            mode: "CLASSIC",
            modeLabel: "Klasik Düello",
            opponent: {
              name: "NolanZihni",
              avatarId: "avatar_director",
              rankTitle: "Zaman Büken Sinefil",
            },
            trophyDelta: 24,
            scoreRarity: 38,
            totalArcadeScore: 1850,
            board: PRESET_BOARDS[0],
            cells: Array(9).fill(null).map((_, i) => ({
              movie: {
                id: `seed_${i}`,
                title: i % 2 === 0 ? "Inception" : "Pulp Fiction",
                year: 2010,
                director: "Christopher Nolan",
                cast: ["Leonardo DiCaprio"],
                genres: ["Sci-Fi"],
                imdbRating: 8.8,
                hasOscar: true,
              },
              answeredBy: i % 2 === 0 ? "X" : "O",
              timestamp: Date.now(),
              rarityScore: 12,
            })),
          },
          {
            id: "m_seed_2",
            timestamp: Date.now() - 1000 * 60 * 65, // 1 saat önce
            outcome: "VICTORY",
            mode: "REVERSE_CAST",
            modeLabel: "Ters Kadraj",
            opponent: {
              name: "LetterboxdEfsanesi",
              avatarId: "avatar_critics",
              rankTitle: "5 Yıldız Koleksiyoneri",
            },
            trophyDelta: 26,
            scoreRarity: 42,
            totalArcadeScore: 2100,
            board: PRESET_BOARDS[3] || PRESET_BOARDS[0],
            cells: Array(9).fill(null).map((_, i) => ({
              movie: {
                id: `seed_act_${i}`,
                title: "Cillian Murphy",
                year: 0,
                director: "Ortak Aktör",
                cast: ["Cillian Murphy"],
                genres: [],
                imdbRating: 8.0,
                hasOscar: false,
              },
              actorName: "Cillian Murphy",
              answeredBy: i < 5 ? "X" : "O",
              timestamp: Date.now(),
              rarityScore: 15,
            })),
          },
        ];

  // Seçili maçın incelenen hücresindeki alternatif çözümler
  const getInspectSolutions = (board: GameBoard, cellIdx: number) => {
    const r = Math.floor(cellIdx / 3);
    const c = cellIdx % 3;
    if (board.boardMode === "REVERSE_CAST") {
      return {
        type: "ACTOR",
        items: getSharedActors(board.rows[r].value, board.cols[c].value),
      };
    }
    return {
      type: "MOVIE",
      items: findMatchingMovies(board.rows[r], board.cols[c]),
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-[#0e121d] border-2 border-sky-500/30 rounded-3xl p-5 shadow-2xl flex flex-col relative text-white max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Üst Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                SAVAŞ GEÇMİŞİ &middot; AKTİVİTE GÜNLÜĞÜ
              </h3>
              <span className="text-[10px] text-zinc-400 font-bold">
                Clash Royale Formatı &middot; Tahta İncelemesi &middot; Son 20 Düello
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. TAHTA İNCELEME MODU (Detay Görünüm) */}
        {selectedMatch ? (
          <div className="my-3 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  audio.playSelect();
                  setSelectedMatch(null);
                  setInspectCellIndex(null);
                }}
                className="text-xs font-black text-cyan-400 hover:underline flex items-center gap-1"
              >
                &larr; Maç Listesine Dön
              </button>
              <button
                onClick={() => {
                  audio.playSelect();
                  setShareMatch(selectedMatch);
                }}
                className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black flex items-center gap-1 active:scale-95"
              >
                <Share2 className="w-3 h-3" />
                <span>Letterboxd Kartı</span>
              </button>
            </div>

            {/* Maç Başlığı */}
            <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-white block">
                  {selectedMatch.board.title}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                  vs @{selectedMatch.opponent.name} &middot; {selectedMatch.modeLabel}
                </span>
              </div>
              <div
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${
                  selectedMatch.outcome === "VICTORY"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                }`}
              >
                {selectedMatch.outcome === "VICTORY" ? "👑 ZAFER" : "BOZGUN"} (+{selectedMatch.trophyDelta} 🏆)
              </div>
            </div>

            {/* 3x3 İnteraktif İnceleme Grid'i */}
            <div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 mb-1.5">
                Karelere Tıklayarak Alternatif Çözümleri Görün:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {selectedMatch.cells.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      audio.playSelect();
                      setInspectCellIndex(idx);
                    }}
                    className={`p-2 rounded-xl text-left border flex flex-col justify-between min-h-[64px] transition-all active:scale-95 ${
                      inspectCellIndex === idx
                        ? "ring-2 ring-amber-400 scale-[1.03] z-10"
                        : ""
                    } ${
                      cell?.answeredBy === "X"
                        ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-200"
                        : cell?.answeredBy === "O"
                        ? "bg-rose-950/40 border-rose-500/60 text-rose-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono font-black uppercase">
                        {cell ? (cell.answeredBy === "X" ? "Sen (X)" : "Rakip (O)") : "Boş"}
                      </span>
                      {cell?.rarityScore ? (
                        <span className="text-[8px] font-bold text-amber-400 font-mono">
                          +{cell.rarityScore}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] font-black line-clamp-2 leading-tight mt-1">
                      {cell ? (cell.actorName || cell.movie.title) : "Boş"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hücre Detay Çözümleri */}
            {inspectCellIndex !== null && (
              <div className="p-3 rounded-2xl bg-black/80 border border-sky-500/30 animate-in fade-in">
                <div className="text-[11px] font-bold text-zinc-300 mb-2">
                  Kesişim:{" "}
                  <span className="text-amber-400 font-black">
                    {selectedMatch.board.rows[Math.floor(inspectCellIndex / 3)].label} +{" "}
                    {selectedMatch.board.cols[inspectCellIndex % 3].label}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {(() => {
                    const sol = getInspectSolutions(selectedMatch.board, inspectCellIndex);
                    if (sol.type === "ACTOR") {
                      return (sol.items as string[]).map((actor, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-cyan-300">🎭 {actor}</span>
                          <span className="text-[9px] font-mono text-zinc-400">Ortak Aktör</span>
                        </div>
                      ));
                    }
                    return (sol.items as any[]).map(m => (
                      <div
                        key={m.id}
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs gap-2"
                      >
                        <span className="font-bold text-white truncate">
                          {m.title} ({m.year})
                        </span>
                        <a
                          href={`https://letterboxd.com/search/${encodeURIComponent(m.title)}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black"
                        >
                          <span>Letterboxd</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 2. MAÇ LİSTESİ (Clash Royale Tarzı Karşılaşma Kartları) */
          <div className="my-3 space-y-2.5">
            {matches.map(m => {
              const isWin = m.outcome === "VICTORY";
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-[#131929] border border-zinc-800 hover:border-sky-500/40 transition-all flex flex-col gap-2.5 shadow-sm"
                >
                  {/* Kart Üst Bilgisi */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black border ${
                          isWin
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {isWin ? "👑 ZAFER" : "BOZGUN"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-400">
                        {m.modeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono font-black">
                      <span className={isWin ? "text-emerald-400" : "text-rose-400"}>
                        {isWin ? `+${m.trophyDelta}` : `-${m.trophyDelta}`} 🏆
                      </span>
                      <span className="text-zinc-600">&middot;</span>
                      <span className="text-amber-400">+{m.scoreRarity} ✨</span>
                    </div>
                  </div>

                  {/* Orta Kısım: Rakip & Mini 3x3 Grid Görünümü */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-zinc-700 flex items-center justify-center text-lg shrink-0">
                        🎬
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-xs text-white truncate">
                          vs @{m.opponent.name}
                        </div>
                        <div className="text-[10px] font-bold text-zinc-400 truncate">
                          {m.opponent.rankTitle || "Sinefil Düellocusu"}
                        </div>
                      </div>
                    </div>

                    {/* Mini 3x3 Savaş Alanı Kartviziti */}
                    <div className="grid grid-cols-3 gap-0.5 p-1 rounded-lg bg-black/60 border border-zinc-800 shrink-0">
                      {m.cells.slice(0, 9).map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className={`w-3.5 h-3.5 rounded-xs ${
                            c?.answeredBy === "X"
                              ? "bg-cyan-500"
                              : c?.answeredBy === "O"
                              ? "bg-rose-500"
                              : "bg-zinc-700/60"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Alt Aksiyon Butonları */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => {
                        audio.playSelect();
                        setShareMatch(m);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Letterboxd Paylaş</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.playSelect();
                        setSelectedMatch(m);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-black text-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tahtayı İncele &rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Letterboxd Viral Kart Modalı */}
        {shareMatch && (
          <LetterboxdShareCardModal
            isOpen={shareMatch !== null}
            onClose={() => setShareMatch(null)}
            match={shareMatch}
            board={shareMatch.board}
            cells={shareMatch.cells}
            score={shareMatch.totalArcadeScore}
            username={profile.username}
            letterboxdUsername={profile.letterboxdUsername}
            isVictory={shareMatch.outcome === "VICTORY"}
          />
        )}
      </div>
    </div>
  );
};