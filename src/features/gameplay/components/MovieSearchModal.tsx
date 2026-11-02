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
          background: "#14171D",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
        }}
      >
        {/* Selected Cell Target Intersection Header (Pinned Shrink-0) */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <span className="inline-block text-[9px] font-mono uppercase font-bold tracking-[0.2em] text-[#D9A441]">
              HEDEF KESİŞİM
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#0B0D12] text-[#E8E6E1] border border-[#D9A441]/40 flex items-center gap-1.5">
                {rowAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-[#D9A441]/60">
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
              <span className="font-mono text-[#D9A441] font-bold text-xs">
                ×
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#0B0D12] text-[#E8E6E1] border border-[#4FA3C7]/40 flex items-center gap-1.5">
                {colAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-[#4FA3C7]/60">
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
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#181B22] border border-white/10 text-[#8A8F9A] transition hover:text-[#E8E6E1] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input (Pinned Shrink-0) */}
        <div className="my-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D9A441] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Film veya dizi adı yaz..."
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-[#0B0D12] border border-white/10 focus:border-[#D9A441] rounded-2xl text-base font-semibold text-[#E8E6E1] placeholder:text-[#8A8F9A]/50 focus:outline-none transition-colors"
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
              <span className="font-mono text-[11px] text-[#D9A441] font-bold">
                {filteredMovies.length} sonuç
              </span>
            )}
          </div>
        </div>

        {/* Controlled Error Notice */}
        {errorMessage && (
          <div className="wrong-recoil mb-2.5 p-2.5 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/50 text-[#E8E6E1] text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#E5484D] shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Anti-Cheat Search Results List (Flexible Scrollable Area) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1.5 pr-1 custom-scrollbar">
          {query.trim().length < 2 ? (
            <div className="py-6 sm:py-8 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-[#181B22] border border-white/10 flex items-center justify-center mb-2.5 text-[#D9A441] shadow">
                <Film className="w-5 h-5" />
              </div>
              <p className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#E8E6E1]">
                Film veya Dizi Adını Yazmaya Başla
              </p>
              <p className="text-xs text-[#8A8F9A] mt-1 max-w-xs leading-relaxed">
                Sonuçları listelemek için en az 2 harf girilmelidir.
              </p>
              <p className="text-[10px] text-[#8EBB70] mt-2 font-medium">
                Anti-Cheat: Tür ve yıl ipuçları adil oyun için gizlenmiştir
              </p>
            </div>
          ) : visibleMovies.length === 0 ? (
            <div className="py-8 text-center text-[#8A8F9A] text-xs">
              <Film className="w-6 h-6 mx-auto mb-2 text-[#8A8F9A]/40" />
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
                      ? "opacity-40 bg-[#0B0D12] border-white/5 cursor-not-allowed"
                      : "bg-[#181B22] hover:bg-[#202530] border-white/10 hover:border-[#D9A441] active:translate-y-[1px]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-[#0B0D12] shrink-0 border border-white/10">
                      <SearchMovieThumbnail movie={movie} />
                    </div>

                    <div className="min-w-0">
                      <div className="font-sans font-bold text-sm text-[#E8E6E1] truncate flex items-center gap-2">
                        <span className="truncate">{movie.title}</span>
                        {movie.mediaType === "SERIES" && (
                          <span className="text-[9px] font-bold font-mono text-[#4FA3C7] bg-[#4FA3C7]/15 px-1.5 py-0.5 rounded border border-[#4FA3C7]/30 shrink-0">
                            DİZİ
                          </span>
                        )}
                      </div>
                      {hasDiffOriginal && (
                        <div className="text-xs text-[#8A8F9A] truncate mt-0.5 italic">
                          {movie.originalTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right pl-2">
                    {isUsed ? (
                      <span className="font-mono text-[10px] font-bold text-[#8A8F9A] px-2.5 py-1 rounded-lg bg-[#0B0D12]">
                        Kullanıldı
                      </span>
                    ) : (
                      <span className="tactile-btn-amber inline-block text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl text-[#0B0D12]">
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
