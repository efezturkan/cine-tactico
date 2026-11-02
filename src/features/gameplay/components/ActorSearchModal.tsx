"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Criterion, normalizeCinemaString } from "@/core";
import { X, User, Sparkles, Send, ShieldAlert, Film } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { assetResolver } from "@/utils/assetResolver";
import { LocalFace } from "./LocalFace";
import { ACTORS_DATABASE } from "@/content/adapters/gameCatalog";

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
  const [vpStyle, setVpStyle] = useState<{ height?: number; top?: number }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      const matchAlias = actor.normalizedAliases.some((alias) =>
        alias.includes(q)
      );
      return matchPrimary || matchAlias;
    }).slice(0, 8);
  }, [query]);

  const rowCritAsset = useMemo(
    () => assetResolver.resolveForCriterion(rowCrit),
    [rowCrit]
  );
  const colCritAsset = useMemo(
    () => assetResolver.resolveForCriterion(colCrit),
    [colCrit]
  );

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
        {/* Header & Two-Movie Intersection (Pinned Shrink-0) */}
        <div className="flex items-start justify-between pb-2.5 border-b border-white/10 shrink-0">
          <div>
            <span className="text-[9px] font-mono uppercase font-bold tracking-[0.2em] text-[#4FA3C7] inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#4FA3C7]" />
              <span>TERS KADRAJ &middot; ORTAK OYUNCU</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg bg-[#0B0D12] text-[#E8E6E1] border border-[#D9A441]/40">
                {rowCritAsset.isAvailable && rowCritAsset.src ? (
                  <img
                    src={rowCritAsset.src}
                    alt=""
                    className="w-4 h-5 object-cover rounded-sm border border-white/10 shrink-0"
                  />
                ) : (
                  <Film className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
                )}
                <span>{rowCrit.label}</span>
              </div>
              <span className="font-mono text-[#4FA3C7] font-bold text-xs">
                ×
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg bg-[#0B0D12] text-[#E8E6E1] border border-[#4FA3C7]/40">
                {colCritAsset.isAvailable && colCritAsset.src ? (
                  <img
                    src={colCritAsset.src}
                    alt=""
                    className="w-4 h-5 object-cover rounded-sm border border-white/10 shrink-0"
                  />
                ) : (
                  <Film className="w-3.5 h-3.5 text-[#4FA3C7] shrink-0" />
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
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#181B22] border border-white/10 text-[#8A8F9A] transition hover:text-[#E8E6E1] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="wrong-recoil mt-2.5 p-2.5 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/50 text-[#E8E6E1] text-xs font-semibold flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-[#E5484D] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Search Input & Suggestions */}
        <form
          onSubmit={handleSubmitCustom}
          className="mt-2.5 flex-1 min-h-0 flex flex-col gap-2.5"
        >
          <div className="relative shrink-0">
            <User className="w-4 h-4 text-[#4FA3C7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ortak oyuncunun adını yaz..."
              enterKeyHint="search"
              className="w-full bg-[#0B0D12] border border-white/10 focus:border-[#4FA3C7] rounded-2xl pl-10 pr-9 py-2.5 sm:py-3 text-base font-semibold text-[#E8E6E1] placeholder:text-[#8A8F9A]/50 outline-none transition-colors"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F9A] hover:text-[#E8E6E1]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {suggestedActors.length > 0 && (
            <div className="flex-1 min-h-0 flex flex-col gap-1.5 p-2 rounded-2xl bg-[#0B0D12] border border-white/10 overflow-y-auto overscroll-contain custom-scrollbar">
              <span className="text-[11px] text-[#8A8F9A] px-1 font-semibold shrink-0">
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
                    className="flex items-center justify-between p-2 rounded-xl bg-[#181B22] hover:bg-[#202530] border border-white/10 hover:border-[#4FA3C7] transition-all text-left group shrink-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LocalFace
                        src={asset.isAvailable ? asset.src : undefined}
                        className="w-7 h-7 rounded-full overflow-hidden border border-[#00D5E8]/50 shrink-0"
                        fallback={
                          <div className="w-7 h-7 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center text-[#00D5E8] text-[10px] font-mono font-bold shrink-0">
                            {asset.fallbackText}
                          </div>
                        }
                      />
                      <span className="text-xs font-bold text-[#F1EEE7] group-hover:text-[#00D5E8] truncate">
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
            className="tactile-btn-cyan w-full py-3 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 text-[#0F1115]"
          >
            <span>ONAYLA VE MÜHÜRLE</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
