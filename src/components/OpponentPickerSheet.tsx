"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { BOT_OPPONENTS, BotOpponentProfile, BotStyle } from "@/data/boards";
import { AvatarIcon } from "@/components/ui/AvatarIcon";
import { Button } from "@/components/ui/Button";
import { BotDifficulty } from "@/core";
import { BotRecordBook } from "@/utils/botRecord";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { useTranslation } from "@/i18n";

interface OpponentPickerSheetProps {
  isOpen: boolean;
  records: BotRecordBook;
  onPick: (bot: BotOpponentProfile) => void;
  onClose: () => void;
}

const TIERS: { id: BotDifficulty; color: string }[] = [
  { id: "EASY", color: "#8A8F9A" },
  { id: "MEDIUM", color: "#C9A27A" },
  { id: "HARD", color: "#D9A441" },
];

let lastSelectedTier: BotDifficulty = "MEDIUM";

/** Her seviyeden bir rakip: sayfa her açıldığında farklı kişiler çıkar. */
function drawOpponents(): BotOpponentProfile[] {
  return TIERS.map(({ id }) => {
    const pool = BOT_OPPONENTS.filter((b) => b.difficulty === id);
    return pool[Math.floor(Math.random() * pool.length)];
  });
}

/**
 * Rakip seçimi (Yaklaşım B): 3 yan yana karakter portresi + seçili rakibin unvanı/repliği + tek KARŞILAŞ butonu.
 * Varsayılan rakip ön-seçili gelir; oyuncu tek dokunuşla düelloya girebilir.
 */
export const OpponentPickerSheet: React.FC<OpponentPickerSheetProps> = ({
  isOpen,
  records,
  onPick,
  onClose,
}) => {
  const { dict, locale, tBotName, tBot } = useTranslation();
  const isEn = locale === "en";
  const opponents = useMemo(() => (isOpen ? drawOpponents() : []), [isOpen]);
  const [selectedTier, setSelectedTier] = useState<BotDifficulty>(lastSelectedTier);
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTier(lastSelectedTier);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || opponents.length === 0) return null;

  const tierLabel: Record<BotDifficulty, string> = {
    EASY: dict.opponent.easy,
    MEDIUM: dict.opponent.medium,
    HARD: dict.opponent.hard,
  };
  const styleLabel: Record<BotStyle, string> = {
    CAUTIOUS: dict.opponent.styleCautious,
    BALANCED: dict.opponent.styleBalanced,
    AGGRESSIVE: dict.opponent.styleAggressive,
    CULT: dict.opponent.styleCult,
  };

  const activeBot =
    opponents.find((b) => b.difficulty === selectedTier) || opponents[1] || opponents[0];
  const activeRec = records[activeBot.name];
  const activePlayed = Boolean(activeRec && activeRec.w + activeRec.l + activeRec.d > 0);

  const launchBot = (bot: BotOpponentProfile) => {
    lastSelectedTier = bot.difficulty;
    audio.playSelect();
    haptic.medium();
    onPick(bot);
  };

  const stepRadio = (currentIndex: number, delta: number) => {
    const nextIndex = (currentIndex + delta + opponents.length) % opponents.length;
    const nextBot = opponents[nextIndex];
    if (!nextBot) return;
    audio.playSelect();
    haptic.light();
    lastSelectedTier = nextBot.difficulty;
    setSelectedTier(nextBot.difficulty);
    radioRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.opponent.title}
      className="fixed inset-0 z-50 flex items-center justify-center px-3.5 py-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/72 select-none animate-in fade-in duration-150 motion-reduce:animate-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm max-h-full overflow-y-auto overscroll-contain bg-[#14171D] border border-white/10 rounded-[24px] p-4 shadow-2xl animate-in zoom-in-95 fade-in duration-200 motion-reduce:animate-none">
        {/* Başlık + Kapat */}
        <div className="flex items-center justify-between pl-1 pb-3">
          <h2 className="font-serif text-xl font-bold text-[#E8E6E1] text-balance">
            {dict.opponent.title}
          </h2>
          <Button
            variant="icon"
            onClick={onClose}
            title={dict.opponent.cancel}
            aria-label={dict.opponent.cancel}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        {/* 3 Yan Yana Karakter Portresi */}
        <div
          className="grid grid-cols-3 gap-2.5"
          role="radiogroup"
          aria-label={dict.opponent.title}
        >
          {opponents.map((bot, i) => {
            const tier = TIERS[i];
            const isSelected = bot.difficulty === activeBot.difficulty;

            return (
              <button
                key={bot.name}
                ref={(el) => {
                  radioRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                data-testid={`opponent-${bot.difficulty}`}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    stepRadio(i, 1);
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    stepRadio(i, -1);
                  }
                }}
                onClick={() => {
                  if (isSelected) {
                    launchBot(bot);
                    return;
                  }
                  audio.playSelect();
                  haptic.light();
                  lastSelectedTier = bot.difficulty;
                  setSelectedTier(bot.difficulty);
                }}
                className={`rounded-2xl p-2 sm:p-2.5 flex flex-col items-center text-center touch-manipulation transition-[transform,opacity,border-color,background-color] duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A441] ${
                  isSelected
                    ? "bg-[#181B22] border-[1.5px] border-[#D9A441]"
                    : "bg-[#0B0D12] border border-white/[0.08] opacity-75 hover:opacity-100 hover:border-white/20"
                }`}
              >
                <span
                  className="text-xs font-semibold leading-none mb-2"
                  style={{ color: tier.color }}
                >
                  {tierLabel[bot.difficulty]}
                </span>
                <AvatarIcon
                  id={bot.avatarId}
                  className={`w-16 h-16 sm:w-[74px] sm:h-[74px] rounded-xl ${
                    isSelected ? "ring-1 ring-[#D9A441]/50" : "ring-1 ring-white/10"
                  }`}
                />
                <span className="font-mono text-xs text-[#E8E6E1] mt-2 leading-none tabular-nums">
                  {bot.rating}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seçili Rakip Özeti ve Repliği */}
        <div
          aria-live="polite"
          className="mt-3 px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-white/[0.07]"
        >
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <span className="font-serif font-bold text-base text-[#E8E6E1] truncate">
              {tBotName(activeBot.name)}
            </span>
            {activePlayed && activeRec && (
              <span className="shrink-0 font-mono text-[11px] text-[#8A8F9A] tabular-nums">
                {dict.opponent.record} {activeRec.w}
                {dict.opponent.wins}–{activeRec.l}
                {dict.opponent.losses}
                {activeRec.d ? `–${activeRec.d}${dict.opponent.draws}` : ""}
              </span>
            )}
          </div>
          <div className="text-xs text-[#8A8F9A] mt-0.5 truncate">
            {tBot(activeBot.rankTitle)} · {styleLabel[activeBot.style]}
          </div>
          <p className="text-xs italic text-[#E8E6E1]/80 mt-1 leading-snug line-clamp-2">
            “{isEn ? activeBot.quote.en : activeBot.quote.tr}”
          </p>
        </div>

        {/* Tek Birincil Aksiyon */}
        <Button
          variant="primary"
          fullWidth
          className="mt-3"
          data-testid="opponent-confirm-play"
          onClick={() => launchBot(activeBot)}
        >
          {dict.opponent.play}
        </Button>
      </div>
    </div>
  );
};

export default OpponentPickerSheet;
