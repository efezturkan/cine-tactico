"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Criterion } from "@/types/game";
import { getAllUniqueActors } from "@/engine/validator";
import { Search, X, User, Sparkles, Send } from "lucide-react";
import { audio } from "@/utils/audio";

interface ActorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowCrit: Criterion;
  colCrit: Criterion;
  onSelectActor: (actorName: string) => void;
  errorMessage?: string | null;
}

export const ActorSearchModal: React.FC<ActorSearchModalProps> = ({
  isOpen,
  onClose,
  rowCrit,
  colCrit,
  onSelectActor,
  errorMessage,
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

  const uniqueActors = useMemo(() => {
    return getAllUniqueActors();
  }, []);

  const filteredActors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Sık aranan popüler aktörlerden bir ön izleme
      return uniqueActors.slice(0, 10);
    }
    return uniqueActors.filter(actor => actor.toLowerCase().includes(q)).slice(0, 15);
  }, [query, uniqueActors]);

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      audio.playSelect();
      onSelectActor(trimmed);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-cinema-card border border-cinema-border rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[82vh]">
        {/* Başlık ve İki Film Kesişimi */}
        <div className="flex items-start justify-between pb-3 border-b border-cinema-border">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Ters Kadraj: Ortak Oyuncuyu Bul
            </span>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-amber-300 border border-amber-500/30">
                🎬 {rowCrit.label}
              </span>
              <span className="text-zinc-500 font-bold text-xs">×</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-amber-300 border border-amber-500/30">
                🎬 {colCrit.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playSelect();
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hata Bildirimi */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manuel Klavye Arama Formu */}
        <form onSubmit={handleSubmitCustom} className="mt-3 relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Oyuncu adını yaz (Örn: Cillian Murphy, Brad Pitt)..."
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 font-medium outline-none transition-all"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
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
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>ONAYLA</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Hızlı Öneri Listesi */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[220px]">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 mb-1">
            {query.trim() ? "Eşleşen Oyuncular" : "Hızlı Seçim / Hafıza İpucu"}
          </div>
          {filteredActors.map((actor, idx) => (
            <button
              key={idx}
              onClick={() => {
                audio.playSelect();
                onSelectActor(actor);
              }}
              className="w-full p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                  {actor}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 group-hover:text-cyan-400 font-bold">
                Seç →
              </span>
            </button>
          ))}
          {filteredActors.length === 0 && (
            <div className="py-8 text-center text-zinc-500 text-xs">
              Eşleşen kayıtlı aktör bulunamadı. Üstteki &ldquo;ONAYLA&rdquo; butonu ile doğrudan gönderebilirsiniz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};