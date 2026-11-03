"use client";

import React, { useState, useEffect, useRef } from "react";
import { Film, X, Bot, RefreshCw } from "lucide-react";
import { audio } from "@/utils/audio";
import { ContentPoolType } from "@/core";
import { UserProfile, AVATAR_OPTIONS } from "@/types/profile";
import { useTranslation } from "@/i18n";

interface MatchmakingQueueModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onMatchFound: () => void;
  onPlayWithAiImmediately: () => void;
  userProfile: UserProfile;
  selectedMode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL";
  contentPool: ContentPoolType;
  difficulty: "EASY" | "NORMAL" | "HARD";
}

export const MatchmakingQueueModal: React.FC<MatchmakingQueueModalProps> = ({
  isOpen,
  onCancel,
  onMatchFound,
  onPlayWithAiImmediately,
  userProfile,
  selectedMode,
  contentPool,
  difficulty,
}) => {
  const { dict, locale } = useTranslation();
  const isEn = locale === "en";

  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>(
    isEn ? "The hall is dim, preparing session..." : "Salon loş, seans hazırlanıyor..."
  );
  const [showAiFallback, setShowAiFallback] = useState<boolean>(false);
  const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userAvatar =
    AVATAR_OPTIONS.find((a) => a.id === userProfile.avatarId) || AVATAR_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) {
      setSecondsElapsed(0);
      setShowAiFallback(false);
      setStatusText(
        isEn ? "The hall is dim, preparing session..." : "Salon loş, seans hazırlanıyor..."
      );
      if (matchTimeoutRef.current) {
        clearTimeout(matchTimeoutRef.current);
        matchTimeoutRef.current = null;
      }
      return;
    }

    audio.playSelect();

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;

        if (next === 1) {
          setStatusText(
            isEn ? "The hall is dim, preparing session..." : "Salon loş, seans hazırlanıyor..."
          );
        } else if (next === 2) {
          setStatusText(
            isEn
              ? "Session ready! In opposite seat: Cinephile Bot."
              : "Seans hazır! Karşı koltukta: Sinefil Botu."
          );
          matchTimeoutRef.current = setTimeout(() => {
            onMatchFound();
          }, 600);
        } else if (next >= 4) {
          setShowAiFallback(true);
        }

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (matchTimeoutRef.current) {
        clearTimeout(matchTimeoutRef.current);
        matchTimeoutRef.current = null;
      }
    };
  }, [isOpen, onMatchFound, isEn]);

  if (!isOpen) return null;

  const modeLabel =
    selectedMode === "CLASSIC"
      ? isEn ? "🎭 Classic Duel" : "🎭 Klasik Düello"
      : selectedMode === "REVERSE_CAST"
      ? isEn ? "🎭 Reverse Frame" : "🎭 Ters Kadraj"
      : selectedMode === "CINE_CONCEPT"
      ? isEn ? "🌀 Cinephile Concept" : "🌀 Sinefil Konsept"
      : isEn ? "🏆 Cinephile" : "🏆 Sinefil";
  const poolLabel =
    contentPool === "FILM"
      ? isEn ? "🎬 Movie" : "🎬 Film"
      : contentPool === "SERIES"
      ? isEn ? "📺 Series" : "📺 Dizi"
      : isEn ? "⚡ Hybrid" : "⚡ Karma";
  const diffLabel =
    difficulty === "HARD"
      ? isEn ? "🔴 Hard" : "🔴 Zor"
      : difficulty === "NORMAL"
      ? isEn ? "🟡 Normal" : "🟡 Normal"
      : isEn ? "🟢 Easy" : "🟢 Kolay";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center relative text-[#F1EEE7] overflow-hidden"
        style={{
          background: "#14171D",
          border: "1px solid rgba(217, 164, 65, 0.35)",
        }}
      >
        {/* Viewfinder Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D9A441]/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D9A441]/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#D9A441]/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#D9A441]/60 pointer-events-none" />

        {/* Üst Kapatma Butonu */}
        <button
          onClick={() => {
            audio.playSelect();
            onCancel();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#181B22] border border-white/10 text-[#A5A8B0] hover:text-[#F1EEE7] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık ve Durum */}
        <div className="flex items-center gap-1.5 mb-2 px-3 py-1 rounded-md bg-[#181B22] border border-[#D9A441]/30">
          <Film className="w-3 h-3 text-[#D9A441]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9A441] font-mono">
            {isEn ? "PREPARING SESSION" : "SEANS HAZIRLANIYOR"}
          </span>
        </div>

        <h2 className="text-xl font-bold font-serif text-[#F1EEE7] tracking-wide mb-1">
          {isEn ? "Preparing Session..." : "Seans Hazırlanıyor..."}
        </h2>

        {/* Seçilen Ayarlar Etiketleri */}
        <div className="flex items-center gap-1.5 my-2.5 flex-wrap justify-center">
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-[#181B22] border border-[#D9A441]/40 text-[#D9A441]">
            {modeLabel}
          </span>
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-[#181B22] border border-[#4FA3C7]/40 text-[#4FA3C7]">
            {poolLabel}
          </span>
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-[#181B22] border border-white/20 text-[#A5A8B0]">
            {diffLabel}
          </span>
        </div>

        {/* 35mm Dönen Film Makarası Animasyonu (Spinning Film Reel) */}
        <div className="relative my-4 w-40 h-40 flex items-center justify-center shrink-0">
          {/* Dış Perde Halka */}
          <div
            className="absolute w-36 h-36 rounded-full border border-dashed border-[#D9A441]/30 animate-spin"
            style={{ animationDuration: "14s" }}
          />
          <div
            className="absolute w-40 h-40 rounded-full border border-white/10 animate-spin"
            style={{ animationDuration: "20s", animationDirection: "reverse" }}
          />

          {/* Dönen Film Makarası */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center relative animate-spin"
            style={{
              animationDuration: "5s",
              background: "radial-gradient(circle, #252932 0%, #0F1115 80%)",
              border: "2px solid #D9A441",
            }}
          >
            {/* Film Perforasyon Delikleri */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-3.5 h-3.5 rounded-full bg-[#0F1115] border border-[#D9A441]/50"
                style={{
                  transform: `rotate(${deg}deg) translate(36px)`,
                }}
              />
            ))}
            {/* Makara Göbeği */}
            <div className="w-11 h-11 rounded-full bg-[#D9A441] flex items-center justify-center border border-white/20">
              <Film className="w-5 h-5 text-[#0F1115]" />
            </div>
          </div>
        </div>

        {/* Oyuncu Künyesi */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181B22] border border-white/10 mb-2">
          <span className="text-sm">{userAvatar.emoji}</span>
          <span className="text-[11px] font-bold text-[#F1EEE7]">{userProfile.username}</span>
          <span className="text-[9px] font-mono text-[#D9A441] font-bold">Lv.{userProfile.rankLevel || 1}</span>
        </div>

        {/* Zaman Sayacı (00:07) */}
        <div className="text-2xl font-bold font-mono text-[#D9A441] tracking-widest my-1">
          00:{secondsElapsed < 10 ? `0${secondsElapsed}` : secondsElapsed}
        </div>

        {/* Alt Dinamik Durum Metni */}
        <p className="text-xs text-[#A5A8B0] text-center font-medium px-4 mb-4 min-h-[32px] flex items-center justify-center">
          {statusText}
        </p>

        {/* AI Fallback Seçeneği */}
        {showAiFallback ? (
          <div className="w-full flex flex-col gap-2 mt-1 pt-3 border-t border-white/10 animate-in fade-in">
            <button
              onClick={() => {
                audio.playSelect();
                onPlayWithAiImmediately();
              }}
              className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 tactile-btn-amber"
            >
              <Bot className="w-4 h-4" />
              <span>{isEn ? "Start with AI" : "Yapay Zeka ile Başla"}</span>
            </button>
            <button
              onClick={() => {
                setSecondsElapsed(0);
                setShowAiFallback(false);
                setStatusText(
                  isEn ? "Scanning wider global pool..." : "Daha geniş küresel havuzda taranıyor..."
                );
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 tactile-btn-surface text-[#F1EEE7]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isEn ? "Continue Searching" : "Aramaya Devam Et"}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              audio.playSelect();
              onPlayWithAiImmediately();
            }}
            className="w-full py-2.5 px-3 rounded-xl tactile-btn-surface text-[11px] font-bold text-[#D9A441] hover:text-[#F1EEE7] flex items-center justify-center gap-1.5 mb-2"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isEn ? "Don't want to wait? Start now \u2192" : "Beklemek istemiyor musun? Hemen başla \u2192"}</span>
          </button>
        )}

        {/* İptal Butonu */}
        <button
          onClick={() => {
            audio.playSelect();
            onCancel();
          }}
          className="mt-1 text-xs font-semibold text-[#A5A8B0] hover:text-[#F1EEE7] uppercase tracking-wider h-11 px-4 rounded-lg transition-colors flex items-center justify-center min-h-[44px]"
        >
          {isEn ? "Cancel (Return to Box Office)" : "Vazgeç (Gişe'ye Dön)"}
        </button>
      </div>
    </div>
  );
};
