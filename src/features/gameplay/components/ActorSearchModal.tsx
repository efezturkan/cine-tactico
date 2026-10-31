"use client";

import React, { useState, useEffect, useRef } from "react";
import { Criterion } from "@/core";
import { X, User, Sparkles, Send, ShieldAlert, Film } from "lucide-react";
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
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[82vh]">
        {/* Başlık ve İki Film Kesişimi */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/50 flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              TERS KADRAJ // CO-STAR AJANI
            </span>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded bg-zinc-900 text-zinc-100 border border-zinc-700/80">
                <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{rowCrit.label}</span>
              </div>
              <span className="text-zinc-600 font-bold text-xs font-mono">×</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded bg-zinc-900 text-zinc-100 border border-zinc-700/80">
                <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{colCrit.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playSelect();
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hata Bildirimi */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manuel Klavye Arama Formu */}
        <form onSubmit={handleSubmitCustom} className="mt-4 flex flex-col gap-3">
          <div className="relative">
            <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ortak aktörün adını yazın..."
              className="w-full bg-zinc-900/90 border border-zinc-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-9 py-3 text-sm text-zinc-100 placeholder-zinc-500 font-mono outline-none transition-all"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!query.trim()}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>ONAYLA VE GÖNDER</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Bilgilendirme ve Anti-Cheat Kuralı */}
        <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 text-zinc-400 text-xs space-y-2">
          <div className="flex items-center gap-2 text-zinc-300 font-mono text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>MANUEL HATIRLAMA SİSTEMİ</span>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-400">
            Ters Kadraj modunda hazır seçenek sunulmaz. İki filmde birden rol alan aktörün adını klavyeyle yazmanız gerekir.
          </p>
          <div className="pt-2 border-t border-zinc-800/60 flex flex-col gap-1 text-[10px] text-zinc-500 font-mono">
            <span>✓ Tam isim ve yaygın takma adlar (Örn: Leo DiCaprio) kabul edilir.</span>
            <span>✓ 6+ harfli isimlerde 1 harf yazım hatası tolere edilir.</span>
            <span>✕ Yanlış cevapta sıra rakibe geçer. İki yanlışta hücre sahipsiz kilitlenir.</span>
          </div>
        </div>
      </div>
    </div>
  );
};