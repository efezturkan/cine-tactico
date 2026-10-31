"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { PlayerSymbol, Movie } from "@/core";
import { MOVIES_DATABASE } from "@/data/movies";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { Sparkles, Trophy, Film, Send, Clock, X, AlertTriangle } from "lucide-react";

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
        setSeconds(prev => {
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
    return MOVIES_DATABASE.filter(m => m.title.toLowerCase().includes(q) || m.originalTitle?.toLowerCase().includes(q)).slice(0, 5);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* 35mm Sinema Perdesi Arka Plan Efekti */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-950/40 via-zinc-950 to-black border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col items-center text-center overflow-hidden">
        {/* Üst Sinematik Şerit */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-amber-500/30">
          <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-[0.25em]">
            35MM FILM CELL · SUDDEN DEATH
          </span>
          <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-widest">
            FOTO-FİNİŞ PROTOKOLÜ
          </span>
        </div>

        {/* Dönen Altın Makara Simgesi */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-spin" style={{ animationDuration: "6s" }}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-amber-300">
              <Film className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Başlık & Kural */}
        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-wider drop-shadow">
          ALTIN MAKARA
        </h2>
        <p className="text-xs text-zinc-300 font-medium mt-1 max-w-xs">
          9 kare doldu, 3&apos;lü hat çıkmadı! İlk doğru filmi yazan anında kazanır.
        </p>

        {/* 12 Saniye Buzzer Geri Sayımı */}
        <div className="my-3 flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/40">
          <Clock className={`w-5 h-5 ${seconds <= 4 ? "text-rose-500 animate-ping" : "text-amber-400 animate-pulse"}`} />
          <span className={`text-2xl font-black font-mono tracking-tight ${seconds <= 4 ? "text-rose-400" : "text-amber-300"}`}>
            00:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>

        {/* Soru Görevi */}
        <div className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left my-2">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
            Altın Kriter:
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {question}
          </div>
        </div>

        {/* Foto-finiş İstatistik Çubuğu */}
        <div className="w-full grid grid-cols-2 gap-2 my-2 p-2 rounded-xl bg-black/60 border border-zinc-800 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-cyan-400">OYUNCU X</span>
            <span className="text-base font-black text-white font-mono">{scoreRarityX} Nadirlik</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-rose-400">OYUNCU O</span>
            <span className="text-base font-black text-white font-mono">{scoreRarityO} Nadirlik</span>
          </div>
        </div>

        {/* Hata Bildirimi */}
        {errorMessage && (
          <div className="text-rose-400 text-xs font-bold my-1 flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Foto-finiş Süre Doldu Mesajı */}
        {isPhotoFinish ? (
          <div className="my-3 p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-sm font-black animate-bounce flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            <span>Süre Doldu! Foto-finiş kararı hesaplanıyor...</span>
          </div>
        ) : (
          /* Arama / Film Yazma Alanı */
          <div className="w-full mt-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Hemen bir film adı yaz..."
                className="w-full bg-zinc-900 border border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 font-medium outline-none shadow-inner"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Otomatik Eşleşmeler */}
            {filteredMovies.length > 0 && (
              <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                {filteredMovies.map(movie => {
                  const hasDiffOriginal =
                    movie.originalTitle &&
                    movie.originalTitle.trim().toLowerCase() !== movie.title.trim().toLowerCase();

                  return (
                    <button
                      key={movie.id}
                      onClick={() => handleSelectMovie(movie)}
                      className="w-full p-2.5 rounded-xl bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-400 flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <div className="font-black text-xs text-white">{movie.title}</div>
                        {hasDiffOriginal && (
                          <div className="text-[10px] text-zinc-400 italic">
                            {movie.originalTitle}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-amber-400">GÖNDER &rarr;</span>
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