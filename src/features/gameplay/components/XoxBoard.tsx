"use client";

import React from "react";
import { GameBoard, CellAnswer, PlayerSymbol, Criterion } from "@/core";
import { audio } from "@/utils/audio";
import { Clapperboard, Award, Calendar, Film, Shield, Lock, User, Compass } from "lucide-react";
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

  const cellAsset = actorName
    ? assetResolver.resolveForActor(actorName)
    : assetResolver.resolveForMovie(movie);

  const getGenreGradient = () => {
    if (actorName) return "from-cyan-950 via-[#181B22] to-[#0F1115]";
    const g = (movie.genres?.[0] || "").toLowerCase();
    if (g.includes("sci-fi") || g.includes("bilim")) {
      return "from-cyan-950 via-[#181B22] to-[#0F1115]";
    }
    if (g.includes("crime") || g.includes("suç")) {
      return "from-amber-950 via-[#181B22] to-[#0F1115]";
    }
    if (g.includes("action") || g.includes("aksiyon")) {
      return "from-amber-900/80 via-[#181B22] to-[#0F1115]";
    }
    return "from-[#252932] via-[#181B22] to-[#0F1115]";
  };

  if (isNeutral) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-1 bg-[#14171D] border border-white/10 rounded-xl select-none min-w-0 overflow-hidden">
        <Lock className="w-3.5 h-3.5 text-[#A5A8B0] mb-0.5" />
        <span className="text-[7.5px] sm:text-[9px] font-black text-[#A5A8B0] uppercase tracking-wider">
          Sahipsiz
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-1 sm:p-1.5 overflow-hidden rounded-xl select-none min-w-0 the-slam-stamp">
      {/* Ters Kadraj: Aktör Gösterimi vs Normal: Film Gösterimi */}
      {actorName ? (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${getGenreGradient()} flex flex-col items-center justify-center p-1 text-center min-w-0`}
        >
          <User className="w-3 h-3 text-[#00D5E8] mb-0.5" />
          <span className="text-[8px] sm:text-xs font-black text-[#F1EEE7] line-clamp-2 uppercase leading-tight tracking-wide drop-shadow max-w-full">
            {actorName}
          </span>
          <span className="text-[6.5px] sm:text-[7.5px] text-[#00D5E8] font-mono mt-0.5 font-bold">
            ORTAK AKTÖR
          </span>
        </div>
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${getGenreGradient()} flex flex-col items-center justify-center p-1 text-center min-w-0`}
        >
          <Film className="w-3 h-3 text-[#F5A623]/60 mb-0.5" />
          <span className="text-[8px] sm:text-xs font-black text-[#F1EEE7] line-clamp-2 uppercase leading-tight tracking-wide drop-shadow max-w-full">
            {movie.title}
          </span>
          <span className="text-[7px] sm:text-[8px] text-[#F5A623] font-mono mt-0.5 font-bold">
            {movie.year || ""}
          </span>
        </div>
      )}

      {/* Varlık Görsel Katmanı */}
      {cellAsset.isAvailable && cellAsset.src && (
        <img
          src={cellAsset.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity pointer-events-none"
        />
      )}

      {/* Karartma Gradyanı */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/95 via-[#0F1115]/35 to-[#0F1115]/30 pointer-events-none" />

      {/* Üst Bar: Rarity Rozeti ve Oyuncu Rozeti */}
      <div className="relative z-10 flex items-center justify-between w-full min-w-0">
        {rarityScore ? (
          <div className="text-[6.5px] sm:text-[7.5px] font-black px-1 py-0.2 rounded bg-[#0F1115]/90 border border-[#F5A623]/50 text-[#F5A623] font-mono shadow">
            +{rarityScore}
          </div>
        ) : (
          <div />
        )}
        <div
          className="w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center font-black font-mono text-[8.5px] sm:text-[9.5px] shadow-lg"
          style={{
            background: isPlayerX ? "#F5A623" : "#00D5E8",
            color: "#0F1115",
            border: "1px solid #0F1115",
          }}
        >
          {answeredBy}
        </div>
      </div>

      {/* Alt Bar: Film Adı veya Aktör Adı */}
      <div className="relative z-10 text-left min-w-0">
        <div className="font-black text-[7.5px] sm:text-[10px] text-[#F1EEE7] truncate drop-shadow-md leading-tight">
          {actorName || movie.title}
        </div>
        {!actorName && movie.year > 0 && (
          <div className="text-[6.5px] sm:text-[7.5px] font-bold text-[#A5A8B0] truncate drop-shadow-sm flex items-center gap-1 font-mono">
            <span>{movie.year}</span>
            <span>·</span>
            <span className="text-[#F5A623]">{movie.director.split(" ").pop()}</span>
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
  winner,
  onCellClick,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderCriterionHeader = (crit: Criterion) => {
    let iconElement: React.ReactNode;
    let badgeLabel: string;
    let badgeColor: string;

    if (crit.type === "DIRECTOR") {
      badgeLabel = "YÖNETMEN";
      badgeColor = "text-[#F5A623]";
      const asset = assetResolver.resolveForCriterion(crit);
      iconElement = (
        <LocalFace
          src={asset.isAvailable ? asset.src : undefined}
          className="w-5 h-5 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-[#F5A623]/60 shadow-sm shrink-0 mb-0.5 relative bg-[#0F1115]"
          fallback={
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/50 flex items-center justify-center text-[#F5A623] font-mono font-black text-[9px] sm:text-[11px] shadow-sm shrink-0 mb-0.5">
              {getInitials(crit.label)}
            </div>
          }
        />
      );
    } else if (crit.type === "ACTOR") {
      badgeLabel = "BAŞROL";
      badgeColor = "text-[#00D5E8]";
      const asset = assetResolver.resolveForCriterion(crit);
      iconElement = (
        <LocalFace
          src={asset.isAvailable ? asset.src : undefined}
          className="w-5 h-5 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-[#00D5E8]/60 shadow-sm shrink-0 mb-0.5 relative bg-[#0F1115]"
          fallback={
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#00D5E8]/15 border border-[#00D5E8]/50 flex items-center justify-center text-[#00D5E8] font-mono font-black text-[9px] sm:text-[11px] shadow-sm shrink-0 mb-0.5">
              {getInitials(crit.label)}
            </div>
          }
        />
      );
    } else if (crit.type === "AWARD") {
      badgeLabel = "ÖDÜL";
      badgeColor = "text-[#F5A623]";
      iconElement = (
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623] shadow-sm shrink-0 mb-0.5">
          <Award className="w-3.5 h-3.5" />
        </div>
      );
    } else if (crit.type === "DECADE") {
      badgeLabel = "DÖNEM";
      badgeColor = "text-[#8EBB70]";
      iconElement = (
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#8EBB70]/15 border border-[#8EBB70]/40 flex items-center justify-center text-[#8EBB70] shadow-sm shrink-0 mb-0.5">
          <Calendar className="w-3.5 h-3.5" />
        </div>
      );
    } else if (crit.type === "MOVIE_INTERSECTION") {
      badgeLabel = "FİLM";
      badgeColor = "text-[#F5A623]";
      const asset = assetResolver.resolveForCriterion(crit);
      iconElement =
        asset.isAvailable && asset.src ? (
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-[#F5A623]/50 shadow-sm shrink-0 mb-0.5 relative bg-[#0F1115]">
            <img src={asset.src} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#F5A623]/20 border border-[#F5A623]/50 flex items-center justify-center text-[#F5A623] font-black text-[9px] sm:text-[11px] shadow-sm shrink-0 mb-0.5">
            <Film className="w-3.5 h-3.5 text-[#F5A623]" />
          </div>
        );
    } else if (crit.type === "THEME") {
      badgeLabel = "KÜLT TEMA";
      badgeColor = "text-purple-300";
      iconElement = (
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 font-mono font-black text-[10px] sm:text-[12px] shadow-sm shrink-0 mb-0.5">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
        </div>
      );
    } else if (crit.type === "FRANCHISE") {
      badgeLabel = "EVREN";
      badgeColor = "text-[#FF334B]";
      iconElement = (
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#FF334B]/15 border border-[#FF334B]/40 flex items-center justify-center text-[#FF334B] shadow-sm shrink-0 mb-0.5">
          <Shield className="w-3.5 h-3.5" />
        </div>
      );
    } else {
      badgeLabel = "TÜR";
      badgeColor = "text-purple-400";
      iconElement = (
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm shrink-0 mb-0.5">
          <Clapperboard className="w-3.5 h-3.5" />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center w-full h-full p-0.5 sm:p-1 select-none min-w-0 overflow-hidden">
        {iconElement}
        <span
          className={`text-[6px] sm:text-[8px] uppercase tracking-wider ${badgeColor} font-black truncate max-w-full leading-none mb-0.5 font-mono`}
        >
          {badgeLabel}
        </span>
        <span className="text-[7.5px] sm:text-[10px] font-black text-[#F1EEE7] line-clamp-2 leading-tight px-0.5 max-w-full break-words">
          {crit.label}
        </span>
        {crit.subLabel && (
          <span className="text-[6.5px] text-[#A5A8B0] font-bold truncate max-w-full hidden sm:block mt-0.5">
            {crit.subLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto px-1 sm:px-4 py-1.5 min-w-0 overflow-hidden">
      {/* 35mm Sinematik Üst Bilgi */}
      <div className="flex items-center justify-between px-1 mb-1 font-mono text-[7.5px] sm:text-[8px] font-black uppercase">
        <span className="tracking-[0.2em] text-[#F5A623]">
          KODAK 5219 &middot; ARENA 3×3
        </span>
        <span className="tracking-widest flex items-center gap-1.5 text-[#FF334B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF334B] animate-pulse shrink-0 shadow-[0_0_6px_#FF334B]" />
          REC 24FPS &middot; SİNEMATİK DÜELLO
        </span>
      </div>

      {/* 4x4 Matris Grid (1 Köşe Rozeti + 3 Sütun Kriteri, 3 Satır Kriteri × 3 Hücre) */}
      <div
        className="grid grid-cols-4 gap-1 sm:gap-2 p-1.5 sm:p-2.5 rounded-2xl relative w-full overflow-hidden"
        style={{
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          background: "linear-gradient(180deg, #181B22 0%, #111318 100%)",
          border: "2px solid #2A2F3A",
          boxShadow: "0 6px 0 #08090C, inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 32px rgba(0,0,0,0.75)",
        }}
      >
        {/* Sol Üst Köşe Logo Rozeti */}
        <div
          className="w-full aspect-square flex flex-col items-center justify-center rounded-xl min-w-0 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #252932 0%, #181B22 100%)",
            border: "1px solid rgba(245,166,35,0.35)",
            boxShadow: "0 3px 0 #0A0B0E, inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5A623]" />
          <span className="text-[6.5px] sm:text-[8px] font-black mt-0.5 tracking-widest text-[#F5A623] uppercase font-mono">
            CINEXOX
          </span>
        </div>

        {/* 3 Sütun Kriteri */}
        {board.cols.map((col, idx) => (
          <div
            key={col.id || idx}
            className="w-full aspect-square rounded-xl flex items-center justify-center p-0.5 sm:p-1 min-w-0 overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #252932 0%, #181B22 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 3px 0 #0A0B0E, inset 0 1px 0 rgba(255,255,255,0.08)",
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
              className="w-full aspect-square rounded-xl flex items-center justify-center p-0.5 sm:p-1 min-w-0 overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #252932 0%, #181B22 100%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 3px 0 #0A0B0E, inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              {renderCriterionHeader(row)}
            </div>

            {/* 3 Oyun Hücresi (Tactile 3D Beveled Tiles) */}
            {[0, 1, 2].map((cIdx) => {
              const cellIndex = rIdx * 3 + cIdx;
              const cellData = cells[cellIndex];
              const isWinning = winningLine?.includes(cellIndex);
              const isOccupied = cellData !== null;
              const isPlayerX = cellData?.answeredBy === "X";

              let cellBg = "linear-gradient(180deg, #1E222B 0%, #14171E 100%)";
              let cellBorder = "rgba(255,255,255,0.14)";
              let cellShadow = "0 3px 0 #090A0E, inset 0 1px 0 rgba(255,255,255,0.08)";
              let cellRing = "";

              if (isWinning) {
                cellBorder = "#F5A623";
                cellShadow = "0 3px 0 #9E6300, 0 0 24px rgba(245,166,35,0.6), inset 0 0 10px rgba(245,166,35,0.25)";
                cellRing = "ring-2 ring-[#F5A623]";
              } else if (isOccupied && isPlayerX) {
                cellBorder = "rgba(245,166,35,0.8)";
                cellShadow = "0 3px 0 #7C4D00, 0 0 14px rgba(245,166,35,0.22)";
              } else if (isOccupied && !isPlayerX) {
                cellBorder = "rgba(0,213,232,0.8)";
                cellShadow = "0 3px 0 #006673, 0 0 14px rgba(0,213,232,0.22)";
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
                  className={`w-full aspect-square relative rounded-xl overflow-hidden min-w-0 transition-all transform active:translate-y-[2px] active:scale-[0.98] group ${cellRing} ${
                    isWinning ? "scale-[1.03] z-10 winning-beam" : ""
                  }`}
                  style={{
                    background: cellBg,
                    border: `1.5px solid ${cellBorder}`,
                    boxShadow: cellShadow,
                  }}
                >
                  {/* Boş Kare Köşe İşaretleri (35mm Kamera Vizörü) */}
                  {!isOccupied && (
                    <>
                      <div
                        className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 pointer-events-none"
                        style={{
                          borderTop: "1.5px solid rgba(245,166,35,0.35)",
                          borderLeft: "1.5px solid rgba(245,166,35,0.35)",
                        }}
                      />
                      <div
                        className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 pointer-events-none"
                        style={{
                          borderTop: "1.5px solid rgba(245,166,35,0.35)",
                          borderRight: "1.5px solid rgba(245,166,35,0.35)",
                        }}
                      />
                      <div
                        className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 pointer-events-none"
                        style={{
                          borderBottom: "1.5px solid rgba(245,166,35,0.35)",
                          borderLeft: "1.5px solid rgba(245,166,35,0.35)",
                        }}
                      />
                      <div
                        className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 pointer-events-none"
                        style={{
                          borderBottom: "1.5px solid rgba(245,166,35,0.35)",
                          borderRight: "1.5px solid rgba(245,166,35,0.35)",
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-45 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] sm:text-[10px] font-mono font-black text-[#F5A623] bg-[#0F1115]/80 px-1.5 py-0.5 rounded-md border border-[#F5A623]/40">
                          + SEÇ
                        </span>
                      </div>
                    </>
                  )}

                  {/* Dolu Kare */}
                  {isOccupied && (
                    <CellMoviePoster cellData={cellData} isWinning={isWinning} />
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
