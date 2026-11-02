"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Trophy,
  Gift,
  Play,
  Film,
  Flame,
  Clock,
  Sparkles,
  Home,
  Swords,
  Clapperboard,
  Dna,
  Bell,
  HelpCircle,
} from "lucide-react";
import {
  UserProfile,
  AVATAR_OPTIONS,
  AMBIENCE_THEMES,
  DEFAULT_AMBIENCE,
  CORNER_ACCENT_COLORS,
} from "@/types/profile";
import { ContentPoolType } from "@/core";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { QuickMatchSetupModal } from "@/features/multiplayer";

interface HomeScreenProps {
  profile: UserProfile;
  onStartGame: (modeName: string, difficulty: "EASY" | "NORMAL" | "HARD", contentPool?: ContentPoolType) => void;
  onDirectStartMode?: (mode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL") => void;
  onOpenProfileModal: () => void;
  onOpenCustomLobby: () => void;
  onOpenDaily: () => void;
  onOpenQuests: () => void;
  onOpenDna: () => void;
  onOpenShop?: () => void;
  onOpenPro?: () => void;
  onOpenGameModesHub?: () => void;
  onOpenGameSelect?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenNotifications?: () => void;
  notifUnreadCount?: number;
  onOpenLiveAmbience?: () => void;
  onOpenHelp?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
}

// Sprocket holes — left/right continuous 35mm film edge perforations with authentic Kodak edge code markings
const SprocketStrip = () => (
  <div className="flex flex-col items-center gap-[6px] py-1.5 h-full overflow-hidden select-none pointer-events-none">
    {Array.from({ length: 65 }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          style={{
            width: 7.5,
            height: 5.5,
            background: "#040507",
            borderRadius: 2,
            border: "1px solid #2B303C",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 0.5px 0 rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        />
        {/* Subtle vintage Kodak edge markings every 7 sprockets */}
        {i % 7 === 3 && (
          <span
            className="text-[5.5px] font-mono font-black text-[#F5A623]/75 tracking-tighter uppercase -rotate-90 py-1 select-none shrink-0"
            style={{ transformOrigin: "center center" }}
          >
            KODAK
          </span>
        )}
        {i % 7 === 6 && (
          <span className="text-[5px] font-mono font-bold text-[#F5A623]/50 tracking-tighter select-none shrink-0">
            ▲ {Math.floor(i / 7) + 12}
          </span>
        )}
      </React.Fragment>
    ))}
  </div>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onStartGame,
  onDirectStartMode,
  onOpenProfileModal,
  onOpenCustomLobby,
  onOpenDaily,
  onOpenQuests,
  onOpenDna,
  onOpenShop,
  onOpenGameModesHub,
  onOpenGameSelect,
  onOpenLeaderboard,
  onOpenLiveAmbience,
  onOpenNotifications,
  notifUnreadCount,
  onOpenHelp,
}) => {
  const [showQuickSetup, setShowQuickSetup] = useState<boolean>(false);
  const [tickerIndex, setTickerIndex] = useState<number>(0);

  const TICKER_MESSAGES = [
    { tag: "DÜELLO", text: "@kaan, 12 saniyede çapraz 3'lü hat kurarak maçı çaldı!" },
    { tag: "KÜLT HAMLE", text: "@sinefil_deniz, Nolan × DiCaprio karesinde 'Inception' oynadı (%4.2 Nadir)!" },
    { tag: "REKOR", text: "@merve, Tarantino karesinde 'Pulp Fiction' bilerek 3'lü hattı kapattı!" },
    { tag: "SİNEFİL LİGİ", text: "@tarkovsky_fan, 5 maçlık seriyle Grandmaster Ligi'ne yükseldi!" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [TICKER_MESSAGES.length]);

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

  const ambience = { ...DEFAULT_AMBIENCE, ...(profile?.ambience || {}) };
  const activeTheme = (ambience.theme && AMBIENCE_THEMES[ambience.theme]) || AMBIENCE_THEMES.velvet_red;

  const effectiveCornerColor =
    ambience.cornerAccent && ambience.cornerAccent !== "AUTO" && CORNER_ACCENT_COLORS[ambience.cornerAccent]
      ? CORNER_ACCENT_COLORS[ambience.cornerAccent].color
      : activeTheme?.secondaryAccent || "#F5A623";

  const safeCornerHex =
    effectiveCornerColor && effectiveCornerColor.startsWith("#")
      ? effectiveCornerColor
      : "#F5A623";

  const effectiveHudBorder =
    ambience.cornerAccent && ambience.cornerAccent !== "AUTO" && CORNER_ACCENT_COLORS[ambience.cornerAccent]
      ? CORNER_ACCENT_COLORS[ambience.cornerAccent].border
      : "rgba(245, 166, 35, 0.35)";

  const safeDimness = typeof ambience.dimness === "number" && !isNaN(ambience.dimness) ? ambience.dimness : 85;
  const safeGlow = typeof ambience.glowIntensity === "number" && !isNaN(ambience.glowIntensity) ? ambience.glowIntensity : 65;

  // Placement progress: show actual matches played (or 5/10 default visual when unranked with 1 loss like screenshot)
  const placementPlayed = profile.totalMatches > 0 ? Math.min(profile.totalMatches, 10) : 5;
  const placementRemaining = Math.max(0, 10 - placementPlayed);

  return (
    <div
      className="w-full max-w-full sm:max-w-[430px] mx-auto min-h-[100dvh] text-[#F1EEE7] flex flex-col justify-between relative select-none antialiased overflow-x-hidden transition-colors duration-500 sm:my-4 sm:min-h-[880px] sm:rounded-[36px] sm:border-2 sm:border-[#252932] sm:shadow-[0_24px_80px_rgba(0,0,0,0.92)]"
      style={{
        backgroundColor: activeTheme?.bgColor || "#0F1115",
        filter: `brightness(${Math.min(1.1, Math.max(0.7, safeDimness / 85))})`,
      }}
    >
      {/* ── Top Dynamic Projector Beam ─── */}
      <div
        className="absolute top-0 left-1/6 right-1/6 h-48 pointer-events-none z-0 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at top, ${activeTheme?.glowRgba || "rgba(245, 166, 35, 0.35)"}, transparent 75%)`,
          opacity: safeGlow / 100,
        }}
      />

      {/* ── Sprocket borders (35mm Kodak Film Perforasyon Delikleri) ─── */}
      <div
        className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{
          width: 14,
          background: "linear-gradient(90deg, #06080B 0%, #0C0F15 100%)",
          borderRight: "1px solid #1C2028",
          boxShadow: "inset -1px 0 3px rgba(0,0,0,0.7)",
        }}
      >
        <SprocketStrip />
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{
          width: 14,
          background: "linear-gradient(270deg, #06080B 0%, #0C0F15 100%)",
          borderLeft: "1px solid #1C2028",
          boxShadow: "inset 1px 0 3px rgba(0,0,0,0.7)",
        }}
      >
        <SprocketStrip />
      </div>

      {/* ── 35mm Analog Film Greni Katmanı (Canlı Salon Işık Masası Ayarı) ─── */}
      {ambience.grain && ambience.grain !== "OFF" && (
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-300"
          style={{
            opacity: ambience.grain === "VINTAGE" ? 0.16 : 0.08,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* ── Subtle Cinema Viewfinder Watermark ─── */}
      {ambience.showWatermark && (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] transition-opacity duration-300">
          <svg width="320" height="320" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="170" cy="170" r="160" stroke={activeTheme.accentColor} strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="170" cy="170" r="110" stroke={activeTheme.accentColor} strokeWidth="1" />
            <line x1="170" y1="20" x2="170" y2="320" stroke={activeTheme.accentColor} strokeWidth="1" strokeDasharray="4 8" />
            <line x1="20" y1="170" x2="320" y2="170" stroke={activeTheme.accentColor} strokeWidth="1" strokeDasharray="4 8" />
            <rect x="55" y="110" width="230" height="120" rx="4" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 5" />
            <circle cx="170" cy="170" r="3" fill={activeTheme.accentColor} />
          </svg>
        </div>
      )}

      {/* ── Top Ambient Light Line ─── */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 pointer-events-none z-10 transition-colors duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${effectiveCornerColor} 30%, ${effectiveCornerColor} 70%, transparent)`,
        }}
      />

      {/* ── ANA İÇERİK YIĞINI ─── */}
      <div className="px-3 sm:px-4 relative z-10 flex flex-col gap-2.5 pt-2.5 pb-20 w-full min-w-0 max-w-full overflow-hidden">
        {/* ── 1. ÜST STATUS BAR: OYUNCU KİMLİĞİ & KAYNAKLAR ─── */}
        <header className="flex items-center justify-between gap-1 py-0.5">
          {/* SOL: OYUNCU KİMLİĞİ (AVATAR + İSİM + LEVEL) */}
          <button
            onClick={() => {
              audio.playSelect();
              haptic.light();
              onOpenProfileModal();
            }}
            className="flex items-center gap-1.5 p-0.5 rounded-xl hover:bg-white/5 active:translate-y-[1px] transition-all text-left min-w-0 group"
            title="Sinefil Pasaportu & Profil"
          >
            {/* 3D Beveled Avatar Frame */}
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base shrink-0 relative transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(180deg, #252932 0%, #14171E 100%)",
                border: `1.5px solid ${effectiveCornerColor}`,
                borderBottom: `3px solid ${effectiveCornerColor}`,
                boxShadow: "0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="leading-none select-none">{currentAvatar.emoji}</span>
            </div>

            {/* İsim ve Seviye */}
            <div className="min-w-0 flex flex-col">
              <span className="text-[11px] sm:text-xs font-extrabold text-[#F1EEE7] truncate max-w-[85px] sm:max-w-[110px] leading-tight tracking-tight">
                {profile.username === "Oyuncu" ? "Sinefil #3095" : profile.username}
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-bold truncate leading-tight mt-0.5"
                style={{ color: effectiveCornerColor }}
              >
                Lv.{profile.rankLevel || 1} &middot; {profile.rankTitle || "Bilet Kontrolörü 🍿"}
              </span>
            </div>
          </button>

          {/* SAĞ: STREAK ATEŞİ + MAKARA BAKİYESİ + BİLDİRİM + AYARLAR */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Streak Ateşi */}
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                onOpenQuests();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black font-mono transition-all active:translate-y-[1.5px]"
              style={{
                background: "linear-gradient(180deg, rgba(245,166,35,0.22) 0%, rgba(180,83,9,0.22) 100%)",
                border: "1px solid rgba(245,166,35,0.45)",
                borderBottom: "2.5px solid #9A5B0A",
                color: "#F5A623",
              }}
              title={`${profile.dailyStreak || 3} Günlük Seri`}
            >
              <Flame className="w-3 h-3 text-[#F5A623] fill-[#F5A623]" />
              <span>{profile.dailyStreak || 3}</span>
            </button>

            {/* Makara Bakiyesi */}
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onOpenShop) onOpenShop();
                else onOpenQuests();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black font-mono transition-all active:translate-y-[1.5px]"
              style={{
                background: "linear-gradient(180deg, rgba(245,166,35,0.2) 0%, rgba(146,64,14,0.25) 100%)",
                border: `1px solid ${safeCornerHex}55`,
                borderBottom: "2.5px solid #9A5B0A",
                color: safeCornerHex,
              }}
              title="Sinefil İkon Pazarı"
            >
              <Film className="w-3 h-3 fill-current" />
              <span>{(profile.reelsBalance || 350).toLocaleString()}</span>
            </button>

            {/* Bildirim Zili Butonu */}
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onOpenNotifications) onOpenNotifications();
              }}
              className="p-1.5 rounded-lg text-[#A5A8B0] hover:text-[#F1EEE7] tactile-btn-surface relative"
              title="Bildirimler"
            >
              <Bell className="w-3 h-3" />
              {notifUnreadCount && notifUnreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF334B] text-white text-[7.5px] font-black flex items-center justify-center animate-pulse">
                  {notifUnreadCount}
                </span>
              ) : null}
            </button>

            {/* Canlı Salon Işık Masası (Görsel Özelleştirme & Ambiyans) Butonu */}
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onOpenLiveAmbience) onOpenLiveAmbience();
                else onOpenProfileModal();
              }}
              className="flex items-center gap-1 px-1.5 py-1 rounded-lg transition-all active:translate-y-[1.5px] relative group"
              style={{
                background: "linear-gradient(180deg, #252932 0%, #15181F 100%)",
                border: `1.5px solid ${activeTheme.accentColor}88`,
                borderBottom: `2.5px solid ${activeTheme.accentColor}`,
                boxShadow: `0 2px 8px ${activeTheme.glowRgba}`,
              }}
              title={`Salon Işık Masası: ${activeTheme.label} — Canlı Ambiyans & Gren`}
            >
              <span
                className="w-2 h-2 rounded-full animate-ping shrink-0"
                style={{ background: activeTheme.accentColor }}
              />
              <Sliders className="w-3 h-3 text-[#F5A623]" />
            </button>
          </div>
        </header>

        {/* ── 1.5. 35MM ANALOG MARKA BAŞLIĞI: CRITERION-INSPIRED EDITORIAL CINEMA ─── */}
        <div className="text-center py-1 relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181B24]/90 border border-[#F5A623]/35 shadow-sm mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="text-[8px] sm:text-[8.5px] font-mono font-bold tracking-[0.25em] text-[#F5A623] uppercase">
              KODAK 5219 &middot; 35MM CINEMA
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-serif tracking-[0.14em] text-[#F1EEE7] leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              CINE<span style={{ color: effectiveCornerColor }} className="italic font-serif">·</span>XOX
            </h1>
            {onOpenHelp && (
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  onOpenHelp();
                }}
                aria-label="Nasıl Oynanır"
                className="w-5 h-5 rounded-full bg-[#1F2430] border border-white/10 flex items-center justify-center text-[#A5A8B0] hover:text-[#F5A623] transition-colors"
                title="Nasıl Oynanır?"
              >
                <HelpCircle className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── 2. MERKEZ STAGE: CANLI DÜELLO (HERO TACTILE 3D PRODUCTION DECK) ─── */}
        <div
          onClick={() => {
            audio.playSelect();
            haptic.medium();
            onStartGame("CLASSIC", "NORMAL", "FILM");
          }}
          className="w-full p-3 sm:p-3.5 rounded-2xl text-left transition-all active:translate-y-[2px] relative overflow-hidden group cursor-pointer select-none"
          style={{
            background: "linear-gradient(145deg, #242A36 0%, #171A22 62%, #12141A 100%)",
            border: `1.5px solid ${effectiveCornerColor}55`,
            borderBottom: `4px solid #78350F`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}
        >
          {/* Subtle Viewfinder Grid Pattern */}
          <div
            className="absolute -right-3 -bottom-3 w-28 h-28 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Kamera Vizör Köşe Kılavuzları ┌ ┐ └ ┘ */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l pointer-events-none rounded-tl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r pointer-events-none rounded-tr-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l pointer-events-none rounded-bl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r pointer-events-none rounded-br-sm" style={{ borderColor: effectiveCornerColor }} />

          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Clapperboard Icon Badge */}
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(180deg, #2D3442 0%, #1A1E27 100%)",
                  border: `1px solid ${effectiveCornerColor}44`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5A623]" />
              </div>

              <div className="min-w-0">
                {/* Mikro Etiket: Canlı Nabız & Süre */}
                <div className="flex items-center gap-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-[#A5A8B0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8EBB70]" />
                  <span>142 ÇEVRİMİÇİ</span>
                  <span className="opacity-40">&middot;</span>
                  <span>12S BLITZ</span>
                </div>

                {/* Başlık: CANLI DÜELLO (1v1) */}
                <h2 className="text-sm sm:text-base font-extrabold text-[#F1EEE7] leading-tight mt-0.5 tracking-wide drop-shadow">
                  CANLI DÜELLO (1v1)
                </h2>

                {/* Alt Bilgi */}
                <p className="text-[9.5px] font-medium text-[#A5A8B0] truncate mt-0.5">
                  Klasik (Oyuncu &times; Yönetmen) &amp; Sinefil
                </p>
              </div>
            </div>

            {/* Sağ Taraf: 3D Beveled BAŞLA Butonu */}
            <div className="shrink-0">
              <button
                type="button"
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl font-black text-xs transition-transform active:translate-y-[1.5px]"
                style={{
                  background: "linear-gradient(180deg, #FFB838 0%, #F5A623 100%)",
                  color: "#0F1115",
                  border: "1px solid #FFE082",
                  borderBottom: "3px solid #9A5B0A",
                  boxShadow: "0 3px 10px rgba(245,166,35,0.35), inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                <span>BAŞLA</span>
                <Play className="w-3 h-3 fill-[#0F1115]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2.5. ARENA MODLARI (3 SEÇENEK YAN YANA - MOBİL UYUMLU 3 SÜTUN) ─── */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-semibold tracking-widest uppercase text-[#A5A8B0] font-mono">
              ARENA MODLARI (3 SEÇENEK)
            </span>
            <button
              type="button"
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onOpenGameModesHub) onOpenGameModesHub();
                else if (onOpenGameSelect) onOpenGameSelect();
              }}
              className="text-[9.5px] font-black text-[#F5A623] hover:text-amber-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>TÜM ARENALAR</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* 1. Klasik Düello */}
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onDirectStartMode) onDirectStartMode("CLASSIC");
                else onStartGame("CLASSIC", "NORMAL", "FILM");
              }}
              className="p-2 sm:p-2.5 rounded-xl text-left transition-all active:translate-y-[2px] group relative overflow-hidden flex flex-col justify-between min-w-0"
              style={{
                background: "linear-gradient(180deg, #242833 0%, #15181F 100%)",
                border: "1.5px solid rgba(245, 166, 35, 0.4)",
                borderBottom: "3.5px solid #854D0E",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm leading-none">🎬</span>
                  <span className="text-[6.5px] sm:text-[7px] font-mono font-black uppercase px-1 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/35 truncate">
                    12S BLITZ
                  </span>
                </div>
                <div className="text-[10.5px] sm:text-[11px] font-black text-[#F1EEE7] group-hover:text-[#F5A623] transition-colors leading-tight truncate">
                  Klasik Düello
                </div>
              </div>
              <div className="text-[8px] text-[#A5A8B0] font-medium leading-[1.2] mt-1 line-clamp-2">
                Yönetmen/Tür &times; Oyuncu &middot; 3&apos;lü Hat
              </div>
            </button>

            {/* 2. Ters Kadraj */}
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onDirectStartMode) onDirectStartMode("REVERSE_CAST");
                else onStartGame("REVERSE_CAST", "NORMAL", "FILM");
              }}
              className="p-2 sm:p-2.5 rounded-xl text-left transition-all active:translate-y-[2px] group relative overflow-hidden flex flex-col justify-between min-w-0"
              style={{
                background: "linear-gradient(180deg, #1C242E 0%, #13171F 100%)",
                border: "1.5px solid rgba(0, 213, 232, 0.42)",
                borderBottom: "3.5px solid #0E7490",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm leading-none">🎭</span>
                  <span className="text-[6.5px] sm:text-[7px] font-mono font-black uppercase px-1 py-0.5 rounded bg-[#00D5E8]/20 text-[#00D5E8] border border-[#00D5E8]/35 truncate">
                    ORTAK AKTÖR
                  </span>
                </div>
                <div className="text-[10.5px] sm:text-[11px] font-black text-[#F1EEE7] group-hover:text-[#00D5E8] transition-colors leading-tight truncate">
                  Ters Kadraj
                </div>
              </div>
              <div className="text-[8px] text-[#A5A8B0] font-medium leading-[1.2] mt-1 line-clamp-2">
                Film &times; Film &middot; Ortak Aktör
              </div>
            </button>

            {/* 3. Sinefil Konsept */}
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onDirectStartMode) onDirectStartMode("CINE_CONCEPT");
                else onStartGame("CINE_CONCEPT", "NORMAL", "FILM");
              }}
              className="p-2 sm:p-2.5 rounded-xl text-left transition-all active:translate-y-[2px] group relative overflow-hidden flex flex-col justify-between min-w-0"
              style={{
                background: "linear-gradient(180deg, #221E2E 0%, #15131C 100%)",
                border: "1.5px solid rgba(168, 85, 247, 0.42)",
                borderBottom: "3.5px solid #581C87",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm leading-none">🌀</span>
                  <span className="text-[6.5px] sm:text-[7px] font-mono font-black uppercase px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/35 truncate">
                    14 TEMA
                  </span>
                </div>
                <div className="text-[10.5px] sm:text-[11px] font-black text-[#F1EEE7] group-hover:text-purple-300 transition-colors leading-tight truncate">
                  Sinefil Konsept
                </div>
              </div>
              <div className="text-[8px] text-[#A5A8B0] font-medium leading-[1.2] mt-1 line-clamp-2">
                Neo-Noir &middot; Distopya &middot; Auteur
              </div>
            </button>
          </div>
        </div>

        {/* ── 3. İKİNCİL OYUN MODLARI: YAN YANA 2 DENGELİ 3D KART ─── */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Kart 1: Günün Kadresi */}
          <button
            onClick={() => {
              audio.playSelect();
              haptic.light();
              onOpenDaily();
            }}
            className="p-2.5 sm:p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:translate-y-[2px] group relative overflow-hidden min-h-[92px]"
            style={{
              background: "linear-gradient(145deg, rgba(245,166,35,0.14) 0%, #181B22 65%, #12151B 100%)",
              border: "1.5px solid rgba(245,166,35,0.38)",
              borderBottom: "3.5px solid #78350F",
              boxShadow: "0 5px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between w-full gap-1">
              <div className="w-7 h-7 rounded-lg bg-[#F5A623]/20 border border-[#F5A623]/40 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
              </div>
              <span className="text-[7px] sm:text-[7.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/35">
                GÜNLÜK KÜRESEL
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs font-black text-[#F1EEE7] group-hover:text-[#F5A623] transition-colors block">
                Günün Kadresi
              </span>
              <span className="text-[9px] font-medium text-[#A5A8B0] block leading-tight mt-0.5">
                Sabit Matris &middot; Rarity &middot; Paylaş
              </span>
            </div>
          </button>

          {/* Kart 2: Özel Oda & Düello */}
          <button
            onClick={() => {
              audio.playSelect();
              haptic.light();
              onOpenCustomLobby();
            }}
            className="p-2.5 sm:p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:translate-y-[2px] group relative overflow-hidden min-h-[92px]"
            style={{
              background: "linear-gradient(145deg, rgba(255,51,75,0.14) 0%, #181B22 65%, #12151B 100%)",
              border: "1.5px solid rgba(255,51,75,0.38)",
              borderBottom: "3.5px solid #7F1D1D",
              boxShadow: "0 5px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between w-full gap-1">
              <div className="w-7 h-7 rounded-lg bg-[#FF334B]/20 border border-[#FF334B]/40 flex items-center justify-center shrink-0">
                <Swords className="w-3.5 h-3.5 text-[#FF334B]" />
              </div>
              <span className="text-[7px] sm:text-[7.5px] font-mono font-bold text-[#FF334B] bg-[#FF334B]/15 px-2 py-0.5 rounded-full border border-[#FF334B]/35">
                1v1 LOBİ &rarr;
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs font-black text-[#F1EEE7] group-hover:text-[#FF334B] transition-colors block">
                Özel Oda &amp; Düello
              </span>
              <span className="text-[9px] font-medium text-[#A5A8B0] block leading-tight mt-0.5">
                Kodla Arkadaşını Çağır
              </span>
            </div>
          </button>
        </div>

        {/* ── 4. SİNEFİL KÜNYESİ (TACTILE RANK & PLACEMENT BOARD) ─── */}
        <div
          onClick={() => {
            audio.playSelect();
            onOpenProfileModal();
          }}
          className="rounded-2xl p-3 relative overflow-hidden cursor-pointer transition-transform active:translate-y-[1px]"
          style={{
            background: "linear-gradient(180deg, #1D212A 0%, #14171E 100%)",
            border: `1.5px solid ${effectiveHudBorder}`,
            borderBottom: "4px solid #090A0D",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          {/* Kamera Vizör Köşe Kılavuzları */}
          <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l pointer-events-none rounded-tl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r pointer-events-none rounded-tr-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l pointer-events-none rounded-bl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r pointer-events-none rounded-br-sm" style={{ borderColor: effectiveCornerColor }} />

          <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest mb-2 px-1">
            <span className="flex items-center gap-1.5 font-black text-[#FF334B]">
              <span className="w-2 h-2 rounded-full bg-[#FF334B] shadow-[0_0_8px_#FF334B] animate-pulse shrink-0" />
              <span className="tracking-wider">REC &middot; CANLI SİNEFİL KÜNYESİ</span>
            </span>
            <span className="font-bold text-[#A5A8B0]">
              {profile.totalMatches < 10
                ? `DERECESİZ (${placementRemaining} MAÇ KALDI)`
                : `SIRA #${profile.rankLevel * 15}`}
            </span>
          </div>

          {/* 3'lü Tactile İstatistik Şeridi: Galibiyet / Mağlubiyet / Oran */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#111318] p-2 border border-white/8 border-b-2 border-b-black shadow-inner">
              <span className="text-[7.5px] font-black uppercase text-[#A5A8B0] font-mono block">GALİBİYET</span>
              <span className="text-sm font-black text-[#F1EEE7] mt-0.5 block">{profile.wins}</span>
            </div>
            <div className="rounded-xl bg-[#111318] p-2 border border-white/8 border-b-2 border-b-black shadow-inner">
              <span className="text-[7.5px] font-black uppercase text-[#A5A8B0] font-mono block">MAĞLUBİYET</span>
              <span className="text-sm font-black text-[#F1EEE7] mt-0.5 block">{profile.losses}</span>
            </div>
            <div className="rounded-xl bg-[#111318] p-2 border border-white/8 border-b-2 border-b-black shadow-inner">
              <span className="text-[7.5px] font-black uppercase text-[#A5A8B0] font-mono block">ORAN</span>
              <span className="text-sm font-black mt-0.5 block" style={{ color: effectiveCornerColor }}>
                %{winRate}
              </span>
            </div>
          </div>

          {/* 35mm Negatif İlerleme Çubuğu (10 Maçlık Lig Yerleşimi) */}
          <div className="mt-2.5 pt-2 border-t border-white/8 flex items-center justify-between gap-2 px-0.5">
            <span className="text-[8px] font-mono font-bold text-[#A5A8B0] uppercase tracking-wider shrink-0">
              LİG YERLEŞİMİ:
            </span>
            <div className="flex items-center gap-1 flex-1 justify-center max-w-[195px]">
              {Array.from({ length: 10 }).map((_, idx) => {
                const isPlayed = idx < placementPlayed;
                return (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-[3px] border transition-all ${
                      isPlayed
                        ? "bg-[#F5A623] border-amber-300 shadow-[0_0_6px_rgba(245,166,35,0.5)]"
                        : "bg-[#0F1115] border-[#252932]"
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[8.5px] font-mono font-black shrink-0" style={{ color: effectiveCornerColor }}>
              {placementPlayed}/10
            </span>
          </div>
        </div>

        {/* ── 5. GÜNLÜK GÖREV KARTI ─── */}
        <button
          onClick={() => {
            audio.playSelect();
            haptic.light();
            onOpenQuests();
          }}
          className="p-2.5 rounded-2xl flex items-center justify-between text-left transition-all active:translate-y-[1.5px] tactile-card-interactive"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F5A623]/15 border border-[#F5A623]/35 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-[#F5A623]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-[#F1EEE7] block truncate">
                Günlük Görev: İlk Maçı Kazan
              </span>
              <span className="text-[9.5px] font-bold text-[#F5A623] block">
                +100 Makara Ödülü
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-black text-[#F1EEE7] bg-[#252932] border border-white/15 border-b-2 border-b-black px-2.5 py-1 rounded-lg shrink-0">
            1/1 &middot; AL &rarr;
          </span>
        </button>

        {/* ── 6. CANLI SİNEFİL AKIŞI (LIVE DUEL FEED) ─── */}
        <div className="rounded-xl px-3 py-2 border border-white/10 bg-[#14171E] flex items-center gap-2.5 overflow-hidden shadow-inner">
          <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-[#FF334B]/15 border border-[#FF334B]/40 text-[8px] font-mono font-black text-[#FF334B] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF334B] animate-pulse inline-block" />
            <span>{TICKER_MESSAGES[tickerIndex].tag}</span>
          </div>
          <p className="text-[10px] font-bold text-[#F1EEE7]/90 truncate transition-opacity duration-300">
            {TICKER_MESSAGES[tickerIndex].text}
          </p>
        </div>

        {/* ── 7. SİNEMA ZEVK DNA'SI & LETTERBOXD KÖPRÜSÜ ─── */}
        <div
          onClick={() => {
            audio.playSelect();
            haptic.light();
            onOpenDna();
          }}
          className="p-3 rounded-2xl transition-all active:translate-y-[2px] cursor-pointer relative overflow-hidden group select-none"
          style={{
            background: "linear-gradient(135deg, #211738 0%, #161822 65%, #121D24 100%)",
            border: "1.5px solid rgba(168, 85, 247, 0.42)",
            borderBottom: "4px solid #3B0764",
            boxShadow: "0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/35 flex items-center justify-center shrink-0">
                <Dna className="w-4 h-4 text-purple-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono font-black uppercase text-purple-300 tracking-wider">
                    SİNEMA ZEVK DNA&apos;SI
                  </span>
                  {profile.letterboxdUsername ? (
                    <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-[#8EBB70]/20 text-[#8EBB70] border border-[#8EBB70]/40 font-mono font-bold">
                      @{profile.letterboxdUsername} &middot; ONAYLI ✓
                    </span>
                  ) : (
                    <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-[#8EBB70]/15 text-[#8EBB70] border border-[#8EBB70]/35 font-bold">
                      LETTERBOXD BAĞLA
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-[#F1EEE7] block truncate mt-0.5">
                  {profile.tasteDna?.cinemaAesthetic || "Karanlık Zihinler & Bilim Kurgu Tutkunu 🌌"}
                </span>
                <span className="text-[9.5px] font-bold text-[#A5A8B0] block truncate mt-0.5">
                  Favori: {profile.tasteDna?.topDirector || "Christopher Nolan"} &middot; {profile.tasteDna?.topGenre || "Bilim Kurgu (Sci-Fi)"}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 border border-purple-400/40 border-b-2 border-b-purple-950 text-[10px] font-black transition-all">
              <span>İncele</span>
              <Sparkles className="w-3 h-3 text-purple-300" />
            </div>
          </div>
        </div>

        {/* ── 35MM ANALOG KODAK FOOTER METADATA ─── */}
        <div className="text-center py-1 px-2">
          <div className="inline-flex items-center gap-1.5 text-[7px] sm:text-[7.5px] font-mono font-bold uppercase tracking-[0.18em] text-[#A5A8B0]/70 select-none">
            <span className="text-[#F5A623]">KODAK 5219</span>
            <span>&middot;</span>
            <span>35MM</span>
            <span>&middot;</span>
            <span className="flex items-center gap-1 text-[#FF334B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF334B] animate-pulse inline-block" />
              24FPS
            </span>
            <span>&middot;</span>
            <span>SHUTTER 180&deg;</span>
            <span>&middot;</span>
            <span>FRAME #024</span>
          </div>
        </div>
      </div>

      {/* ── 8. ALT DOCK BAR (SAFE-AREA UYUMLU, SABİT 5'Lİ OYUN NAVİGASYONU) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 sm:px-3 z-40 max-w-[430px] mx-auto w-full"
        style={{
          background: "rgba(15, 17, 21, 0.96)",
          borderTop: "1.5px solid #252932",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -6px 24px rgba(0,0,0,0.7)",
          paddingTop: "0.45rem",
          paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))",
        }}
      >
        {[
          { label: "Lobi", icon: Home, color: "#F5A623", active: true, act: undefined },
          {
            label: "Arenalar",
            icon: Film,
            color: "#00D5E8",
            active: false,
            act: () => {
              audio.playSelect();
              if (onOpenGameSelect) onOpenGameSelect();
              else if (onOpenGameModesHub) onOpenGameModesHub();
            },
          },
          {
            label: "Günlük",
            icon: Clock,
            color: "#F5A623",
            active: false,
            act: () => {
              audio.playSelect();
              onOpenDaily();
            },
          },
          {
            label: "Sıralama",
            icon: Trophy,
            color: "#F5A623",
            active: false,
            act: () => {
              audio.playSelect();
              onOpenLeaderboard?.();
            },
          },
          {
            label: "Pasaport",
            icon: Sparkles,
            color: "#A855F7",
            active: false,
            act: () => {
              audio.playSelect();
              onOpenProfileModal();
            },
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={tab.act}
              className={`flex flex-col items-center transition-all active:scale-95 px-3 py-1 rounded-xl ${
                tab.active ? "bg-[#252932]/90 border border-white/10" : "hover:bg-white/5"
              }`}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: tab.active ? tab.color : "#A5A8B0" }}
              />
              <span
                className="text-[8px] font-black mt-0.5 uppercase tracking-wide"
                style={{ color: tab.active ? tab.color : "#A5A8B0" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Hızlı Oyna Ayarları Modalı ─── */}
      <QuickMatchSetupModal
        isOpen={showQuickSetup}
        onClose={() => setShowQuickSetup(false)}
        userProfile={profile}
        onStartMatchmaking={(mode, pool, diff) => {
          setShowQuickSetup(false);
          onStartGame(mode, diff, pool);
        }}
      />
    </div>
  );
};
