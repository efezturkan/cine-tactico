"use client";

import React, { useState } from "react";
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
  Zap,
  Clapperboard,
} from "lucide-react";
import { UserProfile, AVATAR_OPTIONS, AMBIENCE_THEMES, DEFAULT_AMBIENCE, CORNER_ACCENT_COLORS } from "@/types/profile";
import { ContentPoolType } from "@/types/game";
import { audio } from "@/utils/audio";
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
  onOpenLeaderboard,
  onOpenLiveAmbience,
}) => {
  const [showQuickSetup, setShowQuickSetup] = useState<boolean>(false);

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

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
      className="w-full max-w-md mx-auto min-h-screen text-white flex flex-col justify-start pb-24 relative select-none antialiased overflow-x-hidden transition-colors duration-500"
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
          opacity: ambience.glowIntensity / 100,
        }}
      />

      {/* ── Sprocket borders (Film Perforasyon Delikleri) ─── */}
      <div
        className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{ width: 16, background: "#0a0b10", borderRight: "1px solid #1a1c24" }}
      >
        <SprocketStrip />
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{ width: 16, background: "#0a0b10", borderLeft: "1px solid #1a1c24" }}
      >
        <SprocketStrip />
      </div>

      {/* ── Subtle Cinema Viewfinder Watermark (Kişiselleştirilebilir Lens Filigranı) ─── */}
      {ambience.showWatermark && (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.035] transition-opacity duration-300">
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

      {/* ── Top Ambient Light Line ─── */}
      <div
        className="absolute top-0 left-4 right-4 h-px pointer-events-none z-10 transition-colors duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${activeTheme.accentColor} 30%, ${activeTheme.accentColor} 70%, transparent)`,
        }}
      />

      {/* Ana İçerik Yığını (Sprocket'lardan korunaklı iç dolgu) */}
      <div className="px-5 relative z-10 flex flex-col gap-2.5 pt-2">

        {/* ── 1. ÜST STATUS BAR: KİMLİK & KAYNAKLAR (STANDART HUB MİMARİSİ) ─── */}
        <header className="flex items-center justify-between gap-2 py-1">
          {/* SOL: OYUNCU KİMLİĞİ (AVATAR + İSİM + LEVEL) - Tıklanınca Profil Açar */}
          <button
            onClick={() => {
              audio.playSelect();
              onOpenProfileModal();
            }}
            className="flex items-center gap-2.5 p-1 -ml-1 rounded-2xl hover:bg-white/5 active:scale-95 transition-all text-left min-w-0 group"
            title="Profil & Sinefil DNA"
          >
            {/* 35mm Slayt Montürü Çerçeveli Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-md relative transition-transform group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${currentAvatar.iconBg?.split(" ")[1] || "#1a1c24"}, #0e1018)`,
                border: `1.5px solid ${effectiveCornerColor}`,
              }}
            >
              <span className="leading-none select-none">{currentAvatar.emoji}</span>
            </div>

            {/* İsim ve Seviye */}
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-black text-white truncate max-w-[110px] leading-tight">
                {profile.username}
              </span>
              <span
                className="text-[10px] font-bold truncate leading-tight mt-0.5"
                style={{ color: effectiveCornerColor }}
              >
                Lv.{profile.rankLevel || 1} &middot; {profile.rankTitle || "Bilet Kontrolörü"}
              </span>
            </div>
          </button>

          {/* SAĞ: DUOLINGO ATEŞİ + MAKARA BAKİYESİ + AYARLAR */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Streak Ateşi */}
            <button
              onClick={() => {
                audio.playSelect();
                onOpenDaily();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black font-mono transition-all active:scale-95 shadow-sm"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.2))",
                border: "1px solid rgba(245,158,11,0.5)",
                color: "#f59e0b",
              }}
              title={`${profile.dailyStreak || 3} Günlük Seri`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{profile.dailyStreak || 3}</span>
            </button>

            {/* Makara Bakiyesi */}
            <button
              onClick={() => {
                audio.playSelect();
                if (onOpenShop) onOpenShop();
                else if (onOpenQuests) onOpenQuests();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
              style={{
                background: `${effectiveCornerColor}18`,
                border: `1px solid ${effectiveCornerColor}50`,
                color: effectiveCornerColor,
              }}
              title="Sinefil İkon Pazarı"
            >
              <Film className="w-3.5 h-3.5 fill-current" />
              <span>{profile.reelsBalance.toLocaleString()}</span>
            </button>

            {/* Ayarlar / Loşluk Masası Butonu */}
            <button
              onClick={() => {
                audio.playSelect();
                if (onOpenLiveAmbience) onOpenLiveAmbience();
                else onOpenProfileModal();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800 transition-all active:scale-95"
              title="Salon Işıkları & Ayarlar"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Minimalist 35mm Analog Logo */}
        <div className="text-center py-0.5">
          <div className="text-[8px] font-black tracking-[0.3em] uppercase opacity-75" style={{ color: activeTheme.accentColor }}>
            KODAK 35mm FILM
          </div>
          <h1 className="text-base font-black tracking-[0.2em] text-white uppercase font-mono leading-none">
            CINE<span style={{ color: effectiveCornerColor }}>XOX</span>
          </h1>
        </div>

        {/* ── 2. MERKEZ STAGE: HIZLI OYNA (HERO CTA - BAŞPARMAK BÖLGESİ) ─── */}
        <button
          onClick={() => {
            audio.playSelect();
            setShowQuickSetup(true);
          }}
          className="w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group border"
          style={{
            background: "linear-gradient(135deg, #8b151b 0%, #b01e25 50%, #d97706 100%)",
            borderColor: effectiveCornerColor,
            boxShadow: `0 8px 32px rgba(139,21,27,0.45), 0 0 20px ${activeTheme.glowRgba}`,
          }}
        >
          {/* Kamera Vizör Köşe Kılavuzları ┌ ┐ └ ┘ */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 pointer-events-none rounded-tl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 pointer-events-none rounded-tr-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 pointer-events-none rounded-bl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 pointer-events-none rounded-br-sm" style={{ borderColor: effectiveCornerColor }} />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Clapperboard SVG İkonu - BEYAZ KUTU KALDIRILDI! */}
              <div className="w-11 h-11 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0 shadow-md">
                <Clapperboard className="w-6 h-6 text-amber-300" />
              </div>

              <div className="min-w-0">
                {/* Mikro Etiket: SVG Zap ile */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-amber-200">
                  <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>1V1 ONLINE &middot; 10-15s</span>
                </div>

                {/* Başlık: Büyük & Yüksek Kontrast */}
                <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                  HIZLI OYNA (MAÇ BUL)
                </h2>

                {/* Alt Bilgi */}
                <p className="text-[10px] sm:text-[11px] font-bold text-amber-100/80 truncate mt-0.5">
                  Klasik (Oyuncu &times; Yönetmen) &amp; Sinefil
                </p>
              </div>
            </div>

            {/* Sağ Eylem Butonu: Altın Vurgulu BAŞLA Butonu */}
            <div className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-lg transition-transform active:scale-95 border border-amber-300">
              <span>BAŞLA</span>
              <Play className="w-3.5 h-3.5 fill-black" />
            </div>
          </div>
        </button>

        {/* ── 3. İKİNCİL OYUN MODLARI: YAN YANA 2 DENGELİ KART (SIFIR TRUNCATE) ─── */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Kart 1: Günün Kadresi */}
          <button
            onClick={() => {
              audio.playSelect();
              onOpenDaily();
            }}
            className="p-3 rounded-2xl flex flex-col justify-between text-left border transition-all active:scale-[0.98] group relative overflow-hidden min-h-[110px]"
            style={{
              background: "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(14,16,24,0.92))",
              borderColor: "rgba(217,119,6,0.35)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/35 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                GÜNLÜK RİTÜEL
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs font-black text-white block">
                Günün Kadresi
              </span>
              <span className="text-[9.5px] font-bold text-zinc-400 block leading-tight mt-0.5">
                Sabit Matris &middot; Rarity &middot; Paylaş
              </span>
            </div>
          </button>

          {/* Kart 2: Özel Oda & Düello */}
          <button
            onClick={() => {
              audio.playSelect();
              onOpenCustomLobby();
            }}
            className="p-3 rounded-2xl flex flex-col justify-between text-left border transition-all active:scale-[0.98] group relative overflow-hidden min-h-[110px]"
            style={{
              background: "linear-gradient(135deg, rgba(139,21,27,0.12), rgba(14,16,24,0.92))",
              borderColor: "rgba(139,21,27,0.35)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/35 flex items-center justify-center shrink-0">
                <Swords className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span className="text-[8px] font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-800/40">
                1v1 LOBİ &rarr;
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs font-black text-white block">
                Özel Oda &amp; Düello
              </span>
              <span className="text-[9.5px] font-bold text-zinc-400 block leading-tight mt-0.5">
                Kodla Arkadaşını Çağır &middot; Kuralları Seç
              </span>
            </div>
          </button>
        </div>

        {/* ── 4. SİNEFİL KÜNYESİ (PROGRESSIVE DISCLOSURE & DÜZENLİ KART) ─── */}
        <div
          className="rounded-2xl p-3 relative overflow-hidden font-sans border"
          style={{
            background: "linear-gradient(135deg, rgba(14,16,24,0.95), rgba(10,11,16,0.98))",
            borderColor: effectiveHudBorder,
            boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Kamera Vizör Köşe Kılavuzları */}
          <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l pointer-events-none rounded-tl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r pointer-events-none rounded-tr-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l pointer-events-none rounded-bl-sm" style={{ borderColor: effectiveCornerColor }} />
          <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r pointer-events-none rounded-br-sm" style={{ borderColor: effectiveCornerColor }} />

          <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-zinc-500 mb-2 px-1">
            <span className="flex items-center gap-1.5" style={{ color: activeTheme.accentColor }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: activeTheme.accentColor }} />
              REC &middot; SİNEFİL KÜNYESİ
            </span>
            {/* Progressive Rank: 10 maçtan azsa sentetik rank yerine "Derecesiz" gösterilir */}
            <span className="font-bold text-zinc-400">
              {profile.totalMatches < 10 ? "DERECESİZ (10 MAÇ KALDI)" : `SIRA #${profile.rankLevel * 15}`}
            </span>
          </div>

          {/* 3'lü İstatistik Şeridi: Galibiyet / Mağlubiyet / Oran */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-zinc-900/60 p-1.5 border border-zinc-800">
              <span className="text-[8px] font-black uppercase text-zinc-500 font-mono block">GALİBİYET</span>
              <span className="text-sm font-black text-white">{profile.wins}</span>
            </div>
            <div className="rounded-xl bg-zinc-900/60 p-1.5 border border-zinc-800">
              <span className="text-[8px] font-black uppercase text-zinc-500 font-mono block">MAĞLUBİYET</span>
              <span className="text-sm font-black text-white">{profile.losses}</span>
            </div>
            <div className="rounded-xl bg-zinc-900/60 p-1.5 border border-zinc-800">
              <span className="text-[8px] font-black uppercase text-zinc-500 font-mono block">ORAN</span>
              <span className="text-sm font-black" style={{ color: effectiveCornerColor }}>
                %{winRate}
              </span>
            </div>
          </div>
        </div>

        {/* ── 5. GÜNLÜK GÖREV TICKER'I ─── */}
        <button
          onClick={() => {
            audio.playSelect();
            onOpenQuests();
          }}
          className="p-2.5 rounded-xl flex items-center justify-between text-left border transition-all active:scale-[0.98] bg-[#0e1018]/90 border-zinc-800 hover:border-zinc-700"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block truncate">
                Günlük Görev: İlk Maçı Kazan
              </span>
              <span className="text-[9px] font-bold text-amber-400 block">
                +100 Makara Ödülü
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md shrink-0">
            1/1 &middot; AL &rarr;
          </span>
        </button>

        {/* ── TEK KAYNAKLI SİNEMA METADATA TICKER (ISO Çelişkisi Kaldırıldı) ─── */}
        <div className="text-center py-0.5">
          <span className="text-[7.5px] font-mono font-black uppercase tracking-[0.25em] text-zinc-600">
            KODAK 5219 &middot; 35MM &middot; 24FPS &middot; SHUTTER 180&deg; &middot; FRAME #024
          </span>
        </div>
      </div>

      {/* ── 6. ALT DOCK BAR (SAFE-AREA UYUMLU, SABİT NAVİGASYON) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 z-40 max-w-md mx-auto"
        style={{
          background: "rgba(7,8,11,0.98)",
          borderTop: "1px solid #1a1c24",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.6)",
          paddingTop: "0.5rem",
          paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))",
        }}
      >
        {[
          { label: "Lobi", icon: Home, color: "#8b151b", active: true, act: undefined },
          { label: "Günlük", icon: Clock, color: "#d97706", active: false, act: onOpenDaily },
          { label: "Sıralama", icon: Trophy, color: "#f59e0b", active: false, act: onOpenLeaderboard },
          { label: "İkonlar", icon: Sparkles, color: "#a855f7", active: false, act: onOpenShop },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={tab.act}
              className="flex flex-col items-center transition-all active:scale-95 px-3 py-1"
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
