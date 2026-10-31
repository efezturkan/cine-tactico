"use client";

import React, { useState, useEffect, useRef } from "react";
import { Film, Swords, X, Bot, RefreshCw, Zap } from "lucide-react";
import { audio } from "@/utils/audio";
import { ContentPoolType, BotDifficulty } from "@/core";
import { UserProfile, AVATAR_OPTIONS } from "@/types/profile";

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
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("Bölgesel sinema lobisi taranıyor...");
  const [showAiFallback, setShowAiFallback] = useState<boolean>(false);
  const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userAvatar =
    AVATAR_OPTIONS.find((a) => a.id === userProfile.avatarId) || AVATAR_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) {
      setSecondsElapsed(0);
      setShowAiFallback(false);
      setStatusText("Bölgesel sinema lobisi taranıyor...");
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
          setStatusText("Benzer zevkteki sinefiller taranıyor...");
        } else if (next === 2) {
          setStatusText("Rakip bulundu! 35mm Perde hazırlanıyor...");
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
  }, [isOpen, onMatchFound]);

  if (!isOpen) return null;

  const modeLabel = selectedMode === "CLASSIC" ? "🎭 Klasik" : "🏆 Sinefil";
  const poolLabel = contentPool === "FILM" ? "🎬 Film" : contentPool === "SERIES" ? "📺 Dizi" : "⚡ Karma";
  const diffLabel = difficulty === "HARD" ? "🔴 Zor" : difficulty === "NORMAL" ? "🟡 Normal" : "🟢 Kolay";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center relative text-white overflow-hidden border"
        style={{
          background: "linear-gradient(135deg, rgba(14,16,24,0.98), rgba(10,11,16,0.99))",
          borderColor: "rgba(217,119,6,0.35)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(139,21,27,0.15)",
        }}
      >
        {/* Sinematik Arka Işık */}
        <div className="absolute -top-16 left-1/4 right-1/4 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Üst Kapatma Butonu */}
        <button
          onClick={() => {
            audio.playSelect();
            onCancel();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık ve Durum */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 font-mono">
            REC ● CANLI KUYRUK
          </span>
        </div>

        <h2 className="text-xl font-black text-white font-mono tracking-wider mb-1">
          RAKİP ARANIYOR...
        </h2>

        {/* Seçilen Ayarlar Etiketleri */}
        <div className="flex items-center gap-1.5 my-3 flex-wrap justify-center">
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
            {modeLabel}
          </span>
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-sky-400/10 border border-sky-400/30 text-sky-300">
            {poolLabel}
          </span>
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300">
            {diffLabel}
          </span>
        </div>

        {/* 35mm Dönen Film Makarası Animasyonu (Spinning Film Reel) */}
        <div className="relative my-6 w-44 h-44 flex items-center justify-center shrink-0">
          {/* Dış Perde Halka Glow */}
          <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: "14s" }} />
          <div className="absolute w-44 h-44 rounded-full border border-red-500/20 animate-spin" style={{ animationDuration: "20s", animationDirection: "reverse" }} />

          {/* Dönen Film Makarası */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center relative shadow-2xl animate-spin"
            style={{
              animationDuration: "5s",
              background: "radial-gradient(circle, #1a1c24 0%, #07080b 80%)",
              border: "3px solid #d97706",
              boxShadow: "0 0 25px rgba(217,119,6,0.3)",
            }}
          >
            {/* Film Perforasyon Delikleri */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-3 h-3 rounded-full bg-[#0a0b10] border border-amber-400/40"
                style={{
                  transform: `rotate(${deg}deg) translate(36px)`,
                }}
              />
            ))}
            {/* Makara Göbeği */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-inner">
              <Film className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>

        {/* Zaman Sayacı (00:07) */}
        <div className="text-2xl font-black font-mono text-amber-400 tracking-widest my-1">
          00:{secondsElapsed < 10 ? `0${secondsElapsed}` : secondsElapsed}
        </div>

        {/* Alt Dinamik Durum Metni */}
        <p className="text-xs text-zinc-400 text-center font-bold px-4 mb-4 min-h-[32px] flex items-center justify-center">
          {statusText}
        </p>

        {/* 12 saniye geçtiyse veya hemen oynamak isterse: AI Fallback Seçeneği */}
        {showAiFallback ? (
          <div className="w-full flex flex-col gap-2 mt-2 pt-3 border-t border-zinc-800 animate-in fade-in">
            <button
              onClick={() => {
                audio.playSelect();
                onPlayWithAiImmediately();
              }}
              className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>AI İLE HEMEN OYNA (BEKLEMEDEN)</span>
            </button>
            <button
              onClick={() => {
                setSecondsElapsed(0);
                setShowAiFallback(false);
                setStatusText("Daha geniş küresel havuzda taranıyor...");
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-zinc-900 text-zinc-300 border border-zinc-700 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Daha Geniş Havuzda Aramaya Devam Et</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              audio.playSelect();
              onPlayWithAiImmediately();
            }}
            className="text-[11px] font-bold text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1 mt-1 mb-2"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Beklemek istemiyor musun? AI ile hemen başla &rarr;</span>
          </button>
        )}

        {/* İptal Butonu */}
        <button
          onClick={() => {
            audio.playSelect();
            onCancel();
          }}
          className="mt-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider py-1.5 px-4 rounded-lg transition-colors"
        >
          Vazgeç (Lobiye Dön)
        </button>
      </div>
    </div>
  );
};
