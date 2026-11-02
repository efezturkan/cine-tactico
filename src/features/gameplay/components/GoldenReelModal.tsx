"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { PlayerSymbol, Movie } from "@/core";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";
import { movieMatchesTitleQuery } from "@/content/search/movieTitle";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { Sparkles, Film, Clock, X, AlertTriangle } from "lucide-react";

interface GoldenReelModalProps {
  isOpen: boolean;
  question: string;
  scoreRarityX: number;
  scoreRarityO: number;
  currentTurn: PlayerSymbol;
  onSubmitAnswer: (movie: Movie, playerSymbol: PlayerSymbol) => { success: boolean; message?: string };
  onTimeout: () => void;
}

export const GoldenReelModal: React.FC<GoldenReelModalProps> = ({
  isOpen,
  question,
  scoreRarityX,
  scoreRarityO,
  currentTurn,
  onSubmitAnswer,
  onTimeout,
}) => {
  const [seconds, setSeconds] = useState<number>(12);
  const [query, setQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPhotoFinish, setIsPhotoFinish] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSeconds(12);
      setQuery("");
      setErrorMessage(null);
      setIsPhotoFinish(false);
      audio.playPowerup();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPhotoFinish(true);
            audio.playError();
            haptic.error();
            setTimeout(() => {
              onTimeout();
            }, 1800);
            return 0;
          }
          if (prev <= 5) {
            audio.playTick(500 + (6 - prev) * 100);
            haptic.light();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, onTimeout]);

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return MOVIES_DATABASE.filter((movie) => movieMatchesTitleQuery(movie, q)).slice(0, 5);
  }, [query]);

  const handleSelectMovie = (movie: Movie) => {
    const res = onSubmitAnswer(movie, currentTurn);
    if (!res.success) {
      setErrorMessage(res.message || "Hatalı film!");
      audio.playError();
      haptic.error();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/95 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md animate-card-in bg-panel border-2 border-gold rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden text-ink">
        {/* Dönen Altın Makara Simgesi */}
        <div className="relative my-3 flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-full border-[3px] border-gold bg-night flex items-center justify-center animate-spin"
            style={{ animationDuration: "5s" }}
          >
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
              <Film className="w-5 h-5 text-night" />
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-gold absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Başlık & Kural */}
        <div className="text-xs font-semibold uppercase tracking-widest text-gold">
          ALTIN MAKARA · UZATMA
        </div>
        <h2 className="mt-1 font-display text-4xl font-extrabold italic uppercase tracking-wide text-ink">
          SON KARAR
        </h2>
        <p className="text-xs text-muted mt-1 max-w-xs">
          9 kare doldu, 3&apos;lü hat çıkmadı! İlk doğru filmi yazan anında kazanır.
        </p>

        {/* 12 Saniye Geri Sayımı */}
        <div className="my-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-night border border-gold/40">
          <Clock className={`w-4 h-4 ${seconds <= 4 ? "text-missed animate-ping" : "text-gold"}`} />
          <span className={`text-xl font-bold font-mono ${seconds <= 4 ? "text-missed" : "text-gold"}`}>
            00:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>

        {/* Soru Görevi */}
        <div className="w-full p-3.5 rounded-xl bg-night border border-white/10 text-left my-2">
          <div className="text-[10px] font-bold text-gold uppercase tracking-wider">
            Altın Kriter:
          </div>
          <div className="text-sm font-bold text-ink mt-0.5">
            {question}
          </div>
        </div>

        {/* İstatistik Çubuğu */}
        <div className="w-full grid grid-cols-2 gap-2 my-2 p-2.5 rounded-xl bg-night border border-white/10 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gold">SEN (X)</span>
            <span className="text-base font-extrabold text-ink font-display">{scoreRarityX} Puan</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-team-blue">RAKİP (O)</span>
            <span className="text-base font-extrabold text-ink font-display">{scoreRarityO} Puan</span>
          </div>
        </div>

        {errorMessage && (
          <div className="text-missed text-xs font-bold my-1 flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isPhotoFinish ? (
          <div className="my-3 p-3 rounded-xl bg-gold/15 border border-gold text-gold text-xs font-bold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-gold" />
            <span>Süre Doldu! Karar hesaplanıyor...</span>
          </div>
        ) : (
          <div className="w-full mt-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hemen bir film adı yaz..."
                className="w-full bg-night border border-white/15 focus:border-gold rounded-xl px-4 py-3 text-sm text-ink placeholder-muted/50 font-semibold outline-none"
                autoComplete="off"
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

            {filteredMovies.length > 0 && (
              <div className="mt-2 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {filteredMovies.map((movie) => {
                  const hasDiffOriginal =
                    movie.originalTitle &&
                    movie.originalTitle.trim().toLowerCase() !== movie.title.trim().toLowerCase();

                  return (
                    <button
                      key={movie.id}
                      onClick={() => handleSelectMovie(movie)}
                      className="w-full p-2.5 rounded-xl bg-control hover:bg-control-hover border border-white/10 hover:border-gold flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <div className="font-bold text-xs text-ink">{movie.title}</div>
                        {hasDiffOriginal && (
                          <div className="text-[10px] text-muted italic">
                            {movie.originalTitle}
                          </div>
                        )}
                      </div>
                      <span className="font-display text-xs font-extrabold uppercase text-gold">
                        GÖNDER &rarr;
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
