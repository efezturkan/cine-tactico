"use client";

import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { BOT_OPPONENTS, BotOpponentProfile, BotStyle } from "@/data/boards";
import { AVATAR_OPTIONS } from "@/types/profile";
import { AvatarIcon } from "@/components/ui/AvatarIcon";
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
  { id: "EASY", color: "#8EBB70" },
  { id: "MEDIUM", color: "#D9A441" },
  { id: "HARD", color: "#E5484D" },
];

/** Her seviyeden bir rakip: sayfa her açıldığında farklı kişiler çıkar. */
function drawOpponents(): BotOpponentProfile[] {
  return TIERS.map(({ id }) => {
    const pool = BOT_OPPONENTS.filter((b) => b.difficulty === id);
    return pool[Math.floor(Math.random() * pool.length)];
  });
}

/**
 * Rakip seçimi: satranç botlarındaki gibi seviye, rating, oyun stili ve aranızdaki skor görünür.
 * Oyuncu "kolay / orta / zor" kararını burada, rakibin kimliğini görerek verir.
 */
export const OpponentPickerSheet: React.FC<OpponentPickerSheetProps> = ({ isOpen, records, onPick, onClose }) => {
  const { dict, locale } = useTranslation();
  const isEn = locale === "en";
  const opponents = useMemo(() => (isOpen ? drawOpponents() : []), [isOpen]);

  if (!isOpen) return null;

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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/65 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />
        <h2 className="font-serif text-xl font-bold text-[#F1EEE7] text-center">{dict.opponent.title}</h2>
        <p className="text-xs text-[#8A8F9A] text-center mt-0.5 mb-3">{dict.opponent.sub}</p>

        <div className="flex flex-col gap-2.5" role="list">
          {opponents.map((bot, i) => {
            const tier = TIERS[i];
            const avatar = AVATAR_OPTIONS.find((a) => a.id === bot.avatarId) || AVATAR_OPTIONS[0];
            const rec = records[bot.name];
            const played = rec && rec.w + rec.l + rec.d > 0;
            return (
              <button
                key={bot.name}
                type="button"
                role="listitem"
                data-testid={`opponent-${bot.difficulty}`}
                onClick={() => {
                  audio.playSelect();
                  haptic.light();
                  onPick(bot);
                }}
                className="w-full p-3 rounded-2xl bg-[#0F1218] border border-white/10 hover:border-white/25 active:scale-[0.98] transition-all text-left flex items-center gap-3"
                style={{ borderLeft: `3px solid ${tier.color}` }}
              >
                <div
                  className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-tr ${avatar.iconBg} flex items-center justify-center text-2xl border border-white/15`}
                >
                  <AvatarIcon id={bot.avatarId} className="w-6 h-6 text-white/90" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-[15px] text-[#F1EEE7] truncate">{bot.name}</span>
                    <span
                      className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                      style={{ color: tier.color, backgroundColor: `${tier.color}22` }}
                    >
                      {tierLabel[bot.difficulty]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#8A8F9A] mt-0.5">
                    <span className="font-mono font-bold text-[#D9A441]">
                      {dict.opponent.rating} {bot.rating}
                    </span>
                    <span>·</span>
                    <span>{styleLabel[bot.style]}</span>
                    <span>·</span>
                    <span className="truncate">
                      {played
                        ? `${dict.opponent.record} ${rec.w}${dict.opponent.wins} ${rec.l}${dict.opponent.losses}${rec.d ? ` ${rec.d}${dict.opponent.draws}` : ""}`
                        : dict.opponent.firstMeeting}
                    </span>
                  </div>
                  <p className="text-[11px] italic text-[#A5A8B0] mt-1 leading-snug line-clamp-1">
                    “{isEn ? bot.quote.en : bot.quote.tr}”
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D9A441] shrink-0" />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] mt-3 rounded-xl bg-[#181B22] border border-white/10 text-[#8A8F9A] text-xs font-bold uppercase tracking-wide active:scale-95"
        >
          {dict.opponent.cancel}
        </button>
      </div>
    </div>
  );
};

export default OpponentPickerSheet;
