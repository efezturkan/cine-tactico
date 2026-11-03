"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Criterion, normalizeCinemaString } from "@/core";
import { X, User, ShieldAlert } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { ACTORS_DATABASE } from "@/content/adapters/gameCatalog";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n";

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
  const { dict, locale, tCriterion } = useTranslation();
  const isEn = locale === "en";
  const [query, setQuery] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [vpStyle, setVpStyle] = useState<{ height?: number; top?: number }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setLocalError(null);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      // 1.3 & 6E.2: Boş girişte "Bir isim yaz." uyarısı
      setLocalError(isEn ? "Type a name." : "Bir isim yaz.");
      return;
    }
    setLocalError(null);
    audio.playSelect();
    haptic.light();
    onSelectActor(trimmed);
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

  const activeError = errorMessage || localError;

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm select-none"
      style={{
        top: vpStyle.top !== undefined ? `${vpStyle.top}px` : 0,
        height: vpStyle.height !== undefined ? `${vpStyle.height}px` : "100dvh",
      }}
    >
      {/* 2.4 Alt Sheet (Bottom Sheet) */}
      <div
        className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] p-4 sm:p-5 flex flex-col max-h-[92dvh] shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
        style={{
          maxHeight:
            vpStyle.height !== undefined
              ? `${Math.max(260, vpStyle.height - 20)}px`
              : "92dvh",
        }}
      >
        {/* Tutamaç Çizgisi */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 shrink-0" />

        {/* 6E.1 Başlık & İki Film Kesişimi (Ters Kadraj Soluk Teal #5FB3A8, Işıltı Yok) */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#5FB3A8] block mb-1">
              {isEn ? "REVERSE FRAME · SHARED ACTOR" : "TERS KADRAJ · ORTAK OYUNCU"}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#181B22] text-[#E8E6E1] border border-white/10">
                {tCriterion(rowCrit.label)}
              </span>
              <span className="text-[#8A8F9A] font-bold text-xs">×</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#181B22] text-[#E8E6E1] border border-white/10">
                {tCriterion(colCrit.label)}
              </span>
            </div>
          </div>

          <Button
            variant="icon"
            onClick={onClose}
            className="shrink-0"
            title={dict.common.close}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Hata Bildirimi */}
        {activeError && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/50 text-[#E8E6E1] text-xs font-semibold flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-[#E5484D] shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Arama Kutusu ve Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex-1 min-h-0 flex flex-col gap-3"
        >
          <div className="relative shrink-0">
            <User className="w-4 h-4 text-[#5FB3A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder={isEn ? "Shared actor name" : "Ortak oyuncunun adı"}
              enterKeyHint="done"
              className="w-full bg-[#0B0D12] border border-white/10 focus:border-[#5FB3A8] rounded-xl pl-10 pr-9 py-2.5 sm:py-3 text-base font-medium text-[#E8E6E1] placeholder:text-[#8A8F9A]/50 outline-none transition-colors"
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

          {/* Oyuncu Önerileri */}
          {query.trim().length >= 2 && suggestedActors.length === 0 ? (
            <div className="flex-1 min-h-[90px] flex flex-col items-center justify-center p-4 rounded-xl bg-[#0B0D12] border border-white/10 text-center text-[#8A8F9A]">
              <p className="font-serif text-sm font-bold text-[#E8E6E1] mb-0.5">
                {isEn ? "This name is not in the archive." : "Bu isim arşivde yok."}
              </p>
              <p className="text-xs text-[#8A8F9A]">
                {isEn ? "Check spelling." : "Yazımı kontrol et."}
              </p>
            </div>
          ) : suggestedActors.length > 0 ? (
            <div className="flex-1 min-h-0 flex flex-col gap-1.5 p-2 rounded-xl bg-[#0B0D12] border border-white/10 overflow-y-auto overscroll-contain custom-scrollbar">
              {suggestedActors.map((actor) => (
                <button
                  key={actor.id}
                  type="button"
                  onClick={() => {
                    audio.playSelect();
                    haptic.light();
                    onSelectActor(actor.primaryName);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#181B22] hover:bg-[#1E222B] border border-white/10 hover:border-[#5FB3A8]/50 transition-all text-left shrink-0"
                >
                  <span className="text-xs font-bold text-[#E8E6E1]">
                    {actor.primaryName}
                  </span>
                  <span className="text-[#5FB3A8] font-bold text-sm">
                    &rarr;
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* 6E.2 Ana Buton: ONAYLA (Altın #D9A441) */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="mt-auto shrink-0"
          >
            {isEn ? "CONFIRM" : "ONAYLA"}
          </Button>
        </form>
      </div>
    </div>
  );
};
