"use client";

import React, { useMemo } from "react";
import { GameBoard, ContentPoolType, Movie } from "@/core";
import { findMatchingMovies, getSharedActors } from "@/core/engine/validator";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";
import { X, Award, User } from "lucide-react";
import { useTranslation } from "@/i18n";

export interface ReviewAnswersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  board: GameBoard;
  cellIndex: number | null;
  contentPool?: ContentPoolType;
}

export const ReviewAnswersSheet: React.FC<ReviewAnswersSheetProps> = ({
  isOpen,
  onClose,
  board,
  cellIndex,
  contentPool = "HYBRID",
}) => {
  const { t, tCriterion, locale } = useTranslation();
  const isEn = locale === "en";

  const cellDetails = useMemo(() => {
    if (cellIndex === null || cellIndex < 0 || cellIndex > 8) return null;
    const rowIndex = Math.floor(cellIndex / 3);
    const colIndex = cellIndex % 3;
    const rowCrit = board.rows[rowIndex];
    const colCrit = board.cols[colIndex];
    if (!rowCrit || !colCrit) return null;

    const rowLabel = tCriterion(rowCrit.label);
    const colLabel = tCriterion(colCrit.label);
    const isReverseCast = board.boardMode === "REVERSE_CAST";

    if (isReverseCast) {
      const allActors = getSharedActors(rowCrit.value, colCrit.value, MOVIES_DATABASE);
      const totalCount = allActors.length;
      const displayActors = allActors.slice(0, 8);
      const remainingCount = Math.max(0, totalCount - 8);

      return {
        rowLabel,
        colLabel,
        isReverseCast: true,
        items: displayActors,
        totalCount,
        remainingCount,
      };
    }

    const matchingMovies = findMatchingMovies(rowCrit, colCrit, MOVIES_DATABASE, contentPool);
    // Deterministik sıralama: Gişe / Oscar / Yıl ağırlığı
    const sortedMovies = [...matchingMovies].sort((a, b) => {
      const scoreA =
        (a.boxOfficeCategory === "BLOCKBUSTER" ? 2 : 1) * (a.hasOscar ? 1.5 : 1) +
        (a.year >= 2000 ? 1 : 0);
      const scoreB =
        (b.boxOfficeCategory === "BLOCKBUSTER" ? 2 : 1) * (b.hasOscar ? 1.5 : 1) +
        (b.year >= 2000 ? 1 : 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.year - a.year;
    });

    const totalCount = sortedMovies.length;
    const displayMovies = sortedMovies.slice(0, 8);
    const remainingCount = Math.max(0, totalCount - 8);

    return {
      rowLabel,
      colLabel,
      isReverseCast: false,
      items: displayMovies,
      totalCount,
      remainingCount,
    };
  }, [board, cellIndex, contentPool, tCriterion]);

  if (!isOpen || !cellDetails) return null;

  return (
    <>
      {/* Hafif arka plan tülü */}
      <div
        className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[1px] animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Kompakt Alt Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 max-w-lg mx-auto bg-[#14171D] border-t border-x border-[#D9A441]/30 rounded-t-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.9)] p-4 pb-6 sm:pb-5 animate-in slide-in-from-bottom duration-200 select-none flex flex-col max-h-[46vh]"
        role="dialog"
        aria-label="Review Answers Sheet"
      >
        {/* Sürükleme / Tutamaç Çizgisi */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2.5 shrink-0" />

        {/* Başlık Alanı */}
        <div className="flex items-start justify-between gap-2 mb-3 shrink-0">
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#D9A441] font-bold block mb-0.5">
              {t("game.validAlternativesTitle")}
            </span>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#E8E6E1] truncate leading-snug">
              {cellDetails.rowLabel} <span className="text-[#D9A441]/75">×</span> {cellDetails.colLabel}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-[#8A8F9A] hover:text-[#E8E6E1] flex items-center justify-center shrink-0 transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alternatif Cevap Listesi */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {cellDetails.items.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8A8F9A]">
              {t("game.noAlternativesFound")}
            </div>
          ) : cellDetails.isReverseCast ? (
            <div className="grid grid-cols-2 gap-2">
              {(cellDetails.items as string[]).map((actor, idx) => (
                <div
                  key={`${actor}-${idx}`}
                  className="p-2 rounded-lg bg-[#0B0D12] border border-white/10 flex items-center gap-2 select-none min-w-0"
                >
                  <User className="w-3.5 h-3.5 text-[#D9A441]/70 shrink-0" />
                  <span className="font-serif text-xs font-semibold text-[#E8E6E1] truncate">
                    {actor}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(cellDetails.items as Movie[]).map((movie) => (
                <div
                  key={movie.id}
                  className="p-2 rounded-lg bg-[#0B0D12] border border-white/10 flex flex-col justify-between select-none min-w-0 gap-1"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-serif text-xs font-semibold text-[#E8E6E1] line-clamp-2 leading-tight">
                      {movie.title}
                    </span>
                    {movie.hasOscar && (
                      <span title="Oscar" className="shrink-0 mt-0.5">
                        <Award className="w-3 h-3 text-[#D9A441]" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8F9A]">
                    <span>{movie.year > 0 ? movie.year : ""}</span>
                    {movie.mediaType === "SERIES" && (
                      <span className="text-[9px] uppercase tracking-wider text-[#4FA3C7]">
                        {isEn ? "Series" : "Dizi"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 8'den Fazla Sonuç Varsa Ek Metin (Sonuç <= 8 ise gösterilmez) */}
          {cellDetails.remainingCount > 0 && (
            <div className="text-center py-2 shrink-0">
              <span className="text-[11px] font-mono font-medium text-[#D9A441]/85 tracking-wide">
                {cellDetails.isReverseCast
                  ? t("game.moreActorsAvailable").replace("{count}", String(cellDetails.remainingCount))
                  : t("game.moreTitlesAvailable").replace("{count}", String(cellDetails.remainingCount))}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
