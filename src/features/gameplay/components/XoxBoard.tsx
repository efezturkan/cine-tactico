"use client";

import React from "react";
import { GameBoard, CellAnswer, PlayerSymbol, Criterion, Movie } from "@/core";
import { audio } from "@/utils/audio";
import { Clapperboard, Award, Calendar, Film, Shield, Sparkles, Lock, User, Compass } from "lucide-react";
import { assetResolver } from "@/utils/assetResolver";
import { LocalFace } from "./LocalFace";

interface XoxBoardProps {
  board: GameBoard;
  cells: (CellAnswer | null)[];
  winningLine: [number, number, number] | null;
  currentTurn: PlayerSymbol;
  winner: PlayerSymbol | "DRAW" | null;
  onCellClick: (index: number) => void;
  allowSteal?: boolean;
}

/**
 * Hücre içi film plakası bileşeni.
 * 35mm tipografik şerit tasarımıyla sinematik kart görünümü sunar.
 */
const CellMoviePoster: React.FC<{
  cellData: CellAnswer;
  isWinning?: boolean;
}> = ({ cellData }) => {
  const { movie, answeredBy, actorName, rarityScore, isLockedNeutral } = cellData;
  const isNeutral = answeredBy === "NEUTRAL" || isLockedNeutral;
  const isPlayerX = answeredBy === "X";

  // Varlık görselini çöz (Ters Kadraj: Aktör portresi, Normal: Film afişi)
  const cellAsset = actorName
    ? assetResolver.resolveForActor(actorName)
    : assetResolver.resolveForMovie(movie);

  // Türe göre dinamik atmosfer gradyanı
  const getGenreGradient = () => {
    if (actorName) return "from-cyan-950 via-zinc-950 to-black";
    const g = (movie.genres?.[0] || "").toLowerCase();
    if (g.includes("sci-fi") || g.includes("bilim")) {
      return "from-cyan-950 via-slate-900 to-black";
    }
    if (g.includes("crime") || g.includes("suç")) {
      return "from-rose-950 via-zinc-950 to-black";
    }
    if (g.includes("action") || g.includes("aksiyon")) {
      return "from-amber-950 via-zinc-900 to-black";
    }
    return "from-indigo-950 via-neutral-950 to-black";
  };

  if (isNeutral) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-1 bg-zinc-950/95 border border-zinc-800 rounded-xl select-none">
        <Lock className="w-5 h-5 text-zinc-500 mb-1" />
        <span className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Sahipsiz
        </span>
        <span className="text-[7px] text-zinc-500 font-mono">0 Puan</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-1.5 overflow-hidden rounded-xl select-none the-slam-stamp">
      {/* Ters Kadraj: Aktör Gösterimi */}
      {actorName ? (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${getGenreGradient()} flex flex-col items-center justify-center p-2 text-center`}
        >
          <User className="w-4 h-4 text-cyan-400 mb-1" />
          <span className="text-[10px] sm:text-xs font-black text-cyan-200 line-clamp-2 uppercase leading-tight tracking-wide drop-shadow">
            {actorName}
          </span>
          <span className="text-[7.5px] text-cyan-400 font-mono mt-0.5 font-bold">
            ORTAK AKTÖR
          </span>
        </div>
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${getGenreGradient()} flex flex-col items-center justify-center p-2 text-center`}
        >
          <Film className="w-4 h-4 text-amber-400/50 mb-1" />
          <span className="text-[10px] sm:text-xs font-black text-white line-clamp-2 uppercase leading-tight tracking-wide drop-shadow">
            {movie.title}
          </span>
          <span className="text-[8px] text-amber-300 font-mono mt-1 font-bold">
            {movie.year || ""}
          </span>
        </div>
      )}

      {/* Varlık Görsel Katmanı (varsa saydam sinematik arka plan) */}
      {cellAsset.isAvailable && cellAsset.src && (
        <img
          src={cellAsset.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity pointer-events-none"
        />
      )}

      {/* Karartma Gradyanı */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/30 pointer-events-none" />

      {/* Üst Bar: Rarity Rozeti ve Oyuncu Rozeti */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {rarityScore ? (
          <div className="text-[7.5px] font-black px-1 py-0.5 rounded bg-black/80 border border-amber-500/50 text-amber-300 font-mono shadow">
            +{rarityScore}
          </div>
        ) : (
          <div />
        )}
        <div
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg backdrop-blur-sm"
          style={{
            background: isPlayerX ? "#06b6d4" : "#ff2a55",
            color: "white",
            border: `1.5px solid ${isPlayerX ? "rgba(6,182,212,0.7)" : "rgba(255,42,85,0.7)"}`,
          }}
        >
          {answeredBy}
        </div>
      </div>

      {/* Alt Bar: Film Adı veya Aktör Adı */}
      <div className="relative z-10 text-left">
        <div className="font-black text-[9px] sm:text-[11px] text-white truncate drop-shadow-md leading-tight">
          {actorName || movie.title}
        </div>
        {!actorName && movie.year > 0 && (
          <div className="text-[7.5px] sm:text-[8px] font-bold text-zinc-300 truncate drop-shadow-sm flex items-center gap-1">
            <span>{movie.year}</span>
            <span>·</span>
            <span className="text-amber-400/90">{movie.director.split(" ").pop()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const XoxBoard: React.FC<XoxBoardProps> = ({
  board,
  cells,
  winningLine,
  currentTurn,
  winner,
  onCellClick,
  allowSteal = false,
}) => {
  // İsimden baş harfleri çıkaran yardımcı (Christopher Nolan -> CN)
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Kriter Başlık İkonu / Avatar Rozeti
  const renderCriterionHeader = (crit: Criterion) => {
    let iconElement: React.ReactNode;
    let badgeLabel: string;
    let badgeColor: string;

    if (crit.type === "DIRECTOR") {
      badgeLabel = "YÖNETMEN";
      badgeColor = "text-amber-400";
      const asset = assetResolver.resolveForCriterion(crit);
      iconElement = (
        <LocalFace
          src={asset.isAvailable ? asset.src : undefined}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-amber-400/60 shadow-sm shrink-0 mb-1 relative bg-zinc-900"
          fallback={
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500/25 to-rose-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-mono font-black text-[11px] shadow-sm shrink-0 mb-1">
              {getInitials(crit.label)}
            </div>
          }
        />
      );
    } else if (crit.type === "ACTOR") {
      badgeLabel = "BAŞROL";
      badgeColor = "text-cyan-400";
      const asset = assetResolver.resolveForCriterion(crit);
      iconElement = (
        <LocalFace
          src={asset.isAvailable ? asset.src : undefined}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-cyan-400/60 shadow-sm shrink-0 mb-1 relative bg-zinc-900"
          fallback={
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-500/25 to-blue-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono font-black text-[11px] shadow-sm shrink-0 mb-1">
              {getInitials(crit.label)}
            </div>
          }
        />
      );
    } else if (crit.type === "AWARD") {
      badgeLabel = "ÖDÜL";
      badgeColor = "text-yellow-400";
      iconElement = (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm shrink-0 mb-1">
          <Award className="w-4 h-4" />
        </div>
      );
    } else if (crit.type === "DECADE") {
      badgeLabel = "DÖNEM";
      badgeColor = "text-teal-400";
      iconElement = (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-400/15 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-sm shrink-0 mb-1">
          <Calendar className="w-4 h-4" />
        </div>
      );
    } else if (crit.type === "MOVIE_INTERSECTION") {
      badgeLabel = "FİLM";
      badgeColor = "text-amber-400";
      const asset = assetResolver.resolveForCriterion(crit);
      iconElement = asset.isAvailable && asset.src ? (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-amber-400/50 shadow-sm shrink-0 mb-1 relative bg-zinc-900">
          <img src={asset.src} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-[11px] shadow-sm shrink-0 mb-1">
          <Film className="w-4 h-4 text-amber-400" />
        </div>
      );
    } else if (crit.type === "THEME") {
      badgeLabel = "KÜLT TEMA";
      badgeColor = "text-purple-300";
      iconElement = (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/25 border border-purple-400/50 flex items-center justify-center text-purple-300 font-mono font-black text-[12px] shadow-sm shrink-0 mb-1">
          <Compass className="w-4 h-4 text-purple-400" />
        </div>
      );
    } else if (crit.type === "FRANCHISE") {
      badgeLabel = "EVREN";
      badgeColor = "text-rose-400";
      iconElement = (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-sm shrink-0 mb-1">
          <Shield className="w-4 h-4" />
        </div>
      );
    } else {
      badgeLabel = "TÜR";
      badgeColor = "text-purple-400";
      iconElement = (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm shrink-0 mb-1">
          <Clapperboard className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center w-full h-full p-1 select-none">
        {iconElement}
        <span className={`text-[7px] sm:text-[8px] uppercase tracking-wider ${badgeColor} font-black truncate max-w-full leading-none mb-0.5`}>
          {badgeLabel}
        </span>
        <span className="text-[9px] sm:text-[11px] font-black text-zinc-100 line-clamp-2 leading-tight px-0.5">
          {crit.label}
        </span>
        {crit.subLabel && (
          <span className="text-[7.5px] text-zinc-400 font-bold truncate max-w-full hidden sm:block mt-0.5">
            {crit.subLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2 sm:px-4 py-2">
      {/* 35mm Sinematik Üst Bilgi */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span
          className="text-[8px] font-black tracking-[0.2em] uppercase"
          style={{ color: "#4b5563", fontFamily: "monospace" }}
        >
          KODAK 35mm · ARENA 3×3
        </span>
        <span
          className="text-[8px] font-black tracking-widest uppercase"
          style={{ color: "#4b5563", fontFamily: "monospace" }}
        >
          24FPS · SİNEMATİK DÜELLO
        </span>
      </div>

      {/* 4x4 Matris Grid (1 Boşluk + 3 Kriter Başlığı, 3 Satır x 3 Hücre) */}
      <div
        className="grid grid-cols-4 gap-1.5 sm:gap-2 items-stretch p-2 rounded-2xl"
        style={{
          background: "rgba(10,12,18,0.95)",
          border: "2px solid #1e2330",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.7)",
        }}
      >
        {/* Sol Üst Köşe Logo Rozeti */}
        <div
          className="aspect-square flex flex-col items-center justify-center rounded-xl"
          style={{ background: "#0e1018", border: "1px solid #1e2330" }}
        >
          <Clapperboard className="w-4 h-4 text-amber-400" />
          <span
            className="text-[8px] font-black mt-1 tracking-widest text-amber-400 uppercase"
            style={{ fontFamily: "monospace" }}
          >
            CINEXOX
          </span>
        </div>

        {/* 3 Sütun Kriteri */}
        {board.cols.map((col, idx) => (
          <div
            key={col.id || idx}
            className="aspect-square rounded-xl flex items-center justify-center p-1"
            style={{
              background: "linear-gradient(to bottom, #121622, #0e1018)",
              border: "1px solid #232a3b",
            }}
          >
            {renderCriterionHeader(col)}
          </div>
        ))}

        {/* 3 Satır Kriteri × 3 Oyun Hücresi */}
        {board.rows.map((row, rIdx) => (
          <React.Fragment key={row.id || rIdx}>
            {/* Satır Kriter Başlığı */}
            <div
              className="aspect-square rounded-xl flex items-center justify-center p-1"
              style={{
                background: "linear-gradient(to right, #121622, #0e1018)",
                border: "1px solid #232a3b",
              }}
            >
              {renderCriterionHeader(row)}
            </div>

            {/* 3 Oyun Hücresi */}
            {[0, 1, 2].map(cIdx => {
              const cellIndex = rIdx * 3 + cIdx;
              const cellData = cells[cellIndex];
              const isWinning = winningLine?.includes(cellIndex);
              const isOccupied = cellData !== null;
              const isPlayerX = cellData?.answeredBy === "X";

              let cellBg = "#07080d";
              let cellBorder = "#1e2330";
              let cellShadow = "inset 0 0 12px rgba(0,0,0,0.8)";
              let cellRing = "";

              if (isWinning) {
                cellBorder = "#d97706";
                cellShadow = "0 0 24px rgba(217,119,6,0.6), inset 0 0 10px rgba(217,119,6,0.2)";
                cellRing = "ring-2 ring-amber-400";
              } else if (isOccupied && isPlayerX) {
                cellBorder = "rgba(6,182,212,0.7)";
                cellShadow = "0 0 12px rgba(6,182,212,0.25)";
              } else if (isOccupied && !isPlayerX) {
                cellBorder = "rgba(255,42,85,0.7)";
                cellShadow = "0 0 12px rgba(255,42,85,0.25)";
              }

              const isDisabled = winner !== null || isOccupied;

              return (
                <button
                  key={cellIndex}
                  disabled={isDisabled}
                  onClick={() => {
                    audio.playSelect();
                    onCellClick(cellIndex);
                  }}
                  className={`aspect-square relative rounded-xl overflow-hidden transition-all transform active:scale-95 group ${cellRing} ${
                    isWinning ? "scale-[1.03] z-10 winning-beam" : ""
                  }`}
                  style={{
                    background: cellBg,
                    border: `1.5px solid ${cellBorder}`,
                    boxShadow: cellShadow,
                  }}
                >
                  {/* Boş Kare Köşe İşaretleri (35mm Slayt Çerçevesi) */}
                  {!isOccupied && (
                    <>
                      <div
                        className="absolute top-1 left-1 w-2 h-2 pointer-events-none"
                        style={{ borderTop: "1px solid #2a3142", borderLeft: "1px solid #2a3142" }}
                      />
                      <div
                        className="absolute top-1 right-1 w-2 h-2 pointer-events-none"
                        style={{ borderTop: "1px solid #2a3142", borderRight: "1px solid #2a3142" }}
                      />
                      <div
                        className="absolute bottom-1 left-1 w-2 h-2 pointer-events-none"
                        style={{ borderBottom: "1px solid #2a3142", borderLeft: "1px solid #2a3142" }}
                      />
                      <div
                        className="absolute bottom-1 right-1 w-2 h-2 pointer-events-none"
                        style={{ borderBottom: "1px solid #2a3142", borderRight: "1px solid #2a3142" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-amber-400 bg-black/60 px-2 py-1 rounded-md border border-amber-400/40">
                          SEÇ +
                        </span>
                      </div>
                    </>
                  )}

                  {/* Dolu Kare */}
                  {isOccupied && (
                    <CellMoviePoster
                      cellData={cellData}
                      isWinning={isWinning}
                    />
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
