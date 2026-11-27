"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Criterion, Movie, ContentPoolType, CellAnswer } from "@/core";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";
import { formatMovieDisplayTitle, rankMoviesForQuery } from "@/content/search/movieTitle";
import { Search, X, AlertTriangle } from "lucide-react";
import { haptic } from "@/utils/haptics";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { SearchClock } from "./SearchClock";

interface MovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowCrit: Criterion;
  colCrit: Criterion;
  usedMovieIds: string[];
  onSelectMovie: (movie: Movie) => void;
  contentPool?: ContentPoolType;
  errorMessage?: string | null;
  targetOccupant?: CellAnswer | null;
  initialQuery?: string;
  secondsRemaining?: number;
  shotClock?: number;
}

export const MovieSearchModal: React.FC<MovieSearchModalProps> = ({
  isOpen,
  onClose,
  rowCrit,
  colCrit,
  usedMovieIds,
  onSelectMovie,
  contentPool = "HYBRID",
  errorMessage,
  initialQuery = "",
  secondsRemaining,
  shotClock,
}) => {
  const { dict, locale, tCriterion } = useTranslation();
  const isEn = locale === "en";
  const [query, setQuery] = useState(initialQuery);
  const [vpStyle, setVpStyle] = useState<{ height?: number; top?: number }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuery]);

  // Adapt to mobile virtual keyboard via visualViewport
  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !window.visualViewport) {
      return;
    }
    const vv = window.visualViewport;
    const updateViewport = () => {
      setVpStyle({
        height: vv.height,
        top: vv.offsetTop,
      });
    };
    updateViewport();
    vv.addEventListener("resize", updateViewport);
    vv.addEventListener("scroll", updateViewport);
    return () => {
      vv.removeEventListener("resize", updateViewport);
      vv.removeEventListener("scroll", updateViewport);
    };
  }, [isOpen]);

  const basePool = useMemo(() => {
    if (contentPool === "FILM") {
      return MOVIES_DATABASE.filter((m) => m.mediaType !== "SERIES");
    }
    if (contentPool === "SERIES") {
      return MOVIES_DATABASE.filter((m) => m.mediaType === "SERIES");
    }
    return MOVIES_DATABASE;
  }, [contentPool]);

  const usedIdsSet = useMemo(() => new Set(usedMovieIds), [usedMovieIds]);

  const filteredMovies = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    // Tam eşleşme > başlangıç > alt-metin; aynı derecede veri sırası korunur.
    return rankMoviesForQuery(basePool, trimmed);
  }, [query, basePool]);

  const visibleMovies = useMemo(
    () => filteredMovies.slice(0, 40),
    [filteredMovies]
  );

  // Yıl yalnızca aynı görünen adı taşıyan yapımları ayırmak için gösterilir (ör. King Kong 1933 / 2005).
  // Tüm satırlarda yıl göstermek CRITICAL ANTI-CHEAT testini (modal-render) bozar: yıl bir ipucudur.
  const ambiguousTitles = useMemo(() => {
    const counts = new Map<string, number>();
    visibleMovies.forEach((movie) => {
      const t = formatMovieDisplayTitle(movie, locale);
      counts.set(t, (counts.get(t) ?? 0) + 1);
    });
    return new Set(Array.from(counts).filter(([, n]) => n > 1).map(([t]) => t));
  }, [visibleMovies, locale]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 select-none"
      style={{
        top: vpStyle.top !== undefined ? `${vpStyle.top}px` : 0,
        height: vpStyle.height !== undefined ? `${vpStyle.height}px` : "100dvh",
      }}
    >
      {/* 2.4 Alt Sheet (Bottom Sheet) */}
      <div
        className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] p-4 sm:p-5 flex flex-col max-h-[92dvh] shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
        style={{
          maxHeight:
            vpStyle.height !== undefined
              ? `${Math.max(260, vpStyle.height - 20)}px`
              : "92dvh",
        }}
      >
        <SearchClock secondsRemaining={secondsRemaining} shotClock={shotClock} />

        {/* Tutamaç Çizgisi (Handle Line) */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 shrink-0" />

        {/* 6D.1 Kriter Çipleri & Kapat Simge Butonu (Başlık Etiketi Yok) */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#181B22] text-[#E8E6E1] border border-white/10">
              {tCriterion(rowCrit.label)}
            </span>
            <span className="text-[#8A8F9A] font-bold text-xs">×</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#181B22] text-[#E8E6E1] border border-white/10">
              {tCriterion(colCrit.label)}
            </span>
          </div>

          <Button
            variant="icon"
            onClick={onClose}
            className="shrink-0"
            title={dict.common.close}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Arama Kutusu (Search Input) */}
        <div className="my-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D9A441] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.game.searchMoviePlaceholder}
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-[#0B0D12] border border-white/10 focus:border-[#D9A441] rounded-xl text-base font-medium text-[#E8E6E1] placeholder:text-[#8A8F9A]/50 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F9A] hover:text-[#E8E6E1]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hata Bildirimi */}
        {errorMessage && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/50 text-[#E8E6E1] text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#E5484D] shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* 6D.2 & 6D.4 Sonuç Listesi (Tek İç Kaydırma) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1.5 pr-1 custom-scrollbar">
          {query.trim().length < 2 ? (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
              <p className="text-sm text-[#8A8F9A]">
                {isEn ? "Type at least 2 letters of the title." : "Başlığın en az 2 harfini yaz."}
              </p>
            </div>
          ) : visibleMovies.length === 0 ? (
            <div className="py-8 text-center text-[#8A8F9A]">
              <p className="font-serif text-sm font-bold text-[#E8E6E1] mb-1">
                {dict.game.noResults}
              </p>
              <p className="text-xs text-[#8A8F9A]">
                {isEn ? "Check spelling." : "Yazımı kontrol et."}
              </p>
            </div>
          ) : (
            visibleMovies.map((movie) => {
              const isUsed = usedIdsSet.has(movie.id);
              // 6D.2: film simgesi karosu YOK. Kanonik okunabilir başlık. Tüm satır dokunulabilir.
              const displayTitle = formatMovieDisplayTitle(movie, locale);

              return (
                <button
                  key={movie.id}
                  type="button"
                  disabled={isUsed}
                  onClick={() => {
                    haptic.light();
                    onSelectMovie(movie);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition border ${
                    isUsed
                      ? "opacity-35 bg-[#0B0D12] border-white/5 cursor-not-allowed"
                      : "bg-[#181B22] hover:bg-[#1E222B] border-white/10 hover:border-[#D9A441]/50 active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-3">
                    <span className="font-sans font-bold text-sm text-[#E8E6E1] truncate">
                      {displayTitle}
                    </span>
                    {movie.year > 0 && ambiguousTitles.has(displayTitle) && (
                      <span className="font-sans text-xs text-[#8A8F9A] shrink-0 tabular-nums">
                        {movie.year}
                      </span>
                    )}
                    {movie.mediaType === "SERIES" && (
                      <span className="text-[11px] font-sans font-semibold text-[#4FA3C7] bg-[#4FA3C7]/15 px-1.5 py-0.5 rounded border border-[#4FA3C7]/30 shrink-0">
                        {isEn ? "SERIES" : "DİZİ"}
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    {isUsed ? (
                      <span className="text-[11px] text-[#8A8F9A]">
                        {isEn ? "Used" : "Kullanıldı"}
                      </span>
                    ) : (
                      <span className="text-[#D9A441] font-bold text-sm">
                        &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
