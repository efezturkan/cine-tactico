"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Criterion, Movie, ContentPoolType, CellAnswer } from "@/core";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";
import { movieMatchesTitleQuery } from "@/content/search/movieTitle";
import { Search, X, Film, ShieldCheck, AlertTriangle } from "lucide-react";
import { audio } from "@/utils/audio";
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
    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-1 text-center">
      <Film className="w-4 h-4 text-amber-400" />
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
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
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

    if (query.trim().length < 2) return [];
    return pool.filter((movie) => movieMatchesTitleQuery(movie, query));
  }, [query, contentPool]);

  const rowCritAsset = useMemo(() => assetResolver.resolveForCriterion(rowCrit), [rowCrit]);
  const colCritAsset = useMemo(() => assetResolver.resolveForCriterion(colCrit), [colCrit]);
  const rowAvatar = rowCrit.avatarUrl || (rowCritAsset.isAvailable ? rowCritAsset.src : undefined);
  const colAvatar = colCrit.avatarUrl || (colCritAsset.isAvailable ? colCritAsset.src : undefined);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-cinema-card border border-cinema-border rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[82vh]">
        {/* Kare Hedefi & Kriter Kartları */}
        <div className="flex items-start justify-between pb-3 border-b border-cinema-border">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              Kare Hedefi
            </span>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center gap-1.5">
                {rowAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-zinc-600/60">
                    <Image src={rowAvatar} alt="" fill className="object-cover" unoptimized />
                  </span>
                )}
                {rowCrit.label}
              </span>
              <span className="text-zinc-500 font-bold text-xs">+</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center gap-1.5">
                {colAvatar && (
                  <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block border border-zinc-600/60">
                    <Image src={colAvatar} alt="" fill className="object-cover" unoptimized />
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

        {/* Hızlı Arama Input (Sadece Film / Dizi Adı) */}
        <div className="relative my-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Film adı"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full pl-10 pr-4 py-3 bg-cinema-dark border border-cinema-border focus:border-amber-400 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
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
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Afişli Görsel Film Listesi (ANTI-CHEAT: Tür, Yıl, Ödül, Gişe ve Yönetmen bilgileri KESİNLİKLE gösterilmez!) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {query.trim().length < 2 ? (
            <div className="py-12 px-4 text-center text-zinc-400 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mb-3 text-amber-400 shadow-md">
                <Film className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-zinc-200">Film veya Dizi Adını Yazmaya Başla</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                Sonuçları listelemek için en az 2 harf girilmelidir.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Anti-Cheat: Tür ve yıl ipuçları adil oyun için gizlenmiştir
              </div>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              <Film className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              &quot;{query}&quot; ile eşleşen yapım bulunamadı.
            </div>
          ) : (
            filteredMovies.map(movie => {
              const isUsed = usedMovieIds.includes(movie.id);
              const hasDiffOriginal =
                movie.originalTitle &&
                movie.originalTitle.trim().toLowerCase() !== movie.title.trim().toLowerCase();

              return (
                <button
                  key={movie.id}
                  disabled={isUsed}
                  onClick={() => onSelectMovie(movie)}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                    isUsed
                      ? "opacity-40 bg-zinc-950 border-zinc-900 cursor-not-allowed"
                      : "bg-zinc-900/80 hover:bg-zinc-800 border-cinema-border hover:border-amber-400/60 active:scale-[0.99] shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Dikey Afiş Küçük Resmi (Yıl/Metin Yok) */}
                    <div className="relative w-11 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60 shadow-md">
                      <SearchMovieThumbnail movie={movie} />
                    </div>

                    {/* Film Bilgileri: SADECE Film Adı & Varsa Orijinal Adı (Kriter Kopyası 0!) */}
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-zinc-100 truncate flex items-center gap-2">
                        <span>{movie.title}</span>
                        {movie.mediaType === "SERIES" && (
                          <span className="text-[9px] font-black font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/25">
                            DİZİ
                          </span>
                        )}
                      </div>
                      {hasDiffOriginal && (
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5 italic">
                          {movie.originalTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right pl-2">
                    {isUsed ? (
                      <span className="text-[10px] font-bold text-zinc-500 px-2 py-1 rounded bg-zinc-800">
                        Kullanıldı
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
