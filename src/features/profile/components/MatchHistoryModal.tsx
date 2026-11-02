"use client";

import React, { useState } from "react";
import { MatchRecord, UserProfile } from "@/types/profile";
import { GameBoard, findMatchingMovies, getSharedActors } from "@/core";
import { LetterboxdShareCardModal } from "@/features/profile";
import { audio } from "@/utils/audio";
import {
  X,
  Eye,
  Share2,
  ExternalLink,
  Film,
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

  const matches: MatchRecord[] = profile.matchHistory ?? [];

  const formatDate = (ts: number) => {
    try {
      return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(ts));
    } catch {
      return "";
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-md animate-card-in bg-panel border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col relative text-ink max-h-[90dvh] overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-display text-2xl font-extrabold italic uppercase tracking-wide text-ink">
              MAÇ GEÇMİŞİ
            </h3>
            <span className="text-xs text-muted">
              Son Karşılaşmalar &amp; 3×3 Kadraj Kayıtları
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. BOARD INSPECTION VIEW */}
        {selectedMatch ? (
          <div className="my-3 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  audio.playSelect();
                  setSelectedMatch(null);
                  setInspectCellIndex(null);
                }}
                className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
              >
                &larr; Listeye Dön
              </button>
              <button
                onClick={() => {
                  audio.playSelect();
                  setShareMatch(selectedMatch);
                }}
                className="tactile-btn-surface px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-[#F1EEE7]"
              >
                <Share2 className="w-3.5 h-3.5 text-gold" />
                <span>Maç Kartı</span>
              </button>
            </div>

            {/* Match Record Header */}
            <div className="p-3.5 rounded-xl bg-night border border-white/10 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="font-display text-base font-bold text-ink block truncate">
                  {selectedMatch.board.title}
                </span>
                <span className="text-xs text-muted mt-0.5 block">
                  vs {selectedMatch.opponent.name} · {formatDate(selectedMatch.timestamp)}
                </span>
              </div>
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold uppercase tracking-wider border shrink-0 ${
                  selectedMatch.outcome === "VICTORY"
                    ? "bg-gold/15 text-gold border-gold/40"
                    : selectedMatch.outcome === "DRAW"
                    ? "bg-control text-muted border-white/10"
                    : "bg-team-blue/15 text-team-blue border-team-blue/40"
                }`}
              >
                {selectedMatch.outcome === "VICTORY"
                  ? "GALİBİYET"
                  : selectedMatch.outcome === "DRAW"
                  ? "BERABERE"
                  : "MAĞLUBİYET"}
              </div>
            </div>

            {/* 3x3 Interactive Inspection Grid */}
            <div>
              <div className="text-xs text-muted px-1 mb-2">
                Karelere dokunarak olası tüm çözümleri incele:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {selectedMatch.cells.map((cell, idx) => {
                  const isX = cell?.answeredBy === "X";
                  const isO = cell?.answeredBy === "O";
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        audio.playSelect();
                        setInspectCellIndex(idx);
                      }}
                      className={`p-2.5 rounded-xl text-left border flex flex-col justify-between min-h-[60px] transition-all ${
                        inspectCellIndex === idx ? "ring-2 ring-gold" : ""
                      }`}
                      style={{
                        backgroundColor: isX
                          ? "rgba(245, 196, 81, 0.14)"
                          : isO
                          ? "rgba(76, 154, 255, 0.14)"
                          : "#0B1220",
                        borderColor: isX
                          ? "rgba(245, 196, 81, 0.5)"
                          : isO
                          ? "rgba(76, 154, 255, 0.5)"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-mono text-[9px] font-bold uppercase"
                          style={{ color: isX ? "#F5C451" : isO ? "#4C9AFF" : "#9AA6BD" }}
                        >
                          {cell ? (isX ? "SEN (X)" : "RAKİP (O)") : "BOŞ"}
                        </span>
                        {cell?.rarityScore ? (
                          <span className="font-mono text-[9px] font-bold text-scored">
                            +{cell.rarityScore}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs font-bold text-ink line-clamp-2 leading-tight mt-1">
                        {cell ? cell.actorName || cell.movie.title : "Boş"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {inspectCellIndex !== null && (
              <div className="p-3.5 rounded-xl bg-night border border-white/10">
                <div className="text-xs font-semibold text-muted mb-2">
                  Kesişim:{" "}
                  <span className="text-gold font-bold">
                    {selectedMatch.board.rows[Math.floor(inspectCellIndex / 3)].label} ×{" "}
                    {selectedMatch.board.cols[inspectCellIndex % 3].label}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {(() => {
                    const sol = getInspectSolutions(selectedMatch.board, inspectCellIndex);
                    if (sol.type === "ACTOR") {
                      return (sol.items as string[]).map((actor, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-2 rounded-lg bg-panel border border-white/10 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-team-blue">{actor}</span>
                          <span className="text-[10px] text-muted">Ortak Aktör</span>
                        </div>
                      ));
                    }
                    return (sol.items as { id: string; title: string; year: number }[]).map((m) => (
                      <div
                        key={m.id}
                        className="p-2 rounded-lg bg-panel border border-white/10 flex items-center justify-between text-xs gap-2"
                      >
                        <span className="font-semibold text-ink truncate">
                          {m.title} ({m.year})
                        </span>
                        <a
                          href={`https://letterboxd.com/search/${encodeURIComponent(m.title)}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-control text-gold border border-white/10 text-[10px] font-semibold"
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
          /* 2. ARCHIVE LIST */
          <div className="my-3 space-y-2.5">
            {matches.length === 0 ? (
              <div className="py-12 text-center text-[#8A8F9A]">
                <Film className="w-8 h-8 text-[#D9A441]/40 mx-auto mb-2" />
                <p className="font-serif text-sm text-[#E8E6E1]">
                  Arşivde henüz kayıt yok.
                </p>
              </div>
            ) : (
              matches.map((m) => {
                const isWin = m.outcome === "VICTORY";
                const isDraw = m.outcome === "DRAW";
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-night border border-white/10 hover:border-white/25 transition-colors flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider border ${
                            isWin
                              ? "bg-gold/15 text-gold border-gold/40"
                              : isDraw
                              ? "bg-control text-muted border-white/10"
                              : "bg-team-blue/15 text-team-blue border-team-blue/40"
                          }`}
                        >
                          {isWin ? "GALİBİYET" : isDraw ? "BERABERE" : "MAĞLUBİYET"}
                        </span>
                        <span className="text-xs text-muted">
                          {formatDate(m.timestamp)}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-scored">
                        +{m.scoreRarity} Puan
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-ink truncate">
                          {m.board.title}
                        </div>
                        <div className="text-xs text-muted truncate mt-0.5">
                          vs {m.opponent.name}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-0.5 p-1 rounded-lg bg-panel border border-white/10 shrink-0">
                        {m.cells.slice(0, 9).map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="w-3 h-3 rounded-[2px]"
                            style={{
                              backgroundColor:
                                c?.answeredBy === "X"
                                  ? "#F5C451"
                                  : c?.answeredBy === "O"
                                  ? "#4C9AFF"
                                  : "#16213A",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          audio.playSelect();
                          setShareMatch(m);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-panel hover:bg-control border border-white/10 text-muted hover:text-ink text-xs font-semibold flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Paylaş</span>
                      </button>

                      <button
                        onClick={() => {
                          audio.playSelect();
                          setSelectedMatch(m);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-control hover:border-gold border border-white/15 text-gold text-xs font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>İncele &rarr;</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

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
