"use client";

import React, { useState } from "react";
import { MatchRecord } from "@/types/profile";
import { GameBoard, CellAnswer } from "@/core";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { Download, Copy, Check, X } from "lucide-react";

interface LetterboxdShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  match?: MatchRecord | null;
  board: GameBoard;
  cells: (CellAnswer | null)[];
  score: number;
  username: string;
  letterboxdUsername?: string;
  isVictory?: boolean;
}

export const LetterboxdShareCardModal: React.FC<LetterboxdShareCardModalProps> = ({
  isOpen,
  onClose,
  match,
  board,
  cells,
  score,
  username,
  letterboxdUsername,
  isVictory = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const displayBoard = match ? match.board : board;
  const displayCells = match ? match.cells : cells;
  const matchOutcome = match ? match.outcome : isVictory ? "VICTORY" : "DEFEAT";
  const rarityTotal =
    match?.scoreRarity ??
    displayCells.reduce((acc, c) => acc + (c?.answeredBy === "X" ? c?.rarityScore || 10 : 0), 0);
  const opponentName = match?.opponent?.name || "Sinefil Rakip";

  const handleCopyText = () => {
    audio.playSelect();
    haptic.light();
    const resultEmojiGrid = [0, 1, 2]
      .map((r) =>
        [0, 1, 2]
          .map((c) => {
            const cell = displayCells[r * 3 + c];
            if (!cell) return "⬛";
            if (cell.answeredBy === "NEUTRAL") return "🔒";
            return cell.answeredBy === "X" ? "🟨" : "🟦";
          })
          .join("")
      )
      .join("\n");

    const textToCopy =
      `🎬 CINE-XOX · MAÇ KAYDI (${matchOutcome === "VICTORY" ? "ZAFER" : "DÜELLO"})\n\n` +
      `Oyuncu: ${username}${letterboxdUsername ? ` (@${letterboxdUsername})` : ""}\n` +
      `Rakip: ${opponentName}\n` +
      `Tahta: ${displayBoard.title}\n` +
      `Nadirlik: +${rarityTotal}\n\n` +
      `${resultEmojiGrid}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = () => {
    audio.playPowerup();
    setIsGenerating(true);

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    ctx.fillStyle = "#0B1220";
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#F5C451";
    ctx.fillText("CINE-XOX · 3×3 SİNEMA DÜELLOSU", 80, 96);

    ctx.fillStyle = "#121A2B";
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, 140, 920, 120, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 34px sans-serif";
    ctx.fillStyle = "#F4F6FA";
    ctx.fillText(username, 112, 198);

    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#9AA6BD";
    ctx.fillText(`vs ${opponentName}`, 112, 234);

    const isWin = matchOutcome === "VICTORY";
    ctx.fillStyle = isWin ? "rgba(245, 196, 81, 0.18)" : "rgba(76, 154, 255, 0.18)";
    ctx.strokeStyle = isWin ? "#F5C451" : "#4C9AFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(740, 166, 230, 68, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = isWin ? "#F5C451" : "#4C9AFF";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "ZAFER (X)" : "MAÇ KAYDI", 855, 210);
    ctx.textAlign = "left";

    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#F4F6FA";
    ctx.fillText(`Tahta: ${displayBoard.title}`, 80, 316);

    const startX = 80;
    const startY = 348;
    const cellSize = 300;
    const gap = 10;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cellIdx = r * 3 + c;
        const cell = displayCells[cellIdx];
        const x = startX + c * (cellSize + gap);
        const y = startY + r * (220 + gap);

        const isX = cell?.answeredBy === "X";
        const isO = cell?.answeredBy === "O";

        ctx.fillStyle = isX ? "#1E2420" : isO ? "#122138" : "#121A2B";
        ctx.strokeStyle = isX ? "#F5C451" : isO ? "#4C9AFF" : "rgba(255,255,255,0.12)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, 220, 18);
        ctx.fill();
        ctx.stroke();

        if (cell) {
          ctx.font = "bold 18px monospace";
          ctx.fillStyle = isX ? "#F5C451" : "#4C9AFF";
          ctx.fillText(isX ? "SEN (X)" : "RAKİP (O)", x + 18, y + 38);

          ctx.font = "bold 22px sans-serif";
          ctx.fillStyle = "#F4F6FA";
          const title = cell.actorName || cell.movie.title;
          ctx.fillText(title.length > 18 ? title.slice(0, 17) + "..." : title, x + 18, y + 84);

          if (!cell.actorName && cell.movie.year > 0) {
            ctx.font = "18px monospace";
            ctx.fillStyle = "#9AA6BD";
            ctx.fillText(
              `${cell.movie.year} · ${cell.movie.director.split(" ").pop()}`,
              x + 18,
              y + 118
            );
          }

          if (cell.rarityScore) {
            ctx.font = "bold 18px monospace";
            ctx.fillStyle = "#3DDC84";
            ctx.fillText(`+${cell.rarityScore} Puan`, x + 18, y + 184);
          }
        } else {
          ctx.font = "bold 20px sans-serif";
          ctx.fillStyle = "#9AA6BD";
          ctx.fillText("BOŞ KARE", x + 88, y + 118);
        }
      }
    }

    ctx.fillStyle = "#121A2B";
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 1088, 920, 160, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#F5C451";
    ctx.fillText(`NADİRLİK PUANI: +${rarityTotal}  ·  SKOR: ${score}`, 112, 1152);

    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#9AA6BD";
    ctx.fillText("CINE-XOX · KAREYİ SEÇ. RAKİBİNİ OKU.", 112, 1200);

    const link = document.createElement("a");
    link.download = `cinexox-match-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-md animate-card-in bg-panel border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col relative text-ink max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-display text-2xl font-extrabold italic uppercase tracking-wide text-gold">
              MAÇ KARTI
            </h3>
            <span className="text-xs text-muted">
              3×3 Düello Özeti
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Card Preview */}
        <div className="my-4 p-4 rounded-2xl bg-night border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-muted">
            <span className="text-gold font-bold">CINE-XOX</span>
            <span className="text-ink">@{letterboxdUsername || username}</span>
          </div>

          <div className="my-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-ink">
                {displayBoard.title}
              </div>
              <div className="text-xs text-muted mt-0.5">
                vs {opponentName}
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold uppercase tracking-wider border ${
                matchOutcome === "VICTORY"
                  ? "bg-gold/15 text-gold border-gold/40"
                  : "bg-team-blue/15 text-team-blue border-team-blue/40"
              }`}
            >
              {matchOutcome === "VICTORY" ? "ZAFER" : "MAÇ KAYDI"}
            </div>
          </div>

          {/* 3x3 Mini Grid */}
          <div className="grid grid-cols-3 gap-1.5 my-3">
            {displayCells.map((cell, idx) => {
              const isX = cell?.answeredBy === "X";
              const isO = cell?.answeredBy === "O";
              return (
                <div
                  key={idx}
                  className="p-2 rounded-xl text-left border flex flex-col justify-between min-h-[54px]"
                  style={{
                    backgroundColor: isX
                      ? "rgba(245, 196, 81, 0.14)"
                      : isO
                      ? "rgba(76, 154, 255, 0.14)"
                      : "#121A2B",
                    borderColor: isX
                      ? "rgba(245, 196, 81, 0.5)"
                      : isO
                      ? "rgba(76, 154, 255, 0.5)"
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[9px] font-bold"
                      style={{ color: isX ? "#F5C451" : isO ? "#4C9AFF" : "#9AA6BD" }}
                    >
                      {cell ? cell.answeredBy : "—"}
                    </span>
                    {cell?.rarityScore ? (
                      <span className="font-mono text-[9px] font-bold text-scored">
                        +{cell.rarityScore}
                      </span>
                    ) : null}
                  </div>
                  <div className="font-sans text-[10px] font-bold text-ink truncate leading-tight mt-1">
                    {cell ? cell.actorName || cell.movie.title : "Boş"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
            <span className="text-gold">Nadirlik: +{rarityTotal}</span>
            <span className="text-muted">CINE-XOX</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="tactile-btn-amber h-12 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-[#0F1115]"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? "Hazırlanıyor..." : "Görseli İndir"}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="tactile-btn-surface h-12 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 text-[#F1EEE7]"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#8EBB70]" />
            ) : (
              <Copy className="w-4 h-4 text-[#00D5E8]" />
            )}
            <span>{copied ? "Kopyalandı" : "Metni Kopyala"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
