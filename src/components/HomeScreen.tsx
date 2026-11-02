"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Play,
  Film,
  Clock,
  Sparkles,
  Home,
  Swords,
  Clapperboard,
  HelpCircle,
  Users,
  Compass,
  Volume2,
  VolumeX,
  User,
  Flame,
  Settings,
  Ticket,
} from "lucide-react";
import {
  UserProfile,
  AVATAR_OPTIONS,
  AMBIENCE_THEMES,
  DEFAULT_AMBIENCE,
  CORNER_ACCENT_COLORS,
} from "@/types/profile";
import { ContentPoolType } from "@/core";
import { FLAGS } from "@/config/flags";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { QuickMatchSetupModal } from "@/features/multiplayer";

export type ArenaModeKey = "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT";

interface HomeScreenProps {
  profile: UserProfile;
  selectedMode?: ArenaModeKey;
  onSelectMode?: (mode: ArenaModeKey) => void;
  onStartGame: (
    modeName: string,
    difficulty: "EASY" | "NORMAL" | "HARD",
    contentPool?: ContentPoolType
  ) => void;
  onDirectStartMode?: (
    mode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL"
  ) => void;
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

// 35mm film edge perforations
const SprocketStrip = () => (
  <div className="flex flex-col items-center gap-[8px] py-2 h-full overflow-hidden select-none pointer-events-none">
    {Array.from({ length: 55 }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          style={{
            width: 7,
            height: 5,
            background: "#050608",
            borderRadius: 2,
            border: "1px solid #252932",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9)",
            flexShrink: 0,
          }}
        />
        {i % 9 === 4 && (
          <span
            className="text-[5px] font-mono font-bold text-[#D9A441]/55 tracking-tighter uppercase -rotate-90 py-1 select-none shrink-0"
            style={{ transformOrigin: "center center" }}
          >
            35MM
          </span>
        )}
      </React.Fragment>
    ))}
  </div>
);

