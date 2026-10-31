"use client";

import React, { useState } from "react";
import {
  Sliders,
  Wallet,
  Trophy,
  ShoppingBag,
  Crown,
  Gift,
  Play,
  Star,
  Compass,
  Film,
  Flame,
  Shuffle,
  ChevronRight,
  Clock,
  Sparkles,
  Home,
  UserCheck,
  Swords,
  Layers,
  Bell,
  Zap,
  Globe,
  Award,
  Bot,
  Users,
  Clapperboard,
} from "lucide-react";
import { UserProfile, AVATAR_OPTIONS, AMBIENCE_THEMES, DEFAULT_AMBIENCE, CORNER_ACCENT_COLORS } from "@/types/profile";
import { ContentPoolType } from "@/types/game";
import { PRESET_BOARDS } from "@/data/boards";
import { audio } from "@/utils/audio";
import { NotifBell } from "@/components/NotificationPanel";
import { QuickMatchSetupModal } from "@/components/QuickMatchSetupModal";

interface HomeScreenProps {
  profile: UserProfile;
  onStartGame: (modeName: string, difficulty: "EASY" | "NORMAL" | "HARD", contentPool?: ContentPoolType) => void;
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
}

// Sprocket holes — left/right edge decorations
const SprocketStrip = () => (
  <div className="flex flex-col items-center gap-[6px] py-4">
    {Array.from({ length: 22 }).map((_, i) => (
      <div
        key={i}
        style={{
          width: 9,
          height: 6,
          background: "#07080b",
          borderRadius: 2,
          border: "1px solid #2a2b35",
        }}
      />
    ))}
  </div>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onStartGame,
  onOpenProfileModal,
  onOpenCustomLobby,
  onOpenDaily,
  onOpenQuests,
  onOpenDna,
  onOpenShop,
  onOpenPro,
  onOpenGameModesHub,
  onOpenGameSelect,
  onOpenLeaderboard,
  onOpenNotifications,
  notifUnreadCount = 0,
  onOpenLiveAmbience,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "CLASSIC" | "DIRECTOR_VS_ACTOR" | "GENRE_AWARDS" | "DC_VS_MARVEL"
  >("CLASSIC");

  const [difficulty, setDifficulty] = useState<"HARD" | "NORMAL" | "EASY">("NORMAL");
  const [contentPool, setContentPool] = useState<ContentPoolType>("FILM");
  const [showQuickSetup, setShowQuickSetup] = useState<boolean>(false);

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

  const openGameSelect = onOpenGameSelect || onOpenGameModesHub;

  const ambience = profile.ambience || DEFAULT_AMBIENCE;
  const activeTheme = AMBIENCE_THEMES[ambience.theme] || AMBIENCE_THEMES.velvet_red;

  // Köşe ve vurgu rengi — Temaya göre otomatik veya kullanıcının özel seçtiği renk
  const effectiveCornerColor =
    ambience.cornerAccent && ambience.cornerAccent !== "AUTO"
      ? CORNER_ACCENT_COLORS[ambience.cornerAccent].color
      : activeTheme.secondaryAccent || "#f59e0b";

  const effectiveHudBorder =
    ambience.cornerAccent && ambience.cornerAccent !== "AUTO"
      ? CORNER_ACCENT_COLORS[ambience.cornerAccent].border
      : activeTheme.hudBorder || "rgba(217,119,6,0.3)";

  return (
    <div
      className="w-full max-w-md mx-auto min-h-screen text-white flex flex-col justify-between pb-20 relative select-none antialiased overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: activeTheme.bgColor,
        filter: `brightness(${Math.min(1.1, Math.max(0.65, ambience.dimness / 85))})`,
      }}
    >
      {/* ── Top Dynamic Projector Beam (Kişiselleştirilebilir Projeksiyon Hüzmesi) ─── */}
      <div
        className="absolute top-0 left-1/6 right-1/6 h-48 pointer-events-none z-0 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at top, ${activeTheme.glowRgba}, transparent 75%)`,
          opacity: (ambience.glowIntensity / 100),
        }}
      />

      {/* ── Sprocket borders ─── */}
      <div
        className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{ width: 18, background: "#0a0b10", borderRight: "1px solid #1a1c24" }}
      >
        <SprocketStrip />
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{ width: 18, background: "#0a0b10", borderLeft: "1px solid #1a1c24" }}
      >
        <SprocketStrip />
      </div>

      {/* ── Subtle Cinema Viewfinder Watermark (Kişiselleştirilebilir Lens Filigranı) ─── */}
      {ambience.showWatermark && (
        <div
          className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.035] transition-opacity duration-300"
        >
          <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="170" cy="170" r="160" stroke={activeTheme.accentColor} strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="170" cy="170" r="110" stroke={activeTheme.accentColor} strokeWidth="1" />
            <line x1="170" y1="20" x2="170" y2="320" stroke={activeTheme.accentColor} strokeWidth="1" strokeDasharray="4 8" />
            <line x1="20" y1="170" x2="320" y2="170" stroke={activeTheme.accentColor} strokeWidth="1" strokeDasharray="4 8" />
            <rect x="55" y="110" width="230" height="120" rx="4" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 5" />
            <circle cx="170" cy="170" r="3" fill={activeTheme.accentColor} />
          </svg>
        </div>
      )}

      {/* ── 35mm Film Grain (Kişiselleştirilebilir Gren Düzeyi) ─── */}
      {ambience.grain !== "OFF" && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
          style={{
            opacity: ambience.grain === "VINTAGE" ? 0.055 : 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px",
          }}
        />
      )}

      {/* ── Top Ambient Light Line ─── */}
      <div
        className="absolute top-0 left-4 right-4 h-px pointer-events-none z-10 transition-colors duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${activeTheme.accentColor} 30%, ${activeTheme.accentColor} 70%, transparent)`,
        }}
      />

      {/* Main content — padded away from sprockets */}
      <div className="px-6 relative z-10 flex flex-col gap-3 pt-3">

        {/* ── 1. TOP BAR ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <button
              onClick={onOpenProfileModal}
              className="p-2 rounded-xl text-zinc-500 hover:text-white transition-colors active:scale-95"
              title="Profil & Ayarlar"
            >
              <Sliders className="w-5 h-5" />
            </button>
            {onOpenLiveAmbience && (
              <button
                onClick={() => {
                  audio.playSelect();
                  onOpenLiveAmbience();
                }}
                className="p-1.5 rounded-xl text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/25 transition-all active:scale-95 shadow-sm"
                title="Salon Işıkları & Loşluk (Canlı Gör)"
              >
                <span className="text-xs">💡</span>
              </button>
            )}
          </div>

          {/* Brand */}
          <div className="text-center">
            <div className="text-[8px] font-black tracking-[0.3em] uppercase transition-colors duration-500" style={{ color: activeTheme.accentColor }}>
              KODAK 35mm
            </div>
            <h1 className="text-lg font-black tracking-widest text-white uppercase font-mono leading-none">
              CINE<span className="transition-colors duration-500" style={{ color: effectiveCornerColor }}>XOX</span>
            </h1>
          </div>

          {/* Currency + Notif */}
          <div className="flex items-center gap-1.5">
            <NotifBell unreadCount={notifUnreadCount} onClick={onOpenNotifications || (() => {})} />
            <button
              onClick={onOpenShop || onOpenQuests}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
              style={{
                background: `${effectiveCornerColor}14`,
                border: `1px solid ${effectiveCornerColor}40`,
                color: effectiveCornerColor,
              }}
            >
              <Film className="w-3 h-3" />
              <span>{profile.reelsBalance.toLocaleString()}</span>
            </button>
          </div>
        </div>

        {/* ── SEVİYE 1: HIZLI OYNA (BÜYÜK DEV BUTON - BİRİNCİL ODAK) ─── */}
        <div className="pt-1">
          <button
            onClick={() => {
              audio.playSelect();
              setShowQuickSetup(true);
            }}
            className="w-full py-4 px-5 rounded-2xl font-black text-base flex items-center justify-between transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #8b151b 0%, #b01e25 50%, #d97706 100%)",
              boxShadow: "0 8px 32px rgba(139,21,27,0.45), 0 2px 8px rgba(0,0,0,0.6)",
              color: "white",
            }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Film className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="text-left">
                <span className="text-xs uppercase tracking-widest font-mono text-amber-200 block leading-tight">
                  1v1 ONLINE · 10-15s
                </span>
                <span className="text-base font-black text-white block leading-tight">
                  HIZLI OYNA (MAÇ BUL)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-mono font-bold">
              <span>⚡</span>
              <span>BAŞLA</span>
            </div>
          </button>
        </div>

        {/* ── SEVİYE 2: GÜNÜN KADRESİ (GÜNLÜK GRID - STREAK GÖRÜNÜR) ─── */}
        <button
          onClick={onOpenDaily}
          className="w-full p-3.5 rounded-2xl flex items-center justify-between text-left border transition-all active:scale-[0.98] group relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(217,119,6,0.14), rgba(14,16,24,0.92))",
            borderColor: "rgba(217,119,6,0.35)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/35 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white block truncate">Günün Kadresi</span>
                <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  GÜNLÜK RİTÜEL
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 block truncate">
                Sabit Tahta · Rarity · Emoji Paylaşımı
              </span>
            </div>
          </div>
          {/* Görünür Günlük Streak */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black font-mono shrink-0 shadow-sm"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(245,158,11,0.25))",
              border: "1px solid rgba(245,158,11,0.5)",
              color: "#f59e0b",
            }}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span>{profile.dailyStreak || 3} GÜN</span>
          </div>
        </button>

        {/* ── SEVİYE 3: ÖZEL ODA & DÜELLO (ARKADAŞLA OYNA) ─── */}
        <button
          onClick={onOpenCustomLobby}
          className="w-full p-3.5 rounded-2xl flex items-center justify-between text-left border transition-all active:scale-[0.98] group"
          style={{
            background: "linear-gradient(135deg, rgba(139,21,27,0.12), rgba(14,16,24,0.92))",
            borderColor: "rgba(139,21,27,0.35)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/35 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-white block truncate">Özel Oda & Düello</span>
              <span className="text-[10px] font-bold text-zinc-400 block truncate">
                Kodla Arkadaş Davet Et · Kuralları Sen Seç
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-red-400/90 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/40">
            1v1 LOBİ →
          </span>
        </button>

        {/* ── SEVİYE 4: SİNEFİL PROFİLİ & STREAK (DIRECTOR VIEWFINDER HUD) ─── */}
        <div
          className="rounded-2xl p-3.5 relative overflow-hidden font-sans transition-all duration-500"
          style={{
            background: "linear-gradient(135deg, rgba(14,16,24,0.95), rgba(10,11,16,0.98))",
            border: `1px solid ${effectiveHudBorder}`,
            boxShadow: `inset 0 0 30px ${activeTheme.glowRgba}, 0 8px 24px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Kamera Vizör Köşe Kılavuzları (Camera Viewfinder Crop Marks - DİNAMİK RENK) */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 pointer-events-none rounded-tl-sm transition-colors duration-500" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 pointer-events-none rounded-tr-sm transition-colors duration-500" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 pointer-events-none rounded-bl-sm transition-colors duration-500" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 pointer-events-none rounded-br-sm transition-colors duration-500" style={{ borderColor: effectiveCornerColor }} />

          {/* Vizör Üst Bilgi Satırı: [REC ●] ve Profil Başlığı */}
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: activeTheme.accentColor }} />
              <span className="text-[8px] font-black uppercase tracking-widest font-mono" style={{ color: activeTheme.accentColor }}>
                REC ● SİNEFİL KADRAJI
              </span>
            </div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
              KULLANICI KÜNYESİ
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              {/* Avatar — 35mm Slide Mount Şeklinde */}
              <button
                onClick={onOpenProfileModal}
                className="relative rounded-xl flex items-center justify-center text-2xl active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${currentAvatar.iconBg?.split(" ")[1] || "#1a1c24"}, #0e1018)`,
                  border: `2px solid ${effectiveCornerColor}`,
                  width: 50,
                  height: 50,
                  boxShadow: `0 2px 12px ${activeTheme.glowRgba}`,
                }}
              >
                {currentAvatar.emoji}
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border border-[#07080b]"
                  style={{ background: activeTheme.accentColor, color: "white" }}
                >
                  ✎
                </span>
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white">{profile.username}</span>
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded font-mono transition-colors duration-500"
                    style={{
                      background: `${effectiveCornerColor}18`,
                      border: `1px solid ${effectiveCornerColor}50`,
                      color: effectiveCornerColor,
                    }}
                  >
                    Lv.{profile.rankLevel || 6}
                  </span>
                </div>
                {/* XP Progress Bar */}
                <div className="w-28 h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: "#1a1c24" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: "72%", background: `linear-gradient(to right, ${activeTheme.accentColor}, ${effectiveCornerColor})` }} />
                </div>
                <div className="text-[9px] font-bold mt-1 text-zinc-400">
                  {profile.rankTitle || "Bilet Kontrolörü 🍿"}
                </div>
              </div>
            </div>

            {/* Kupa & Sıralama (Liderlik Girişi) */}
            <button
              onClick={() => { audio.playSelect(); if (onOpenLeaderboard) onOpenLeaderboard(); }}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
              title="Liderlik Tablosu"
            >
              <Trophy className="w-5 h-5 transition-colors duration-500" style={{ color: effectiveCornerColor, fill: effectiveCornerColor }} />
              <span className="text-xs font-black mt-0.5 transition-colors duration-500" style={{ color: effectiveCornerColor }}>
                {profile.wins * 30 + (profile.draws || 0) * 10}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Sıralama →</span>
            </button>
          </div>

          {/* Stats Bar (Galibiyet / Mağlubiyet / Kazanma) */}
          <div
            className="grid grid-cols-3 gap-2 mt-3 pt-2.5 text-center"
            style={{ borderTop: "1px solid rgba(26,28,36,0.8)" }}
          >
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider block text-zinc-500 font-mono">GALİBİYET</span>
              <span className="text-sm font-black text-white">{profile.wins}</span>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider block text-zinc-500 font-mono">MAĞLUBİYET</span>
              <span className="text-sm font-black text-white">{profile.losses}</span>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider block text-zinc-500 font-mono">ORAN</span>
              <span className="text-sm font-black transition-colors duration-500" style={{ color: effectiveCornerColor }}>%{winRate}</span>
            </div>
          </div>

          {/* Vizör Alt Teknik Çubuğu */}
          <div className="flex items-center justify-between px-2 mt-2 pt-1 border-t border-zinc-900/60 text-[7px] font-mono text-zinc-600 uppercase tracking-widest">
            <span>ISO 800</span>
            <span>SHUTTER 180°</span>
            <span>WB 5600K</span>
            <span style={{ color: activeTheme.accentColor }}>FRAME #024</span>
          </div>
        </div>



        {/* ── 5. KOLEKSİYON & SOSYAL FLEX (Sinefil DNA Arşivi & Görevler) ─── */}
        <div className="grid grid-cols-2 gap-2">
          {/* Sinefil DNA / Arşiv (Letterboxd Tarzı Statü) */}
          <button
            onClick={onOpenDna}
            className="p-3 rounded-2xl flex items-center gap-2.5 text-left border transition-all active:scale-[0.98]"
            style={{
              background: "rgba(14,16,24,0.85)",
              borderColor: "rgba(168,85,247,0.3)",
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block truncate">Sinefil DNA</span>
              <span className="text-[9px] font-bold text-zinc-400 block truncate">Arşiv & Rozetler</span>
            </div>
          </button>

          {/* Günlük Görev & Hediye */}
          <button
            onClick={onOpenQuests}
            className="p-3 rounded-2xl flex items-center gap-2.5 text-left border transition-all active:scale-[0.98]"
            style={{
              background: "rgba(14,16,24,0.85)",
              borderColor: "rgba(6,182,212,0.3)",
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block truncate">Günlük Görev</span>
              <span className="text-[9px] font-bold text-zinc-400 block truncate">+50 Makara Al</span>
            </div>
          </button>
        </div>

        {/* Frame number / film metadata */}
        <div className="text-center py-1">
          <span className="text-[8px] font-black uppercase tracking-[0.25em]" style={{ color: "#2a2b35" }}>
            FRAME #024 · ISO 400 · 24FPS · CINEXOX
          </span>
        </div>
      </div>

      {/* ── BOTTOM NAV BAR ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-4 z-40 max-w-md mx-auto"
        style={{
          background: "rgba(7,8,11,0.97)",
          borderTop: "1px solid #1a1c24",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.6)",
        }}
      >
        {[
          { label: "Ana Sayfa", icon: Home, color: "#8b151b", active: true, act: undefined },
          { label: "Günlük", icon: Clock, color: "#d97706", active: false, act: onOpenDaily },
          { label: "Sıralama", icon: Trophy, color: "#f59e0b", active: false, act: onOpenLeaderboard || onOpenCustomLobby },
          { label: "Sinefil DNA", icon: Sparkles, color: "#a855f7", active: false, act: onOpenDna },
          { label: "Profil", icon: UserCheck, color: "#6b7280", active: false, act: onOpenProfileModal },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={tab.act}
              className="flex flex-col items-center transition-all active:scale-95"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: tab.active ? tab.color : "#4b5563" }}
              />
              <span
                className="text-[8px] font-black mt-0.5 uppercase tracking-wide"
                style={{ color: tab.active ? tab.color : "#4b5563" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Ekran 2: Hızlı Oyna Ayarları Modalı ─── */}
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
