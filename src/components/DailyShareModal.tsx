"use client";

import { getDailyEditionNumber } from "@/utils/dateUtils";
import React, { useState } from "react";
import { CellAnswer } from "@/core";
import { X, Share2, Copy, Check } from "lucide-react";
import { audio } from "@/utils/audio";
import { Button } from "@/components/ui/Button";
import { MiniKadrajPreview } from "@/components/ui/MiniKadrajPreview";
import { summarizeDailyShare } from "@/utils/dailyShare";
import { shareText, copyText } from "@/utils/share";
import { useTranslation } from "@/i18n";
import { FLAGS } from "@/config/flags";

// Uygulama içinde origin "capacitor://localhost" olur; paylaşılan bağlantı herkese açık adres olmalı.
const PUBLIC_URL = "https://cine-tactico.vercel.app";
const publicOrigin = () =>
  typeof window !== "undefined" && /^https?:\/\//.test(window.location.origin) && !/localhost|127\.0\.0\.1/.test(window.location.origin)
    ? window.location.origin
    : PUBLIC_URL;

interface DailyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cells: (CellAnswer | null)[];
  winner?: "X" | "O" | "DRAW" | null;
}

export const DailyShareModal: React.FC<DailyShareModalProps> = ({
  isOpen,
  onClose,
  cells,
  winner,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const { dict } = useTranslation();
  const card = dict.dailyCard;
  const fillN = (s: string, n: string) => s.replace("{n}", n);

  if (!isOpen) return null;

  const summary = summarizeDailyShare(cells, winner, card);
  const dayStr = getDailyEditionNumber();
  const shareBody = `${fillN(card.shareHeader, dayStr)}\n\n${summary.emojiGrid}\n${summary.resultLine}\n${
    publicOrigin()
  }`;

  const flashCopied = () => {
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyScore = async () => {
    audio.playSelect();
    if (await copyText(shareBody)) flashCopied();
  };

  const handleNativeShare = async () => {
    audio.playSelect();
    const outcome = await shareText(fillN(card.shareTitle, dayStr), shareBody);
    if (outcome === "copied") flashCopied();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm bg-[#14171D] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Kapat Butonu */}
        <Button
          variant="icon"
          onClick={onClose}
          className="absolute top-3.5 right-3.5"
          title={card.close}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Kart Başlığı */}
        <div className="text-center pb-3 border-b border-white/10">
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#D9A441] uppercase block mb-1">
            {fillN(card.caption, dayStr)}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#E8E6E1]">
            {summary.headline}
          </h2>
          <p className="text-xs text-[#8A8F9A] font-sans mt-0.5">
            {summary.subline}
          </p>
          {FLAGS.SHOW_COIN_ECONOMY && summary.rewardReels > 0 && (
            <p className="text-xs font-mono font-bold text-[#D9A441] mt-1.5">
              {fillN(card.reward, String(summary.rewardReels))}
            </p>
          )}
        </div>

        {/* 3x3 Mini Kadraj */}
        <div className="my-4 flex flex-col items-center justify-center">
          <MiniKadrajPreview cells={cells} size="md" />
        </div>

        {/* Aksiyonlar */}
        <div className="flex flex-col gap-2 mt-1">
          <Button variant="primary" onClick={handleNativeShare} className="w-full">
            <Share2 className="w-4 h-4" />
            <span>{card.share}</span>
          </Button>

          <Button variant="secondary" onClick={handleCopyScore} className="w-full">
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-[#D9A441]" />
                <span className="text-[#D9A441]">{card.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#8A8F9A]" />
                <span>{card.copy}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyShareModal;