const MODE_DEFINITIONS: {
  id: ArenaModeKey;
  title: string;
  heroSummary: string;
  accent: "amber" | "cyan";
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "CLASSIC",
    title: "Klasik Düello",
    heroSummary: "Yönetmen / Tür × Oyuncu kesişiminde ortak filmi bul",
    accent: "amber",
    icon: Clapperboard,
  },
  {
    id: "REVERSE_CAST",
    title: "Ters Kadraj",
    heroSummary: "İki farklı filmin kesişimindeki ortak oyuncuyu bul",
    accent: "cyan",
    icon: Users,
  },
  {
    id: "CINE_CONCEPT",
    title: "Sinefil Konsept",
    heroSummary: "Kült temalar, dönemler ve anlatı kriterlerinde filmi bul",
    accent: "amber",
    icon: Compass,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  selectedMode,
  onSelectMode,
  onStartGame,
  onDirectStartMode,
  onOpenProfileModal,
  onOpenCustomLobby,
  onOpenDaily,
  onOpenGameModesHub,
  onOpenGameSelect,
  onOpenLiveAmbience,
  onOpenHelp,
  muted = false,
  onToggleMute,
}) => {
  const [showQuickSetup, setShowQuickSetup] = useState<boolean>(false);
  const [internalMode, setInternalMode] = useState<ArenaModeKey>(
    selectedMode || "CLASSIC"
  );

  useEffect(() => {
    if (selectedMode) {
      setInternalMode(selectedMode);
    }
  }, [selectedMode]);

  const activeMode: ArenaModeKey = selectedMode || internalMode;
  const activeModeMeta =
    MODE_DEFINITIONS.find((m) => m.id === activeMode) || MODE_DEFINITIONS[0];

  const handleSelectModeCard = (modeKey: ArenaModeKey) => {
    audio.playSelect();
    haptic.light();
    setInternalMode(modeKey);
    if (onSelectMode) {
      onSelectMode(modeKey);
    }
  };

  const handleLaunchDuel = () => {
    audio.playSelect();
    haptic.medium();
    if (onDirectStartMode) {
      onDirectStartMode(activeMode);
    } else {
      onStartGame(activeMode, "NORMAL", "FILM");
    }
  };

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  const ambience = { ...DEFAULT_AMBIENCE, ...(profile?.ambience || {}) };
  const activeTheme =
    (ambience.theme && AMBIENCE_THEMES[ambience.theme]) ||
    AMBIENCE_THEMES.velvet_red;

  const effectiveCornerColor =
    ambience.cornerAccent &&
    ambience.cornerAccent !== "AUTO" &&
    CORNER_ACCENT_COLORS[ambience.cornerAccent]
      ? CORNER_ACCENT_COLORS[ambience.cornerAccent].color
      : activeTheme?.secondaryAccent || "#D9A441";

  const safeDimness =
    typeof ambience.dimness === "number" && !isNaN(ambience.dimness)
      ? ambience.dimness
      : 85;
  const safeGlow =
    typeof ambience.glowIntensity === "number" && !isNaN(ambience.glowIntensity)
      ? ambience.glowIntensity
      : 65;

  const isCyanMode = activeModeMeta.accent === "cyan";
  const heroAccentHex = isCyanMode ? "#4FA3C7" : "#D9A441";

  return (
    <div
      className="w-full max-w-full sm:max-w-[430px] mx-auto h-[100dvh] sm:h-auto sm:min-h-[860px] text-[#E8E6E1] flex flex-col justify-between relative select-none antialiased overflow-hidden transition-colors duration-500 sm:my-4 sm:rounded-[36px] sm:border-2 sm:border-[#181B22] sm:shadow-2xl"
      style={{
        backgroundColor: activeTheme?.bgColor || "#0B0D12",
        filter: `brightness(${Math.min(1.1, Math.max(0.7, safeDimness / 85))})`,
      }}
    >
      {/* ── 35mm Sprocket Borders ─── */}
      <div
        className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{
          width: 13,
          background: "linear-gradient(90deg, #06080B 0%, #0C0F15 100%)",
          borderRight: "1px solid #1C2028",
        }}
      >
        <SprocketStrip />
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 overflow-hidden pointer-events-none z-0"
        style={{
          width: 13,
          background: "linear-gradient(270deg, #06080B 0%, #0C0F15 100%)",
          borderLeft: "1px solid #1C2028",
        }}
      >
        <SprocketStrip />
      </div>

      {/* ── 35mm Film Grain Layer ─── */}
      {ambience.grain && ambience.grain !== "OFF" && (
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-300"
          style={{
            opacity: ambience.grain === "VINTAGE" ? 0.14 : 0.06,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* ── Top Ambient Accent Line ─── */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 pointer-events-none z-10 transition-colors duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${effectiveCornerColor} 30%, ${effectiveCornerColor} 70%, transparent)`,
        }}
      />

      {/* ── MAIN LOBBY CONTENT (NO SCROLL ON 390x844 & 430x932) ─── */}
      <div className="px-4 sm:px-5 relative z-10 flex-1 flex flex-col justify-between pt-3 pb-20 w-full min-w-0 max-w-full">
        {/* ── 1. TOP BAR: AVATAR + İSİM, SERİ SAYISI, SES, AYARLAR ─── */}
        <header className="flex items-center justify-between gap-2">
          {/* Avatar + İsim */}
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              haptic.light();
              onOpenProfileModal();
            }}
            className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-white/5 active:translate-y-[1px] transition-all text-left min-w-0 group"
            title="Sinefil Kartı"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: "#14171D",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span className="leading-none select-none">
                {currentAvatar.emoji}
              </span>
            </div>

            <div className="min-w-0 flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-[#E8E6E1] truncate max-w-[120px] leading-tight">
                {profile.username === "Oyuncu"
                  ? "Sinefil #3095"
                  : profile.username}
              </span>
              <span className="text-[10px] text-[#8A8F9A] truncate leading-tight mt-0.5">
                Sinefil Kartı &rarr;
              </span>
            </div>
          </button>

          {/* Sağ Bölüm: Seri Sayısı + Ses Toggle + Ayarlar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Seri Sayısı */}
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#14171D] border border-white/10 text-xs font-mono font-bold text-[#D9A441]"
              title={`Galibiyet Serisi: ${profile.dailyStreak || 1}`}
            >
              <Flame className="w-3.5 h-3.5 fill-[#D9A441] text-[#D9A441]" />
              <span>{profile.dailyStreak || 1}</span>
            </div>

            {/* Ses Aç / Kapat */}
            {onToggleMute && (
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  onToggleMute();
                }}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[#8A8F9A] hover:text-[#E8E6E1] tactile-btn-surface"
                title="Sesi Aç / Kapat"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-[#8A8F9A]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#D9A441]" />
                )}
              </button>
            )}

            {/* Ayarlar */}
            <button
              type="button"
              onClick={() => {
                audio.playSelect();
                haptic.light();
                onOpenProfileModal();
              }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[#8A8F9A] hover:text-[#E8E6E1] tactile-btn-surface"
              title="Ayarlar & Profil"
            >
              <Settings className="w-4 h-4 text-[#8A8F9A]" />
            </button>

            {/* FLAGS arkasındaki Ambiyans ve Yardım (UI'da gizli) */}
            {FLAGS.SHOW_HEADER_AMBIENCE_BUTTON && onOpenLiveAmbience && (
              <button
                type="button"
                onClick={onOpenLiveAmbience}
                className="w-9 h-9 rounded-xl flex items-center justify-center tactile-btn-surface"
              >
                <Sliders className="w-4 h-4 text-[#D9A441]" />
              </button>
            )}
            {FLAGS.SHOW_HEADER_HELP_BUTTON && onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="w-9 h-9 rounded-xl flex items-center justify-center tactile-btn-surface"
              >
                <HelpCircle className="w-4 h-4 text-[#D9A441]" />
              </button>
            )}
          </div>
        </header>

        {/* ── 2. EDITORIAL CINEMA BRAND HEADER ─── */}
        <div className="text-center my-1">
          <h1 className="text-3xl sm:text-4xl font-serif tracking-[0.16em] text-[#F1EEE7] leading-none">
            CINE
            <span
              style={{ color: effectiveCornerColor }}
              className="italic font-serif"
            >
              ·
            </span>
            XOX
          </h1>
          <p className="text-xs text-[#A5A8B0] font-medium mt-1">
            3×3 Sinematik Taktik Düellosu
          </p>
        </div>

        {/* ── 3. SINGLE-FOCUS HERO DUEL STAGE (DESIGN.md Düz Kart, 1px Çerçeve, Viewfinder Köşeleri, Altın Buton) ─── */}
        <div
          className="w-full p-4 sm:p-5 rounded-2xl relative overflow-hidden transition-all bg-[#14171D] border border-white/10"
        >
          {/* Viewfinder Framing Brackets (İmza Öğesi 2) */}
          <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#D9A441] pointer-events-none rounded-tl-sm" />
          <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#D9A441] pointer-events-none rounded-tr-sm" />
          <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#D9A441] pointer-events-none rounded-bl-sm" />
          <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#D9A441] pointer-events-none rounded-br-sm" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F1EEE7] tracking-wide leading-tight">
              {activeModeMeta.title}
            </h2>

            <p className="text-xs sm:text-[13px] text-[#8A8F9A] font-medium mt-1 max-w-[290px] leading-snug truncate">
              {activeModeMeta.heroSummary}
            </p>

            {/* Primary Centered 3D Tactile Action Button */}
            <button
              type="button"
              data-testid="hero-start-duel-btn"
              onClick={handleLaunchDuel}
              className="w-full mt-3.5 py-3 sm:py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-transform active:translate-y-[2px] cursor-pointer tactile-btn-amber"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>DÜELLOYA GİR</span>
            </button>
          </div>
        </div>

        {/* ── 4. YATAY KAYDIRMALI MOD AFİŞLERİ (TUR 2 Madde 4) ─── */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#8A8F9A]">
              VİZYONDAKİ MODLAR
            </span>
          </div>

          <div
            className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5 snap-x overscroll-x-contain"
            role="radiogroup"
            aria-label="Oyun Modu Seçimi"
          >
            {MODE_DEFINITIONS.map((m) => {
              const Icon = m.icon;
              const isSelected = activeMode === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`mode-card-${m.id}`}
                  onClick={() => handleSelectModeCard(m.id)}
                  className={`flex-1 min-w-[105px] sm:min-w-[115px] p-3 rounded-2xl flex flex-col items-center justify-between text-center gap-2 transition-all active:scale-[0.98] relative cursor-pointer snap-start shrink-0 select-none ${
                    isSelected
                      ? "border-[1.5px] border-[#D9A441]"
                      : "border border-white/10 hover:border-white/20"
                  }`}
                  style={{
                    background: isSelected
                      ? "linear-gradient(180deg, #1C2028 0%, #14171D 100%)"
                      : "#14171D",
                  }}
                >
                  {/* Seçili İndikatörü */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D9A441]" />
                  )}

                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(217, 164, 65, 0.15)"
                        : "rgba(255, 255, 255, 0.04)",
                      color: isSelected ? "#D9A441" : "#8A8F9A",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <span
                      className="text-xs font-serif font-bold leading-tight block truncate"
                      style={{
                        color: isSelected ? "#F1EEE7" : "#8A8F9A",
                      }}
                    >
                      {m.title}
                    </span>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[#8A8F9A]/70 block mt-0.5">
                      {m.id === "CLASSIC"
                        ? "KLASİK"
                        : m.id === "REVERSE_CAST"
                        ? "KADRO"
                        : "KONSEPT"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 5. GÜNÜN KADRASI (BİLET KUPÜRÜ GÖRÜNÜMÜ - DESIGN.md Kural 5) ─── */}
        <button
          type="button"
          onClick={() => {
            audio.playSelect();
            haptic.light();
            onOpenDaily();
          }}
          className="w-full relative p-3 sm:p-3.5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer overflow-hidden text-left bg-[#14171D] border border-dashed border-[#D9A441]/35 hover:border-[#D9A441]/60"
        >
          {/* Sol ve Sağ Bilet Kupürü Çentikleri */}
          <div
            className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
            style={{
              background: "#0B0D12",
              border: "1px solid rgba(217, 164, 65, 0.35)",
            }}
          />
          <div
            className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
            style={{
              background: "#0B0D12",
              border: "1px solid rgba(217, 164, 65, 0.35)",
            }}
          />

          {/* Sol Kupür İkon ve Kod */}
          <div className="flex items-center gap-3 pl-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#181B22] border border-[#D9A441]/40 flex flex-col items-center justify-center shrink-0">
              <Ticket className="w-4 h-4 text-[#D9A441]" />
              <span className="text-[7px] font-mono text-[#D9A441] font-bold">
                NO.01
              </span>
            </div>

            {/* Perfore Delikli Ayrım Çizgisi */}
            <div className="h-8 w-px border-r border-dashed border-white/15 shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#F1EEE7]">
                  Günün Kadrası
                </span>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#D9A441]/15 text-[#D9A441]">
                  GÜNLÜK
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#8A8F9A] font-medium truncate mt-0.5">
                Günde bir sabit kadraj · Paylaşılabilir sonuç
              </p>
            </div>
          </div>

          <div className="pr-2 shrink-0">
            <span className="text-xs font-bold text-[#D9A441] font-mono flex items-center gap-0.5">
              Bileti Aç &rarr;
            </span>
          </div>
        </button>

        {/* ── SIGNATURE FOOTER MICRO-LABEL (35MM · 24 FPS) ─── */}
        <div className="pt-2 pb-1 text-center select-none pointer-events-none">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#E8E6E1]/30">
            35MM · 24 FPS
          </p>
        </div>

      </div>

      {/* ── 6. BOTTOM NAVIGATION BAR (DESIGN.md 4 Sekme: Gişe, Vizyondakiler, Özel Gösterim, Sinefil Kartı) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 sm:px-3 z-40 max-w-[430px] mx-auto w-full"
        style={{
          background: "rgba(11, 13, 18, 0.96)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          paddingTop: "0.45rem",
          paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))",
        }}
      >
        {[
          {
            label: "Gişe",
            icon: Ticket,
            active: true,
            act: undefined,
          },
          {
            label: "Vizyondakiler",
            icon: Film,
            active: false,
            act: () => {
              audio.playSelect();
              if (onOpenGameSelect) onOpenGameSelect();
              else if (onOpenGameModesHub) onOpenGameModesHub();
            },
          },
          {
            label: "Özel Gösterim",
            icon: Swords,
            active: false,
            act: () => {
              audio.playSelect();
              onOpenCustomLobby();
            },
          },
          {
            label: "Sinefil Kartı",
            icon: User,
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
              type="button"
              onClick={tab.act}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] transition-all active:scale-95 px-3 py-1 rounded-xl ${
                tab.active
                  ? "bg-[#181B22] border border-[#D9A441]/40"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon
                className="w-4 h-4 stroke-[1.8]"
                style={{ color: tab.active ? "#D9A441" : "#8A8F9A" }}
              />
              <span
                className="text-[9px] font-bold mt-0.5 tracking-wide"
                style={{ color: tab.active ? "#D9A441" : "#8A8F9A" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Quick Match Setup Modal ─── */}
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
