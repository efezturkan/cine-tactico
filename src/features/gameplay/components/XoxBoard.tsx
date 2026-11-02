"use client";

import React from "react";
import { GameBoard, CellAnswer, PlayerSymbol, Criterion } from "@/core";
import { audio } from "@/utils/audio";
import { Clapperboard, Award, Calendar, Film, Shield, Lock, User, Compass, Plus } from "lucide-react";
import { assetResolver } from "@/utils/assetResolver";
import { FLAGS } from "@/config/flags";
import { LocalFace } from "./LocalFace";

interface XoxBoardProps {
  board: GameBoard;
  cells: (CellAnswer | null)[];
  winningLine: [number, number, number] | null;
  currentTurn: PlayerSymbol;
  winner: PlayerSymbol | "DRAW" | null;
  onCellClick: (index: number) => void;
  allowSteal?: boolean;
  isIntro?: boolean;
  introPhase?: "3" | "2" | "1" | "ACTION" | null;
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
    <div className="relative w-full h-full flex flex-col justify-between p-1 sm:p-1.5 md:p-2 overflow-hidden rounded-xl select-none min-w-0 the-slam-stamp">
      {/* Ters Kadraj: Aktör Gösterimi vs Normal: Film Gösterimi */}
      {actorName ? (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${getGenreGradient()} flex flex-col items-center justify-center p-1 sm:p-1.5 text-center min-w-0`}
        >
          <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#4FA3C7] mb-0.5" />
          <span className="text-[8px] sm:text-xs md:text-sm font-black text-[#F1EEE7] line-clamp-2 uppercase leading-tight tracking-wide max-w-full">
            {actorName}
          </span>
          <span className="text-[6.5px] sm:text-[7.5px] md:text-[9px] text-[#4FA3C7] font-sans mt-0.5 font-bold">
            ORTAK OYUNCU
          </span>
        </div>
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${getGenreGradient()} flex flex-col items-center justify-center p-1 sm:p-1.5 text-center min-w-0`}
        >
          <Film className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#D9A441]/60 mb-0.5" />
          <span className="text-[8px] sm:text-xs md:text-sm font-black text-[#F1EEE7] line-clamp-2 uppercase leading-tight tracking-wide max-w-full">
            {movie.title}
          </span>
          <span className="text-[7px] sm:text-[8px] md:text-[9.5px] text-[#D9A441] font-mono mt-0.5 font-bold">
            {movie.year || ""}
          </span>
        </div>
      )}

      {/* Varlık Görsel Katmanı (FLAGS.PLAYER_PHOTOS ile korunur) */}
      {FLAGS.PLAYER_PHOTOS && cellAsset.isAvailable && cellAsset.src && (
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
        {FLAGS.SHOW_POINTS_SYSTEM && rarityScore ? (
          <div className="text-[6.5px] sm:text-[7.5px] md:text-[9px] font-black px-1 py-0.2 rounded bg-[#0F1115]/90 border border-[#D9A441]/50 text-[#D9A441] font-mono">
            +{rarityScore}
          </div>
        ) : (
          <div />
        )}
        <div
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center font-black font-mono text-[8.5px] sm:text-[9.5px] md:text-[11px]"
          style={{
            background: isPlayerX ? "#D9A441" : "#4FA3C7",
            color: "#0B0D12",
            border: "1px solid #0B0D12",
          }}
        >
          {answeredBy}
        </div>
      </div>

      {/* Alt Bar: Film Adı veya Aktör Adı */}
      <div className="relative z-10 text-left min-w-0">
        <div className="font-black text-[7.5px] sm:text-[10px] md:text-xs text-[#F1EEE7] truncate leading-tight">
          {actorName || movie.title}
        </div>
        {!actorName && movie.year > 0 && (
          <div className="text-[6.5px] sm:text-[7.5px] md:text-[9px] font-bold text-[#A5A8B0] truncate flex items-center gap-1 font-mono">
            <span>{movie.year}</span>
            <span>·</span>
            <span className="text-[#D9A441]">{movie.director.split(" ").pop()}</span>
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
  isIntro = false,
  introPhase = null,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const rowTypes = new Set(board.rows.map((r) => r.type));
  const colTypes = new Set(board.cols.map((c) => c.type));
  const areRowColDifferent =
    rowTypes.size > 1 || colTypes.size > 1 || board.rows[0]?.type !== board.cols[0]?.type;

  const renderCriterionHeader = (crit: Criterion) => {
    let iconElement: React.ReactNode;
    let badgeLabel = "";

    if (crit.type === "DIRECTOR") {
      badgeLabel = "YÖNETMEN";
      iconElement = (
        <span className="font-serif text-[#D9A441]/70 font-bold text-xs sm:text-sm select-none">
          {getInitials(crit.label)}
        </span>
      );
    } else if (crit.type === "ACTOR") {
      badgeLabel = "OYUNCU";
      iconElement = (
        <span className="font-serif text-[#D9A441]/70 font-bold text-xs sm:text-sm select-none">
          {getInitials(crit.label)}
        </span>
      );
    } else if (crit.type === "AWARD") {
      badgeLabel = "ÖDÜL";
      iconElement = <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]/70" />;
    } else if (crit.type === "DECADE") {
      badgeLabel = "DÖNEM";
      iconElement = <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]/70" />;
    } else if (crit.type === "MOVIE_INTERSECTION") {
      badgeLabel = "FİLM";
      iconElement = (
        <span className="font-serif text-[#D9A441]/70 font-bold text-xs sm:text-sm select-none">
          {getInitials(crit.label)}
        </span>
      );
    } else if (crit.type === "THEME") {
      badgeLabel = "TEMA";
      iconElement = <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]/70" />;
    } else if (crit.type === "FRANCHISE") {
      badgeLabel = "EVREN";
      iconElement = <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]/70" />;
    } else {
      badgeLabel = "TÜR";
      iconElement = <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]/70" />;
    }

    return (
      <div className="flex flex-col items-center justify-center text-center w-full h-full p-0.5 sm:p-1 md:p-1.5 select-none min-w-0 overflow-hidden">
        {/* İnce Çerçeveli KARE (Yüzey-2 Zemin, Altın %70 Harf / Çizgi İkon) */}
        <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md bg-[#181B22] border border-white/10 flex items-center justify-center shrink-0 mb-0.5 sm:mb-1">
          {iconElement}
        </div>
        {areRowColDifferent && (
          <span className="text-[5.5px] sm:text-[7px] md:text-[8px] uppercase tracking-wider text-[#8A8F9A] font-sans font-medium mb-0.5 truncate max-w-full leading-none">
            {badgeLabel}
          </span>
        )}
        <span className="text-[7.5px] sm:text-[10px] md:text-xs font-bold text-[#E8E6E1] line-clamp-2 leading-tight px-0.5 max-w-full break-words">
          {crit.label}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto px-0 py-0 min-w-0">
      {/* 4x4 Matris Grid Kart Kapsayıcısı */}
      <div
        className="rounded-2xl relative w-full overflow-hidden p-1.5 sm:p-2.5 shadow-2xl transition-all"
        style={{
          background: "#14171D",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 24px 60px -12px rgba(0,0,0,0.85), 0 0 1px 1px rgba(255,255,255,0.06)",
        }}
      >
        <div className="relative w-full aspect-square">
          {/* 4x4 Matris Grid - Tam 16 Öğe, Asla Ek Çocuk Eklenmez */}
          <div
            className="grid grid-cols-4 gap-1 sm:gap-2 w-full h-full"
            style={{
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            }}
          >
            {/* Sol Üst Köşe Logo Rozeti */}
            <div
              className="w-full aspect-square flex flex-col items-center justify-center rounded-xl min-w-0 overflow-hidden"
              style={{
                background: "#181B22",
                border: "1px solid rgba(217, 164, 65, 0.25)",
              }}
            >
              <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#D9A441]" />
              <span className="text-[6.5px] sm:text-[7.5px] md:text-[9px] font-bold mt-0.5 tracking-wider text-[#D9A441] uppercase font-mono">
                35MM
              </span>
            </div>

            {/* 3 Sütun Kriteri */}
            {board.cols.map((col, idx) => (
              <div
                key={col.id || idx}
                className="w-full aspect-square rounded-xl flex items-center justify-center p-0.5 sm:p-1 min-w-0 overflow-hidden"
                style={{
                  background: "#181B22",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
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
                    background: "#181B22",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {renderCriterionHeader(row)}
                </div>

                {/* 3 Oyun Hücresi (Film Karesi Estetiği, İnce Çerçeve, Köşe İşaretleri) */}
                {[0, 1, 2].map((cIdx) => {
                  const cellIndex = rIdx * 3 + cIdx;
                  const cellData = cells[cellIndex];
                  const isWinning = winningLine?.includes(cellIndex);
                  const isOccupied = cellData !== null;
                  const isPlayerX = cellData?.answeredBy === "X";

                  let cellBg = "#14171D";
                  let cellBorder = "rgba(255, 255, 255, 0.08)";

                  if (isWinning) {
                    cellBorder = "#D9A441";
                    cellBg = "rgba(217, 164, 65, 0.15)";
                  } else if (isOccupied && isPlayerX) {
                    cellBorder = "rgba(217, 164, 65, 0.55)";
                  } else if (isOccupied && !isPlayerX) {
                    cellBorder = "rgba(79, 163, 199, 0.55)";
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
                      className={`w-full aspect-square relative rounded-xl overflow-hidden min-w-0 transition-all transform active:scale-[0.98] group ${
                        isWinning ? "scale-[1.02] z-10 winning-beam ring-1 ring-[#D9A441]" : ""
                      }`}
                      style={{
                        background: cellBg,
                        border: `1px solid ${cellBorder}`,
                      }}
                    >
                      {/* Boş Kare Köşe İşaretleri (35mm Kamera Vizörü) */}
                      {!isOccupied && (
                        <>
                          <div
                            className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 pointer-events-none"
                            style={{
                              borderTop: "1.5px solid rgba(217, 164, 65, 0.35)",
                              borderLeft: "1.5px solid rgba(217, 164, 65, 0.35)",
                            }}
                          />
                          <div
                            className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 pointer-events-none"
                            style={{
                              borderTop: "1.5px solid rgba(217, 164, 65, 0.35)",
                              borderRight: "1.5px solid rgba(217, 164, 65, 0.35)",
                            }}
                          />
                          <div
                            className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 pointer-events-none"
                            style={{
                              borderBottom: "1.5px solid rgba(217, 164, 65, 0.35)",
                              borderLeft: "1.5px solid rgba(217, 164, 65, 0.35)",
                            }}
                          />
                          <div
                            className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 pointer-events-none"
                            style={{
                              borderBottom: "1.5px solid rgba(217, 164, 65, 0.35)",
                              borderRight: "1.5px solid rgba(217, 164, 65, 0.35)",
                            }}
                          />
                          <div
                            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-200 ${
                              isIntro ? "opacity-[0.12]" : "opacity-40 group-hover:opacity-100"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]/40 group-hover:text-[#D9A441] transition-colors" />
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

          {/* ── 3×3 OYNANABİLİR ALAN RETICLE COUNTDOWN & AKSİYON OVERLAY ─── */}
          {/* 4x4 Grid çizgilerini birebir paylaşan overlay katmanı; kesinlikle grid yerleşimini bozmaz */}
          {introPhase && (
            <div className="absolute inset-0 pointer-events-none z-30 grid grid-cols-4 grid-rows-4 gap-1 sm:gap-2">
              {/* 3×3 Alanını Saran Dış Çerçeve ve Vizör Köşe Nişangahları [ ┌ ┐ └ ┘ ] */}
              <div className="col-start-2 col-end-5 row-start-2 row-end-5 relative rounded-xl border border-[#D9A441]/25 pointer-events-none flex items-center justify-center">
                <div className="absolute top-0.5 left-0.5 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-[#D9A441]" />
                <div className="absolute top-0.5 right-0.5 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-[#D9A441]" />
                <div className="absolute bottom-0.5 left-0.5 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-[#D9A441]" />
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-[#D9A441]" />

                {/* FAZ 2: KLAKET VURUŞU & AKSİYON! (3x3 ALANIN TAM MERKEZİNDE) */}
                {introPhase === "ACTION" && (
                  <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-120 z-20 clapper-fade-out">
                    {/* Klaket Kolu (25 derece kalkık başlar, 160ms'de sertçe kapanıp çarpar, mikro sekme yapar) */}
                    <div
                      className="w-36 sm:w-48 md:w-56 h-5 sm:h-6 md:h-7 rounded-t-md relative overflow-hidden border border-white/20 origin-bottom-left clapper-arm-animate"
                      style={{
                        background:
                          "repeating-linear-gradient(45deg, #111, #111 8px, #E8E6E1 8px, #E8E6E1 16px)",
                      }}
                    />

                    {/* Klaket Gövdesi & Büyük Serif AKSİYON! (Vuruş anında mikro sekme ve altın parlama) */}
                    <div className="bg-[#14171D] border border-white/15 rounded-b-xl px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex flex-col items-center relative -mt-0.5 min-w-[140px] sm:min-w-[170px] md:min-w-[200px] clapper-body-animate">
                      <span className="font-mono text-[7px] sm:text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-[#8A8F9A] mb-0.5">
                        SAHNE 01 · ÇEKİM 01
                      </span>
                      <span className="font-serif text-xl sm:text-2xl md:text-3xl font-black text-[#D9A441] tracking-wider action-text-flash drop-shadow-[0_2px_12px_rgba(217,164,65,0.4)]">
                        AKSİYON!
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* FAZ 1: 3... 2... 1... VİZÖR GERİ SAYIMI (HÜCRE [1,1] MERKEZİNDE: COL 3, ROW 3) */}
              {introPhase !== "ACTION" && (
                <div className="col-start-3 row-start-3 flex items-center justify-center w-full h-full relative z-30 pointer-events-none">
                  <div className="relative w-[84%] aspect-square rounded-full flex flex-col items-center justify-center bg-black/40 border border-[#D9A441]/55 shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                    {/* Merkez Kıl Çaprazı (Analog Film Reticle Lines) */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#D9A441]/25 pointer-events-none" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#D9A441]/25 pointer-events-none" />

                    {/* Dönen İnce Odak Çemberi */}
                    <div
                      className="absolute inset-1 rounded-full border border-dashed border-[#D9A441]/35 animate-spin pointer-events-none"
                      style={{ animationDuration: "12s" }}
                    />

                    {/* 3... 2... 1... Rakamı */}
                    <div
                      key={introPhase}
                      className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#D9A441] leading-none animate-in zoom-in-75 duration-200 select-none z-10"
                    >
                      {introPhase}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
