"use client";

import React, { useState, useEffect, useRef } from "react";
import { Film, X, Bot, RefreshCw } from "lucide-react";
import { audio } from "@/utils/audio";
import { ContentPoolType } from "@/core";
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

  const modeLabel =
    selectedMode === "CLASSIC"
      ? "🎭 Klasik Düello"
      : selectedMode === "REVERSE_CAST"
      ? "🎭 Ters Kadraj"
      : selectedMode === "CINE_CONCEPT"
      ? "🌀 Sinefil Konsept"
      : "🏆 Sinefil";
  const poolLabel = contentPool === "FILM" ? "🎬 Film" : contentPool === "SERIES" ? "📺 Dizi" : "⚡ Karma";
  const diffLabel = difficulty === "HARD" ? "🔴 Zor" : difficulty === "NORMAL" ? "🟡 Normal" : "🟢 Kolay";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center relative text-[#F1EEE7] overflow-hidden tactile-card"
        style={{
          background: "linear-gradient(180deg, #1E222B 0%, #14171D 100%)",
          borderColor: "rgba(245,166,35,0.45)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.85), 0 6px 0 #08090C, inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Viewfinder Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#F5A623]/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#F5A623]/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#F5A623]/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#F5A623]/60 pointer-events-none" />

        {/* Sinematik Arka Işık */}
        <div className="absolute -top-16 left-1/4 right-1/4 h-32 bg-[#F5A623]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Üst Kapatma Butonu */}
        <button
          onClick={() => {
            audio.playSelect();
            onCancel();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl tactile-btn-surface text-[#A5A8B0] hover:text-[#F1EEE7] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık ve Durum */}
        <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#FF334B]/10 border border-[#FF334B]/30">
          <span className="w-2 h-2 rounded-full bg-[#FF334B] animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FF334B] font-mono">
            REC ● CANLI KUYRUK
          </span>
        </div>

        <h2 className="text-xl font-black text-[#F1EEE7] font-mono tracking-wider mb-1">
          RAKİP ARANIYOR...
        </h2>

        {/* Seçilen Ayarlar Etiketleri */}
        <div className="flex items-center gap-1.5 my-2.5 flex-wrap justify-center">
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/40 text-[#F5A623]">
            {modeLabel}
          </span>
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-[#00D5E8]/15 border border-[#00D5E8]/40 text-[#00D5E8]">
            {poolLabel}
          </span>
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-[#8EBB70]/15 border border-[#8EBB70]/40 text-[#8EBB70]">
            {diffLabel}
          </span>
        </div>

        {/* 35mm Dönen Film Makarası Animasyonu (Spinning Film Reel) */}
        <div className="relative my-5 w-44 h-44 flex items-center justify-center shrink-0">
          {/* Dış Perde Halka Glow */}
          <div
            className="absolute w-36 h-36 rounded-full border-2 border-dashed border-[#F5A623]/35 animate-spin"
            style={{ animationDuration: "14s" }}
          />
          <div
            className="absolute w-44 h-44 rounded-full border border-[#00D5E8]/25 animate-spin"
            style={{ animationDuration: "20s", animationDirection: "reverse" }}
          />

          {/* Dönen Film Makarası */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center relative shadow-2xl animate-spin"
            style={{
              animationDuration: "5s",
              background: "radial-gradient(circle, #252932 0%, #0F1115 80%)",
              border: "2px solid #F5A623",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            {/* Film Perforasyon Delikleri */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-3.5 h-3.5 rounded-full bg-[#0F1115] border border-[#F5A623]/50"
                style={{
                  transform: `rotate(${deg}deg) translate(36px)`,
                }}
              />
            ))}
            {/* Makara Göbeği */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#D9820B] to-[#F5A623] flex items-center justify-center shadow-inner border border-amber-200/40">
              <Film className="w-5 h-5 text-[#0F1115]" />
            </div>
          </div>
        </div>

        {/* Oyuncu Künyesi */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F1115]/90 border border-white/10 mb-2">
          <span className="text-sm">{userAvatar.emoji}</span>
          <span className="text-[11px] font-black text-[#F1EEE7]">{userProfile.username}</span>
          <span className="text-[9px] font-mono text-[#F5A623] font-bold">Lv.{userProfile.rankLevel || 1}</span>
        </div>

        {/* Zaman Sayacı (00:07) */}
        <div className="text-2xl font-black font-mono text-[#F5A623] tracking-widest my-1">
          00:{secondsElapsed < 10 ? `0${secondsElapsed}` : secondsElapsed}
        </div>

        {/* Alt Dinamik Durum Metni */}
        <p className="text-xs text-[#A5A8B0] text-center font-bold px-4 mb-4 min-h-[32px] flex items-center justify-center">
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
              className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 tactile-btn-amber"
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
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 tactile-btn-surface text-[#F1EEE7]"
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
            className="w-full py-2.5 px-3 rounded-xl tactile-btn-surface text-[11px] font-extrabold text-[#F5A623] hover:text-[#F1EEE7] flex items-center justify-center gap-1.5 mb-2"
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
          className="mt-1 text-xs font-extrabold text-[#A5A8B0] hover:text-[#F1EEE7] uppercase tracking-wider py-1.5 px-4 rounded-lg transition-colors"
        >
          Vazgeç (Lobiye Dön)
        </button>
      </div>
    </div>
  );
};
