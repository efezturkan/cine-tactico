"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Criterion, Movie, ContentPoolType, CellAnswer } from "@/types/game";
import { MOVIES_DATABASE } from "@/data/movies";
import { Search, X, Film, Star, Award, Tv, Sparkles, AlertCircle } from "lucide-react";
import { audio } from "@/utils/audio";

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
}

// Phase 2: MVP typographic-first mode (no TMDB poster dependency)
const SHOW_EXTERNAL_POSTERS = false;

const SearchMovieThumbnail: React.FC<{ movie: Movie }> = ({ movie }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (SHOW_EXTERNAL_POSTERS && movie.posterUrl && !imgFailed) {
    return (
      <Image
        src={movie.posterUrl}
        alt={movie.title}
        fill
        sizes="44px"
        className="object-cover"
        unoptimized
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-1 text-center">
      <Film className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
      <span className="text-[8px] font-black text-zinc-300 font-mono">{movie.year}</span>
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
  targetOccupant,
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredMovies = useMemo(() => {
    let pool = MOVIES_DATABASE;
    if (contentPool === "FILM") {
      pool = pool.filter(m => m.mediaType !== "SERIES");
    } else if (contentPool === "SERIES") {
      pool = pool.filter(m => m.mediaType === "SERIES");
    }

    const q = query.trim().toLowerCase();
    if (!q) {
      return pool.slice(0, 15);
    }
    return pool.filter(m => {
      // Yalnızca Film/Dizi adına (ve orijinal adına) göre filtreleme — Hile koruması: Yönetmen/Oyuncu ile film dökümü engellendi!
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchOrig = m.originalTitle?.toLowerCase().includes(q);
      return matchTitle || matchOrig;
    });
  }, [query, contentPool]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-cinema-card border border-cinema-border rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[82vh]">
        {/* Kare Hedefi & Kriter Kartları */}
        <div className="flex items-start justify-between pb-3 border-b border-cinema-border">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              Kare Hedefi
            </span>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center gap-1.5">
                {rowCrit.avatarUrl && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block">
                    <Image src={rowCrit.avatarUrl} alt="" fill className="object-cover" unoptimized />
                  </span>
                )}
                {rowCrit.label}
              </span>
              <span className="text-zinc-500 font-bold text-xs">+</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center gap-1.5">
                {colCrit.avatarUrl && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block">
                    <Image src={colCrit.avatarUrl} alt="" fill className="object-cover" unoptimized />
                  </span>
                )}
                {colCrit.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playSelect();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kare Çalma Bilgilendirme Rozeti */}
        {targetOccupant && (
          <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-zinc-900/90 to-amber-950/70 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">Kare Çalma Düellosu</span>
                <span className="truncate block text-zinc-200">
                  Mevcut Film: <b className="text-white">{targetOccupant.movie.title}</b>
                </span>
              </div>
            </div>
            <div className="shrink-0 px-2 py-1 rounded-lg bg-black/60 border border-amber-400/40 text-amber-400 font-mono font-black text-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>&gt; {targetOccupant.movie.imdbRating}</span>
            </div>
          </div>
        )}

        {/* Hızlı Arama Input (Sadece Film / Dizi Adı) */}
        <div className="relative my-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Film veya dizi adı gir (Örn: Inception, Matrix)..."
            className="w-full pl-10 pr-4 py-3 bg-cinema-dark border border-cinema-border focus:border-amber-400 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
          />
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-[10px] text-zinc-500 font-medium">Sadece yapım adına göre aranabilir (Yönetmen/Oyuncu ile arama yapılamaz).</span>
            {query && (
              <span className="text-[10px] text-amber-400 font-mono font-bold">{filteredMovies.length} sonuç</span>
            )}
          </div>
        </div>

        {/* Hatalı Kesişim Bildirimi (Non-blocking / İki Kriter Uyuşmazlığı) */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <span className="text-sm shrink-0">⚠️</span>
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Afişli Görsel Film Listesi (SPOILER-FREE: Yönetmen ve Oyuncu listelenmez!) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredMovies.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              <Film className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              Eşleşen film bulunamadı.
            </div>
          ) : (
            filteredMovies.map(movie => {
              const isUsed = usedMovieIds.includes(movie.id);
              const isStealTargetLower = targetOccupant ? movie.imdbRating <= targetOccupant.movie.imdbRating : false;
              const isDisabled = isUsed || isStealTargetLower;

              return (
                <button
                  key={movie.id}
                  disabled={isDisabled}
                  onClick={() => onSelectMovie(movie)}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                    isUsed
                      ? "opacity-40 bg-zinc-950 border-zinc-900 cursor-not-allowed"
                      : isStealTargetLower
                      ? "opacity-50 bg-zinc-950/60 border-zinc-800/80 cursor-not-allowed"
                      : targetOccupant
                      ? "bg-rose-950/20 hover:bg-rose-900/30 border-rose-500/30 hover:border-rose-400/70 active:scale-[0.99] shadow-sm"
                      : "bg-zinc-900/80 hover:bg-zinc-800 border-cinema-border hover:border-amber-400/60 active:scale-[0.99] shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Dikey Afiş Küçük Resmi */}
                    <div className="relative w-11 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60 shadow-md">
                      <SearchMovieThumbnail movie={movie} />
                    </div>

                    {/* Film Bilgileri: SADECE Film Adı, Çıkış Yılı ve Türler (Yönetmen kopyası YOK!) */}
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-zinc-100 truncate flex items-center gap-1.5">
                        {movie.title}
                        <span className="text-[11px] font-medium text-zinc-400">({movie.year})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        Tür: {movie.genres.join(" · ")}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-zinc-400 flex-wrap">
                        {/* IMDb Puanı */}
                        <span className="flex items-center gap-0.5 text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-mono font-bold text-[10px]">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {movie.imdbRating}
                        </span>

                        {movie.hasOscar && (
                          <span className="flex items-center gap-0.5 text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                            <Award className="w-2.5 h-2.5" /> Oscar
                          </span>
                        )}
                        {movie.mediaType === "SERIES" ? (
                          <span className="flex items-center gap-0.5 text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/25 text-[9px] font-black font-mono">
                            <Tv className="w-2.5 h-2.5" /> DİZİ
                          </span>
                        ) : (
                          <span className="text-zinc-500">{movie.boxOfficeCategory || "SİNEMA"}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right pl-2">
                    {isUsed ? (
                      <span className="text-[10px] font-bold text-zinc-500 px-2 py-1 rounded bg-zinc-800">
                        Kullanıldı
                      </span>
                    ) : isStealTargetLower ? (
                      <span className="text-[9px] font-mono font-bold text-rose-400/70 px-2 py-1 rounded bg-rose-950/30 border border-rose-900/40">
                        Puan Düşük ({movie.imdbRating})
                      </span>
                    ) : targetOccupant ? (
                      <span className="text-xs font-black text-rose-400 group-hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-rose-400" /> Çal &rarr;
                      </span>
                    ) : (
                      <span className="text-xs font-black text-amber-400 group-hover:text-amber-300 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
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
