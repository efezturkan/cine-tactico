"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Criterion } from "@/core";
import { X, User, Sparkles, Send, ShieldAlert, Film } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { assetResolver } from "@/utils/assetResolver";
import { LocalFace } from "./LocalFace";
import { ACTORS_DATABASE } from "@/content/adapters/gameCatalog";
import { normalizeCinemaString } from "@/core";

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
      }, 45);
    }
  }, [isOpen]);

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      audio.playSelect();
      haptic.light();
      onSelectActor(trimmed);
    }
  };

  const suggestedActors = useMemo(() => {
    const q = normalizeCinemaString(query.trim());
    if (q.length < 2) return [];
    return ACTORS_DATABASE.filter((actor) => {
      const matchPrimary = actor.normalizedName.includes(q);
      const matchAlias = actor.normalizedAliases.some((alias) => alias.includes(q));
      return matchPrimary || matchAlias;
    }).slice(0, 5);
  }, [query]);

  const rowCritAsset = useMemo(() => assetResolver.resolveForCriterion(rowCrit), [rowCrit]);
  const colCritAsset = useMemo(() => assetResolver.resolveForCriterion(colCrit), [colCrit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-[460px] animate-card-in bg-panel border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[88dvh] sm:max-h-[82vh] text-ink">
        {/* Header & Two-Movie Intersection */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-team-blue inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-team-blue" />
              <span>ORTAK OYUNCU HEDEFİ</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl bg-control text-ink border border-gold/40">
                {rowCritAsset.isAvailable && rowCritAsset.src ? (
                  <img
                    src={rowCritAsset.src}
                    alt=""
                    className="w-4 h-5 object-cover rounded-sm border border-white/10 shrink-0"
                  />
                ) : (
                  <Film className="w-3.5 h-3.5 text-gold shrink-0" />
                )}
                <span>{rowCrit.label}</span>
              </div>
              <span className="font-mono text-team-blue font-bold text-xs">×</span>
              <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl bg-control text-ink border border-team-blue/40">
                {colCritAsset.isAvailable && colCritAsset.src ? (
                  <img
                    src={colCritAsset.src}
                    alt=""
                    className="w-4 h-5 object-cover rounded-sm border border-white/10 shrink-0"
                  />
                ) : (
                  <Film className="w-3.5 h-3.5 text-team-blue shrink-0" />
                )}
                <span>{colCrit.label}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              onClose();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="wrong-recoil mt-3 p-2.5 rounded-xl bg-missed/15 border border-missed/50 text-ink text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-missed shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Search Input & Suggestions */}
        <form onSubmit={handleSubmitCustom} className="mt-3.5 flex flex-col gap-3">
          <div className="relative">
            <User className="w-4 h-4 text-team-blue absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ortak oyuncunun adını yaz..."
              className="w-full bg-night border border-white/15 focus:border-team-blue rounded-2xl pl-10 pr-9 py-3 text-base font-semibold text-ink placeholder:text-muted/50 outline-none transition-colors"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
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

          {suggestedActors.length > 0 && (
            <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-night border border-white/10 max-h-44 overflow-y-auto custom-scrollbar">
              <span className="text-[11px] text-muted px-1 font-semibold">
                Eşleşen Oyuncular ({suggestedActors.length}):
              </span>
              {suggestedActors.map((actor) => {
                const asset = assetResolver.resolveForActor(actor.id);
                return (
                  <button
                    key={actor.id}
                    type="button"
                    onClick={() => {
                      audio.playSelect();
                      haptic.light();
                      onSelectActor(actor.primaryName);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-control hover:bg-control-hover border border-white/10 hover:border-team-blue transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LocalFace
                        src={asset.isAvailable ? asset.src : undefined}
                        className="w-7 h-7 rounded-full overflow-hidden border border-team-blue/50 shrink-0"
                        fallback={
                          <div className="w-7 h-7 rounded-full bg-night border border-white/10 flex items-center justify-center text-team-blue text-[10px] font-mono font-bold shrink-0">
                            {asset.fallbackText}
                          </div>
                        }
                      />
                      <span className="text-xs font-bold text-ink group-hover:text-team-blue truncate">
                        {actor.primaryName}
                      </span>
                    </div>
                    <span className="tactile-btn-cyan text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 text-[#0F1115]">
                      Seç &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={!query.trim()}
            className="tactile-btn-cyan w-full h-12 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 text-[#0F1115]"
          >
            <span>ONAYLA VE MÜHÜRLE</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
