"use client";

import React, { useState } from "react";
import { GameBoard, CellAnswer } from "@/core";
import { X, Share2, Copy, Check, Trophy } from "lucide-react";
import { audio } from "@/utils/audio";
import { Button } from "@/components/ui/Button";
import { MiniKadrajPreview } from "@/components/ui/MiniKadrajPreview";

interface DailyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: GameBoard;
  cells: (CellAnswer | null)[];
  score: number;
}

export const DailyShareModal: React.FC<DailyShareModalProps> = ({
  isOpen,
  onClose,
  board,
  cells,
  score,
}) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const filledCount = cells.filter((c) => c !== null).length;
  const isPerfect = filledCount === 9;
  const dayStr = String(new Date().getDate()).padStart(2, "0");

  const generateEmojiGrid = () => {
    let grid = "";
    for (let r = 0; r < 3; r++) {
      let rowStr = "";
      for (let c = 0; c < 3; c++) {
        const idx = r * 3 + c;
        rowStr += cells[idx] !== null ? "🟨 " : "⬛ ";
      }
      grid += rowStr.trim() + "\n";
    }
    return grid;
  };

  const shareText = `CineXOX · Günün Kadrası NO.${dayStr}\n\n${generateEmojiGrid()}\nSonuç: ${filledCount}/9 Kare ${
    isPerfect ? "· Kesin!" : ""
  }\n${typeof window !== "undefined" ? window.location.origin : "cinexox.app"}`;

  const handleCopyScore = () => {
    audio.playSelect();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleNativeShare = () => {
    audio.playSelect();
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `CineXOX Günün Kadrası NO.${dayStr}`,
          text: shareText,
          url: window.location.origin,
        })
        .catch(() => {
          handleCopyScore();
        });
    } else {
      handleCopyScore();
    }
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
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Kart Başlığı */}
        <div className="text-center pb-3 border-b border-white/10">
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#D9A441] uppercase block mb-1">
            GÜNÜN KADRASI · NO.{dayStr}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#E8E6E1]">
            {isPerfect ? "Kesin!" : `${filledCount}/9 Kare`}
          </h2>
          <p className="text-xs text-[#8A8F9A] font-sans mt-0.5">
            {isPerfect ? "Kusursuz çekim tamamlandı. Yarın yeni bir tane var." : "Bugünün kadrajı çekildi. Yarın yeni bir tane var."}
          </p>
        </div>

        {/* 3x3 Mini Kadraj */}
        <div className="my-4 flex flex-col items-center justify-center">
          <MiniKadrajPreview cells={cells} size="md" />
        </div>

        {/* Aksiyonlar */}
        <div className="flex flex-col gap-2 mt-1">
          <Button variant="primary" onClick={handleNativeShare} className="w-full">
            <Share2 className="w-4 h-4" />
            <span>Paylaş</span>
          </Button>

          <Button variant="secondary" onClick={handleCopyScore} className="w-full">
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-[#D9A441]" />
                <span className="text-[#D9A441]">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#8A8F9A]" />
                <span>Panoya Kopyala</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyShareModal;
