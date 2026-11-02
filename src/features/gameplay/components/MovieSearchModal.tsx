"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Criterion, Movie, ContentPoolType, CellAnswer } from "@/core";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";
import { movieMatchesTitleQuery } from "@/content/search/movieTitle";
import { Search, X, Film, ShieldCheck, AlertTriangle } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { assetResolver } from "@/utils/assetResolver";

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
}

const SearchMovieThumbnail = React.memo<{ movie: Movie }>(({ movie }) => {
  const [imgError, setImgError] = useState(false);
  const resolved = useMemo(() => assetResolver.resolveForMovie(movie), [movie]);

  if (resolved.isAvailable && resolved.src && !imgError) {
    return (
      <img
        src={resolved.src}
        alt=""
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="w-full h-full bg-[#0F1115] flex flex-col items-center justify-center p-1 text-center">
      <Film className="w-4 h-4 text-[#F5A623]" />
    </div>
  );
});
SearchMovieThumbnail.displayName = "SearchMovieThumbnail";

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
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [vpStyle, setVpStyle] = useState<{ height?: number; top?: number }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
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
    return basePool.filter((movie) => movieMatchesTitleQuery(movie, trimmed));
  }, [query, basePool]);

  const visibleMovies = useMemo(
    () => filteredMovies.slice(0, 40),
    [filteredMovies]
  );

  const rowCritAsset = useMemo(
    () => assetResolver.resolveForCriterion(rowCrit),
    [rowCrit]
  );
  const colCritAsset = useMemo(
    () => assetResolver.resolveForCriterion(colCrit),
    [colCrit]
  );
  const rowAvatar =
    rowCrit.avatarUrl ||
    (rowCritAsset.isAvailable ? rowCritAsset.src : undefined);
  const colAvatar =
    colCrit.avatarUrl ||
    (colCritAsset.isAvailable ? colCritAsset.src : undefined);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm select-none"
      style={{
        top: vpStyle.top !== undefined ? `${vpStyle.top}px` : 0,
        height: vpStyle.height !== undefined ? `${vpStyle.height}px` : "100dvh",
      }}
    >
      <div
        className="w-full max-w-[460px] animate-card-in rounded-3xl p-3.5 sm:p-5 shadow-2xl flex flex-col text-[#F1EEE7] overflow-hidden"
        style={{
          maxHeight:
            vpStyle.height !== undefined
              ? `${Math.max(250, vpStyle.height - 16)}px`
              : "92dvh",
          background: "linear-gradient(180deg, #1C2029 0%, #12151C 100%)",
          border: "1.5px solid #2A2F3A",
          borderBottom: "4px solid #090A0E",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Selected Cell Target Intersection Header (Pinned Shrink-0) */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <span className="inline-block text-[9px] font-mono uppercase font-bold tracking-[0.2em] text-[#F5A623]">
              HEDEF KESİŞİM &middot; 35MM ARAMA
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#0F1115] text-[#F1EEE7] border border-[#F5A623]/40 flex items-center gap-1.5">
                {rowAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-[#F5A623]/60">
                    <Image
                      src={rowAvatar}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </span>
                )}
                {rowCrit.label}
              </span>
              <span className="font-mono text-[#F5A623] font-bold text-xs">
                ×
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#0F1115] text-[#F1EEE7] border border-[#00D5E8]/40 flex items-center gap-1.5">
                {colAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-[#00D5E8]/60">
                    <Image
                      src={colAvatar}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </span>
                )}
                {colCrit.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#252932] border border-white/10 text-[#A5A8B0] transition hover:text-[#F1EEE7] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input (Pinned Shrink-0) */}
        <div className="my-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5A623] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ortak filmin adını yaz..."
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-[#0F1115] border border-white/15 focus:border-[#F5A623] rounded-2xl text-base font-semibold text-[#F1EEE7] placeholder:text-[#A5A8B0]/50 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5A8B0] hover:text-[#F1EEE7]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-[11px] text-[#A5A8B0]">
              Yalnızca yapım adına göre aranır.
            </span>
            {query.trim().length >= 2 && (
              <span className="font-mono text-[11px] text-[#F5A623] font-bold">
                {filteredMovies.length} sonuç
              </span>
            )}
          </div>
        </div>

        {/* Controlled Error Notice */}
        {errorMessage && (
          <div className="wrong-recoil mb-2.5 p-2.5 rounded-xl bg-[#FF334B]/15 border border-[#FF334B]/50 text-[#F1EEE7] text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#FF334B] shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Anti-Cheat Search Results List (Flexible Scrollable Area) */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {query.trim().length < 2 ? (
            <div className="py-6 sm:py-8 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-[#181B22] border border-white/10 flex items-center justify-center mb-2.5 text-[#F5A623] shadow">
                <Film className="w-5 h-5" />
              </div>
              <p className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#F1EEE7]">
                Film veya Dizi Adını Yazmaya Başla
              </p>
              <p className="text-xs text-[#A5A8B0] mt-1 max-w-xs leading-relaxed">
                Sonuçları listelemek için en az 2 harf girilmelidir.
              </p>
              <p className="text-[10px] text-[#8EBB70] mt-2 font-medium">
                Anti-Cheat: Tür ve yıl ipuçları adil oyun için gizlenmiştir
              </p>
            </div>
          ) : visibleMovies.length === 0 ? (
            <div className="py-8 text-center text-[#A5A8B0] text-xs">
              <Film className="w-6 h-6 mx-auto mb-2 text-[#A5A8B0]/40" />
              &quot;{query}&quot; ile eşleşen yapım bulunamadı.
            </div>
          ) : (
            visibleMovies.map((movie) => {
              const isUsed = usedIdsSet.has(movie.id);
              const hasDiffOriginal =
                movie.originalTitle &&
                movie.originalTitle.trim().toLowerCase() !==
                  movie.title.trim().toLowerCase();

              return (
                <button
                  key={movie.id}
                  type="button"
                  disabled={isUsed}
                  onClick={() => {
                    haptic.light();
                    onSelectMovie(movie);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                    isUsed
                      ? "opacity-40 bg-[#0F1115] border-white/5 cursor-not-allowed"
                      : "bg-[#181B22] hover:bg-[#222631] border-white/12 hover:border-[#F5A623] active:translate-y-[1px]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-[#0F1115] shrink-0 border border-white/10">
                      <SearchMovieThumbnail movie={movie} />
                    </div>

                    <div className="min-w-0">
                      <div className="font-sans font-bold text-sm text-[#F1EEE7] truncate flex items-center gap-2">
                        <span className="truncate">{movie.title}</span>
                        {movie.mediaType === "SERIES" && (
                          <span className="text-[9px] font-bold font-mono text-[#00D5E8] bg-[#00D5E8]/15 px-1.5 py-0.5 rounded border border-[#00D5E8]/30 shrink-0">
                            DİZİ
                          </span>
                        )}
                      </div>
                      {hasDiffOriginal && (
                        <div className="text-xs text-[#A5A8B0] truncate mt-0.5 italic">
                          {movie.originalTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right pl-2">
                    {isUsed ? (
                      <span className="font-mono text-[10px] font-bold text-[#A5A8B0] px-2.5 py-1 rounded-lg bg-[#0F1115]">
                        Kullanıldı
                      </span>
                    ) : (
                      <span className="tactile-btn-amber inline-block text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl text-[#0F1115]">
                        Seç &rarr;
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
