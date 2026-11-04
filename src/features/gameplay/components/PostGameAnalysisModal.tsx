"use client";

import React from "react";
import { PlayerSymbol, GameBoard, CellAnswer } from "@/core";
import { UserProfile } from "@/types/profile";
import { RotateCcw, Home, Film } from "lucide-react";
import { audio } from "@/utils/audio";
import { MiniKadrajPreview } from "@/components/ui/MiniKadrajPreview";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n";

interface PostGameAnalysisModalProps {
  winner: PlayerSymbol | "DRAW" | null;
  board: GameBoard;
  cells: (CellAnswer | null)[];
  profile?: UserProfile;
  totalArcadeScore?: number;
  onPlayAgain: () => void;
  onNextBoard?: () => void;
  onBackToHome?: () => void;
  onDoubleReward?: () => void;
  onReviewKadraj?: () => void;
}

// 35mm film edge perforations for modal
const ModalSprocketColumn = ({ count = 12 }: { count?: number }) => (
  <div className="flex flex-col items-center justify-around py-2 gap-2 h-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-2 h-3 rounded-[2px] bg-[#07080b] border border-white/10 shrink-0"
      />
    ))}
  </div>
);

const LOSS_SUBTITLES_TR = [
  "Bir çekim daha?",
  "Sahne senin, tekrar dene.",
  "Final kesimi bu değil.",
];

const LOSS_SUBTITLES_EN = [
  "One more take?",
  "The stage is yours, try again.",
  "This is not the final cut.",
];

export const PostGameAnalysisModal: React.FC<PostGameAnalysisModalProps> = ({
  winner,
  board,
  cells,
  onPlayAgain,
  onBackToHome,
  onReviewKadraj,
}) => {
  const { dict, locale, tBoardTitle } = useTranslation();
  const isEn = locale === "en";

  const [lossSubtitleIndex] = React.useState(
    () => Math.floor(Math.random() * 3)
  );

  const lossSubtitle = isEn
    ? LOSS_SUBTITLES_EN[lossSubtitleIndex]
    : LOSS_SUBTITLES_TR[lossSubtitleIndex];

  if (winner === null) return null;

  const isVictory = winner === "X";
  const isDraw = winner === "DRAW";

  const playerAnswers = cells.filter((c) => c && c.answeredBy === "X");
  const opponentAnswers = cells.filter((c) => c && c.answeredBy === "O");
  const rarityScore =
    playerAnswers.length > 0
      ? Math.round(
          playerAnswers.reduce((acc, c) => {
            const bonus = c?.rarityScore ?? (c?.movie?.hasOscar ? 5 : 8);
            return acc + bonus;
          }, 0) / playerAnswers.length
        )
      : 5;

  const rawTitle =
    board.displayTitle ||
    (board.title.includes(":") ? board.title.split(":")[0].trim() : board.title);
  const displayTitle = tBoardTitle(rawTitle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col relative text-[#E8E6E1] bg-[#14171D] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Left & Right 35mm Film Edge Perforations */}
        <div className="absolute left-1.5 top-0 bottom-0 w-2.5 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none">
          <ModalSprocketColumn count={14} />
        </div>
        <div className="absolute right-1.5 top-0 bottom-0 w-2.5 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none">
          <ModalSprocketColumn count={14} />
        </div>

        {/* Viewfinder corner brackets */}
        <div className="absolute top-2 left-5 w-2.5 h-2.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-2 right-5 w-2.5 h-2.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 left-5 w-2.5 h-2.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 right-5 w-2.5 h-2.5 border-b border-r border-white/20 pointer-events-none" />

        {/* Top Micro Tag */}
        <div className="text-center mb-1">
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#D9A441] uppercase">
            35MM · 24 FPS
          </span>
        </div>

        {/* Main Result Serif Title */}
        <div className="text-center my-3">
          <h2
            className={`font-serif font-bold text-3xl sm:text-4xl tracking-tight leading-tight ${
              isVictory
                ? "text-[#D9A441]"
                : isDraw
                ? "text-[#4FA3C7]"
                : "text-[#E8E6E1]"
            }`}
          >
            {isVictory
              ? isEn
                ? "Scene's yours!"
                : "Sahne senin!"
              : isDraw
              ? isEn
                ? "Blind frame"
                : "Kör kadraj"
              : isEn
              ? "Not this take."
              : "Bu çekim olmadı."}
          </h2>

          {isDraw && (
            <p className="text-xs text-[#8A8F9A] font-sans mt-0.5">
              {isEn ? "Draw." : "Berabere."}
            </p>
          )}

          {!isVictory && !isDraw && (
            <p className="text-xs text-[#8A8F9A] font-sans mt-0.5">
              {lossSubtitle}
            </p>
          )}

          <p className="text-xs text-[#8A8F9A] font-sans truncate mt-1 px-4">
            {displayTitle}
          </p>
        </div>

        {/* Centered MiniKadrajPreview */}
        <div className="flex justify-center my-2">
          <MiniKadrajPreview cells={cells} size="md" />
        </div>

        {/* Clean Match Summary Card */}
        <div className="w-full my-3 py-3 px-2 rounded-xl bg-[#0F1115] border border-white/5 grid grid-cols-3 gap-1 text-center">
          <div>
            <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
              {isEn ? "YOU (X)" : "SEN (X)"}
            </span>
            <span className="text-base font-mono font-bold text-[#D9A441] mt-0.5 block">
              {playerAnswers.length} {isEn ? "Cells" : "Kare"}
            </span>
          </div>
          <div className="border-x border-white/5">
            <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
              {isEn ? "OPPONENT (O)" : "RAKİP (O)"}
            </span>
            <span className="text-base font-mono font-bold text-[#4FA3C7] mt-0.5 block">
              {opponentAnswers.length} {isEn ? "Cells" : "Kare"}
            </span>
          </div>
          <div>
            <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
              {isEn ? "RARITY" : "NADİRLİK"}
            </span>
            <span className="text-base font-mono font-bold text-[#E8E6E1] mt-0.5 block">
              %{rarityScore}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-1">
          <Button
            variant="primary"
            data-testid="final-frame-play-again-btn"
            onClick={() => {
              audio.playSelect();
              onPlayAgain();
            }}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{dict.game.playAgain}</span>
          </Button>

          {onReviewKadraj && (
            <Button
              variant="secondary"
              data-testid="post-game-review-kadraj-btn"
              onClick={() => {
                audio.playSelect();
                onReviewKadraj();
              }}
              className="w-full border border-[#D9A441]/40 text-[#D9A441] hover:bg-[#D9A441]/10"
            >
              <Film className="w-4 h-4 text-[#D9A441]" />
              <span>{dict.game.reviewKadraj}</span>
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              audio.playSelect();
              if (onBackToHome) onBackToHome();
            }}
            className="w-full"
          >
            <Home className="w-4 h-4 text-[#8A8F9A]" />
            <span>{dict.game.backToHome}</span>
          </Button>
        </div>

        {/* Bottom Micro Tag: 30% Opacity */}
        <div className="text-center mt-3">
          <span className="text-[8px] font-mono tracking-widest text-[#8A8F9A] opacity-30 uppercase">
            CineXOX · 35MM
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostGameAnalysisModal;
