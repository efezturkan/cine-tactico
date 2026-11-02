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
            className="text-[5px] font-mono font-bold text-[#F5A623]/55 tracking-tighter uppercase -rotate-90 py-1 select-none shrink-0"
            style={{ transformOrigin: "center center" }}
          >
            KODAK
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
      : activeTheme?.secondaryAccent || "#F5A623";

  const safeDimness =
    typeof ambience.dimness === "number" && !isNaN(ambience.dimness)
      ? ambience.dimness
      : 85;
  const safeGlow =
    typeof ambience.glowIntensity === "number" && !isNaN(ambience.glowIntensity)
      ? ambience.glowIntensity
      : 65;

  const isCyanMode = activeModeMeta.accent === "cyan";
  const heroAccentHex = isCyanMode ? "#00D5E8" : "#F5A623";

  return (
    <div
      className="w-full max-w-full sm:max-w-[430px] mx-auto h-[100dvh] sm:h-auto sm:min-h-[860px] text-[#F1EEE7] flex flex-col justify-between relative select-none antialiased overflow-hidden transition-colors duration-500 sm:my-4 sm:rounded-[36px] sm:border-2 sm:border-[#252932] sm:shadow-2xl"
      style={{
        backgroundColor: activeTheme?.bgColor || "#0F1115",
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
        {/* ── 1. TOP BAR: PLAYER IDENTITY & CLEAN CONTROLS ─── */}
        <header className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              haptic.light();
              onOpenProfileModal();
            }}
            className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-white/5 active:translate-y-[1px] transition-all text-left min-w-0 group"
            title="Sinefil Pasaportu & İstatistikler"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(180deg, #252932 0%, #14171E 100%)",
                border: `1.5px solid ${effectiveCornerColor}`,
                borderBottom: `3px solid ${effectiveCornerColor}`,
                boxShadow:
                  "0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="leading-none select-none">
                {currentAvatar.emoji}
              </span>
            </div>

            <div className="min-w-0 flex flex-col">
              <span className="text-xs sm:text-sm font-extrabold text-[#F1EEE7] truncate max-w-[140px] leading-tight">
                {profile.username === "Oyuncu"
                  ? "Sinefil #3095"
                  : profile.username}
              </span>
              <span className="text-[10px] font-semibold text-[#A5A8B0] truncate leading-tight mt-0.5">
                Profil &amp; İstatistikler &rarr;
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleMute && (
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  onToggleMute();
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#A5A8B0] hover:text-[#F1EEE7] tactile-btn-surface"
                title="Sesi Aç / Kapat"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-[#A5A8B0]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#F5A623]" />
                )}
              </button>
            )}

            {onOpenLiveAmbience && (
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  haptic.light();
                  onOpenLiveAmbience();
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#A5A8B0] hover:text-[#F1EEE7] tactile-btn-surface"
                title="Salon Işıkları & Ambiyans"
              >
                <Sliders className="w-4 h-4 text-[#F5A623]" />
              </button>
            )}

            {onOpenHelp && (
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  haptic.light();
                  onOpenHelp();
                }}
                aria-label="Nasıl Oynanır"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#A5A8B0] hover:text-[#F1EEE7] tactile-btn-surface"
                title="Nasıl Oynanır?"
              >
                <HelpCircle className="w-4 h-4 text-[#F5A623]" />
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

        {/* ── 3. SINGLE-FOCUS HERO DUEL STAGE ─── */}
        <div
          className="w-full p-5 sm:p-6 rounded-3xl relative overflow-hidden transition-all"
          style={{
            background:
              "linear-gradient(160deg, #232834 0%, #161922 65%, #111319 100%)",
            border: `1.5px solid ${heroAccentHex}55`,
            borderBottom: `4px solid ${isCyanMode ? "#0E7490" : "#78350F"}`,
          }}
        >
          {/* Viewfinder Framing Brackets */}
          <div
            className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 pointer-events-none rounded-tl-sm"
            style={{ borderColor: heroAccentHex }}
          />
          <div
            className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 pointer-events-none rounded-tr-sm"
            style={{ borderColor: heroAccentHex }}
          />
          <div
            className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 pointer-events-none rounded-bl-sm"
            style={{ borderColor: heroAccentHex }}
          />
          <div
            className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 pointer-events-none rounded-br-sm"
            style={{ borderColor: heroAccentHex }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-[26px] font-serif font-bold text-[#F1EEE7] tracking-wide leading-tight">
              {activeModeMeta.title}
            </h2>

            <p className="text-xs sm:text-[13px] text-[#A5A8B0] font-medium mt-1 max-w-[290px] leading-snug">
              {activeModeMeta.heroSummary}
            </p>

            {/* Primary Centered 3D Tactile Action Button */}
            <button
              type="button"
              data-testid="hero-start-duel-btn"
              onClick={handleLaunchDuel}
              className="w-full mt-4 py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-transform active:translate-y-[2px] cursor-pointer"
              style={{
                background:
                  "linear-gradient(180deg, #FFB838 0%, #F5A623 100%)",
                color: "#0F1115",
                border: "1.5px solid #FFD27D",
                borderBottom: "4px solid #A36207",
                boxShadow: "0 3px 0 #A36207",
              }}
            >
              <Play className="w-4 h-4 fill-[#0F1115] shrink-0" />
              <span>DÜELLOYA GİR</span>
            </button>
          </div>
        </div>

        {/* ── 4. THREE SIMPLIFIED MODE SELECTOR CARDS ─── */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#A5A8B0]">
              OYUN MODU SEÇİMİ
            </span>
            <button
              type="button"
              onClick={() => {
                audio.playSelect();
                haptic.light();
                if (onOpenGameModesHub) onOpenGameModesHub();
                else if (onOpenGameSelect) onOpenGameSelect();
              }}
              className="text-[10px] font-mono font-bold text-[#F5A623] hover:text-amber-300 transition-colors cursor-pointer"
            >
              Tahta Arşivi &rarr;
            </button>
          </div>

          <div
            className="grid grid-cols-3 gap-2.5"
            role="radiogroup"
            aria-label="Oyun Modu Seçimi"
          >
            {MODE_DEFINITIONS.map((m) => {
              const Icon = m.icon;
              const isSelected = activeMode === m.id;
              const isCyan = m.accent === "cyan";
              const accentColor = isCyan ? "#00D5E8" : "#F5A623";
              const bottomBorderColor = isCyan ? "#0E7490" : "#9A5B0A";

              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`mode-card-${m.id}`}
                  onClick={() => handleSelectModeCard(m.id)}
                  className="min-h-[88px] sm:min-h-[94px] p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all active:translate-y-[2px] relative cursor-pointer"
                  style={{
                    background: isSelected
                      ? isCyan
                        ? "linear-gradient(180deg, rgba(0,213,232,0.18) 0%, #161B24 100%)"
                        : "linear-gradient(180deg, rgba(245,166,35,0.18) 0%, #1A1D24 100%)"
                      : "linear-gradient(180deg, #1B1F28 0%, #13161D 100%)",
                    border: isSelected
                      ? `2px solid ${accentColor}`
                      : "1.5px solid #262B36",
                    borderBottom: isSelected
                      ? `4px solid ${bottomBorderColor}`
                      : "3.5px solid #0B0D12",
                    boxShadow: "none",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? `${accentColor}22`
                        : "rgba(255,255,255,0.04)",
                      color: isSelected ? accentColor : "#A5A8B0",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className="text-xs font-extrabold leading-tight tracking-tight"
                    style={{
                      color: isSelected ? "#F1EEE7" : "#A5A8B0",
                    }}
                  >
                    {m.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 5. SECONDARY MULTIPLAYER & DAILY ACCESS ─── */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              haptic.light();
              onOpenDaily();
            }}
            className="p-3 rounded-2xl flex items-center gap-3 text-left transition-all active:translate-y-[2px] tactile-card-interactive"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F5A623]/15 border border-[#F5A623]/35 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#F5A623]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-[#F1EEE7] block truncate">
                Günün Kadresi
              </span>
              <span className="text-[10px] font-medium text-[#A5A8B0] block truncate">
                Sabit 3×3 Matris
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              haptic.light();
              onOpenCustomLobby();
            }}
            className="p-3 rounded-2xl flex items-center gap-3 text-left transition-all active:translate-y-[2px] tactile-card-interactive"
          >
            <div className="w-9 h-9 rounded-xl bg-[#00D5E8]/15 border border-[#00D5E8]/35 flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4 text-[#00D5E8]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-[#F1EEE7] block truncate">
                Özel Oda (1v1)
              </span>
              <span className="text-[10px] font-medium text-[#A5A8B0] block truncate">
                Kodla Düello
              </span>
            </div>
          </button>
        </div>

      </div>

      {/* ── 6. BOTTOM NAVIGATION BAR ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 sm:px-3 z-40 max-w-[430px] mx-auto w-full"
        style={{
          background: "rgba(15, 17, 21, 0.96)",
          borderTop: "1.5px solid #252932",
          backdropFilter: "blur(12px)",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
          paddingTop: "0.45rem",
          paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))",
        }}
      >
        {[
          {
            label: "Lobi",
            icon: Home,
            color: "#F5A623",
            active: true,
            act: undefined,
          },
          {
            label: "Arenalar",
            icon: Film,
            color: "#00D5E8",
            active: false,
            act: () => {
              audio.playSelect();
              if (onOpenGameModesHub) onOpenGameModesHub();
              else if (onOpenGameSelect) onOpenGameSelect();
            },
          },
          {
            label: "Özel Oda",
            icon: Swords,
            color: "#00D5E8",
            active: false,
            act: () => {
              audio.playSelect();
              onOpenCustomLobby();
            },
          },
          {
            label: "Profil",
            icon: User,
            color: "#F5A623",
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
              className={`flex flex-col items-center transition-all active:scale-95 px-4 py-1 rounded-xl ${
                tab.active
                  ? "bg-[#252932]/90 border border-white/10"
                  : "hover:bg-white/5"
              }`}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: tab.active ? tab.color : "#A5A8B0" }}
              />
              <span
                className="text-[9px] font-extrabold mt-0.5 uppercase tracking-wide"
                style={{ color: tab.active ? tab.color : "#A5A8B0" }}
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
