"use client";

import React from "react";
import {
  Clapperboard,
  Users,
  Compass,
  Ticket,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { PRESET_BOARDS, FEATURED_BOARD_IDS } from "@/data/boards";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { useTranslation } from "@/i18n";
import { getDailyEditionNumber } from "@/utils/dateUtils";
import { BottomNav } from "./ui/BottomNav";

export type VizyonModeKey = "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT";

interface GameSelectScreenProps {
  onBack: () => void;
  onStartMode: (mode: VizyonModeKey) => void;
  onOpenDaily: () => void;
  onSelectBoard: (boardIndex: number, mode: "VS_BOT") => void;
  onOpenCustomLobby: () => void;
  onOpenProfileModal?: () => void;
  onOpenHowToPlay?: () => void;
}

export const GameSelectScreen: React.FC<GameSelectScreenProps> = ({
  onBack,
  onStartMode,
  onOpenDaily,
  onSelectBoard,
  onOpenCustomLobby,
  onOpenProfileModal,
  onOpenHowToPlay,
}) => {
  const { dict, locale, tBoardTitle } = useTranslation();
  const isEn = locale === "en";

  const modes: {
    id: VizyonModeKey;
    title: string;
    sub: string;
    desc: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "CLASSIC",
      title: dict.home.modes.classicTitle,
      sub: dict.home.modes.classicSub,
      desc: dict.home.modes.classicDesc,
      color: "#D9A441",
      icon: Clapperboard,
    },
    {
      id: "REVERSE_CAST",
      title: dict.home.modes.reverseTitle,
      sub: dict.home.modes.reverseSub,
      desc: dict.home.modes.reverseDesc,
      color: "#5FB3A8",
      icon: Users,
    },
    {
      id: "CINE_CONCEPT",
      title: dict.home.modes.conceptTitle,
      sub: dict.home.modes.conceptSub,
      desc: dict.home.modes.conceptDesc,
      color: "#9A8FD8",
      icon: Compass,
    },
  ];

  const featured = FEATURED_BOARD_IDS.map((id) => {
    const index = PRESET_BOARDS.findIndex((b) => b.id === id);
    return index === -1 ? null : { index, board: PRESET_BOARDS[index] };
  }).filter((x): x is { index: number; board: (typeof PRESET_BOARDS)[number] } => x !== null);

  const tap = (fn: () => void) => () => {
    audio.playSelect();
    haptic.light();
    fn();
  };

  return (
    <div className="w-full max-w-[430px] min-h-[100dvh] flex flex-col font-sans bg-[#0B0D12] select-none">
      {/* Başlık: Sinefil Kartı ile aynı serif başlık dili */}
      <header className="relative flex items-center justify-center px-4 pt-8 pb-3">
        <h1 className="text-3xl font-serif font-bold text-[#F1EEE7] tracking-wide text-center">
          {dict.nav.gameSelect}
        </h1>
        {onOpenHowToPlay && (
          <button
            type="button"
            onClick={tap(onOpenHowToPlay)}
            className="absolute right-3 top-8 w-11 h-11 flex items-center justify-center text-[#8A8F9A] hover:text-[#F1EEE7] transition-colors"
            aria-label={isEn ? "How to play" : "Nasıl oynanır"}
          >
            <HelpCircle className="w-5 h-5 stroke-[1.5]" />
          </button>
        )}
      </header>

      <main className="flex-1 px-4 pb-28 space-y-6">
        <div className="h-px bg-white/10 mx-6" />

        {/* 1. MODLAR */}
        <section className="space-y-2">
          <span className="px-1 text-[10px] font-semibold tracking-wider uppercase text-[#8A8F9A]">
            {isEn ? "Modes" : "Modlar"}
          </span>
          <div className="grid grid-cols-2 gap-3">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  data-testid={`vizyon-mode-${m.id}`}
                  onClick={tap(() => onStartMode(m.id))}
                  className="relative p-3.5 rounded-2xl text-left flex flex-col gap-2 bg-[#14171D] border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all min-h-[148px]"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${m.color}26`, color: m.color }}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-serif font-bold text-[15px] leading-tight text-[#F1EEE7]">
                      {m.title}
                    </span>
                    <span className="block text-[10px] font-medium mt-0.5" style={{ color: m.color }}>
                      {m.sub}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug text-[#8A8F9A] line-clamp-3">{m.desc}</p>
                </button>
              );
            })}

            {/* 4. mod: Günün Kadrası (bilet kupürü diliyle) */}
            <button
              type="button"
              data-testid="vizyon-mode-DAILY"
              onClick={tap(onOpenDaily)}
              className="relative p-3.5 rounded-2xl text-left flex flex-col gap-2 bg-[#14171D] border border-dashed border-[#C9A27A]/45 hover:border-[#C9A27A]/70 active:scale-[0.98] transition-all min-h-[148px]"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#C9A27A]/15 text-[#C9A27A]">
                <Ticket className="w-[18px] h-[18px]" />
              </div>
              <div className="min-w-0">
                <span className="block font-serif font-bold text-[15px] leading-tight text-[#F1EEE7]">
                  {dict.home.dailyBoardTitle}
                </span>
                <span className="block text-[10px] font-mono font-bold mt-0.5 text-[#C9A27A]">
                  NO.{getDailyEditionNumber()}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-[#8A8F9A] line-clamp-3">
                {dict.home.dailyBoardSub}
              </p>
            </button>
          </div>
        </section>

        {/* 2. BU HAFTA VİZYONDA */}
        {featured.length > 0 && (
          <section className="space-y-2">
            <span className="px-1 text-[10px] font-semibold tracking-wider uppercase text-[#8A8F9A]">
              {isEn ? "Playing this week" : "Bu hafta vizyonda"}
            </span>
            <div className="space-y-2.5">
              {featured.map(({ index, board }) => {
                const full = tBoardTitle(board.title);
                const [head, tail] = full.includes(":")
                  ? [full.split(":")[0].trim(), full.split(":").slice(1).join(":").trim()]
                  : [full, ""];
                return (
                  <button
                    key={board.id}
                    type="button"
                    data-testid={`vizyon-featured-${board.id}`}
                    onClick={tap(() => onSelectBoard(index, "VS_BOT"))}
                    className="w-full p-3.5 rounded-2xl flex items-center gap-3 text-left bg-[#14171D] border border-white/10 hover:border-[#D9A441]/50 active:scale-[0.98] transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block font-serif font-bold text-[15px] leading-tight text-[#F1EEE7]">
                        {head}
                      </span>
                      {tail && (
                        <span className="block text-[11px] text-[#8A8F9A] mt-0.5 leading-snug">
                          {tail}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#D9A441] shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <BottomNav
        activeTab="GAME_SELECT"
        onSelectTab={(tabId) => {
          if (tabId === "HOME") {
            onBack();
          } else if (tabId === "CUSTOM_ROOM") {
            onOpenCustomLobby();
          } else if (tabId === "PROFILE") {
            if (onOpenProfileModal) onOpenProfileModal();
            else onBack();
          }
        }}
      />
    </div>
  );
};

export default GameSelectScreen;
