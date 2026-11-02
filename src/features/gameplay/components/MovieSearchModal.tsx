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

const SearchMovieThumbnail: React.FC<{ movie: Movie }> = ({ movie }) => {
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
    <div className="w-full h-full bg-night flex flex-col items-center justify-center p-1 text-center">
      <Film className="w-4 h-4 text-gold" />
    </div>
  );
};

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 45);
    }
  }, [isOpen, initialQuery]);

  const filteredMovies = useMemo(() => {
    let pool = MOVIES_DATABASE;
    if (contentPool === "FILM") {
      pool = pool.filter((m) => m.mediaType !== "SERIES");
    } else if (contentPool === "SERIES") {
      pool = pool.filter((m) => m.mediaType === "SERIES");
    }

    if (query.trim().length < 2) return [];
    return pool.filter((movie) => movieMatchesTitleQuery(movie, query));
  }, [query, contentPool]);

  const rowCritAsset = useMemo(() => assetResolver.resolveForCriterion(rowCrit), [rowCrit]);
  const colCritAsset = useMemo(() => assetResolver.resolveForCriterion(colCrit), [colCrit]);
  const rowAvatar = rowCrit.avatarUrl || (rowCritAsset.isAvailable ? rowCritAsset.src : undefined);
  const colAvatar = colCrit.avatarUrl || (colCritAsset.isAvailable ? colCritAsset.src : undefined);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-[460px] animate-card-in bg-panel border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[88dvh] sm:max-h-[82vh] text-ink">
        {/* Selected Cell Target Intersection Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
          <div className="min-w-0">
            <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-gold">
              HEDEF KESİŞİM
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-control text-ink border border-gold/40 flex items-center gap-1.5">
                {rowAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-gold/60">
                    <Image src={rowAvatar} alt="" fill className="object-cover" unoptimized />
                  </span>
                )}
                {rowCrit.label}
              </span>
              <span className="font-mono text-gold font-bold text-xs">×</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-control text-ink border border-team-blue/40 flex items-center gap-1.5">
                {colAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-team-blue/60">
                    <Image src={colAvatar} alt="" fill className="object-cover" unoptimized />
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-ink shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="my-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
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
              className="w-full pl-10 pr-9 py-3 bg-night border border-white/15 focus:border-gold rounded-2xl text-base font-semibold text-ink placeholder:text-muted/50 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-[11px] text-muted">
              Yalnızca yapım adına göre aranır.
            </span>
            {query.trim().length >= 2 && (
              <span className="font-mono text-[11px] text-gold font-bold">
                {filteredMovies.length} sonuç
              </span>
            )}
          </div>
        </div>

        {/* Controlled Error Notice */}
        {errorMessage && (
          <div className="wrong-recoil mb-3 p-2.5 rounded-xl bg-missed/15 border border-missed/50 text-ink text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-missed shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Anti-Cheat Search Results List (ZERO metadata leaks) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {query.trim().length < 2 ? (
            <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-control border border-white/10 flex items-center justify-center mb-3 text-gold shadow">
                <Film className="w-5 h-5" />
              </div>
              <p className="font-display text-xl font-extrabold italic uppercase tracking-wide text-ink">
                Film veya Dizi Adını Yazmaya Başla
              </p>
              <p className="text-xs text-muted mt-1 max-w-xs leading-relaxed">
                Sonuçları listelemek için en az 2 harf girilmelidir.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-scored/15 border border-scored/30 text-[10px] font-bold text-scored">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anti-Cheat: Tür ve yıl ipuçları adil oyun için gizlenmiştir</span>
              </div>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="py-10 text-center text-muted text-xs">
              <Film className="w-7 h-7 mx-auto mb-2 text-muted/40" />
              &quot;{query}&quot; ile eşleşen yapım bulunamadı.
            </div>
          ) : (
            filteredMovies.map((movie) => {
              const isUsed = usedMovieIds.includes(movie.id);
              const hasDiffOriginal =
                movie.originalTitle &&
                movie.originalTitle.trim().toLowerCase() !== movie.title.trim().toLowerCase();

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
                      ? "opacity-40 bg-night border-white/5 cursor-not-allowed"
                      : "bg-control hover:bg-control-hover border-white/15 hover:border-gold active:translate-y-[1px]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-14 rounded-xl overflow-hidden bg-night shrink-0 border border-white/10">
                      <SearchMovieThumbnail movie={movie} />
                    </div>

                    <div className="min-w-0">
                      <div className="font-sans font-bold text-sm text-ink truncate flex items-center gap-2">
                        <span className="truncate">{movie.title}</span>
                        {movie.mediaType === "SERIES" && (
                          <span className="text-[9px] font-bold font-mono text-team-blue bg-team-blue/15 px-1.5 py-0.5 rounded border border-team-blue/30 shrink-0">
                            DİZİ
                          </span>
                        )}
                      </div>
                      {hasDiffOriginal && (
                        <div className="text-xs text-muted truncate mt-0.5 italic">
                          {movie.originalTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right pl-2">
                    {isUsed ? (
                      <span className="font-mono text-[10px] font-bold text-muted px-2.5 py-1 rounded-lg bg-night">
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
