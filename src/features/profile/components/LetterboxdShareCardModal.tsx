"use client";

import React, { useRef, useState, useEffect } from "react";
import { MatchRecord } from "@/types/profile";
import { GameBoard, CellAnswer } from "@/core";
import { audio } from "@/utils/audio";
import { Download, Copy, Check, X, Share2, Sparkles, ExternalLink, Trophy } from "lucide-react";

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const displayBoard = match ? match.board : board;
  const displayCells = match ? match.cells : cells;
  const matchOutcome = match ? match.outcome : isVictory ? "VICTORY" : "DEFEAT";
  const rarityTotal = match ? match.scoreRarity : 36;
  const opponentName = match?.opponent?.name || "Rakip Sinefil";

  // Metin Paylaşımı (Letterboxd & Twitter formatı)
  const handleCopyText = () => {
    audio.playSelect();
    const resultEmojiGrid = [0, 1, 2]
      .map(r =>
        [0, 1, 2]
          .map(c => {
            const cell = displayCells[r * 3 + c];
            if (!cell) return "⬛";
            if (cell.answeredBy === "NEUTRAL") return "🔒";
            return cell.answeredBy === "X" ? "🟩" : "🟥";
          })
          .join("")
      )
      .join("\n");

    const textToCopy = `🎬 CineXOX Düello Kartı · ${matchOutcome === "VICTORY" ? "👑 ZAFER" : "🎬 MAÇ"}\n\n` +
      `Oyuncu: @${username} ${letterboxdUsername ? `(Letterboxd: @${letterboxdUsername})` : ""}\n` +
      `Rakip: @${opponentName}\n` +
      `Tahta: ${displayBoard.title}\n` +
      `Skor: ${score} Puan · ${rarityTotal} Nadirlik ✨\n\n` +
      `${resultEmojiGrid}\n\n` +
      `Sen de sinefil bilgini test et: https://cine-tactico.vercel.app`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Canvas üzerine 1080x1350 estetik sinematik görsel çizimi ve PNG indirme
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

    // 1. Arka Plan: Koyu Sinematik Gradyan
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1350);
    bgGrad.addColorStop(0, "#080a10");
    bgGrad.addColorStop(0.5, "#0e111a");
    bgGrad.addColorStop(1, "#050608");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. 35mm Film Delikleri (Sprocket Holes)
    ctx.fillStyle = "#161922";
    for (let y = 30; y < 1320; y += 45) {
      ctx.fillRect(20, y, 22, 16);
      ctx.fillRect(1038, y, 22, 16);
    }

    // 3. Üst Başlık (Kodak & Letterboxd Stili)
    ctx.font = "bold 26px monospace";
    ctx.fillStyle = "#d97706";
    ctx.fillText("KODAK 5219 · 35MM CINEMA ARCHIVE", 80, 90);

    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("LETTERBOXD SYMBIOTIC ARENA", 80, 125);

    // 4. Oyuncu Kartı & Başarı Damgası
    ctx.fillStyle = "#141824";
    ctx.strokeStyle = "#23293a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, 160, 920, 120, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 34px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(username, 110, 215);

    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#00e054"; // Letterboxd yeşili
    ctx.fillText(`@${letterboxdUsername || username} • Onaylı Sinefil ✓`, 110, 255);

    // Sonuç Damgası (👑 ZAFER)
    const isWin = matchOutcome === "VICTORY";
    ctx.fillStyle = isWin ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
    ctx.strokeStyle = isWin ? "#10b981" : "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(750, 185, 220, 70, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = "black 28px sans-serif";
    ctx.fillStyle = isWin ? "#34d399" : "#f87171";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "👑 ZAFER" : "BOZGUN", 860, 230);
    ctx.textAlign = "left";

    // 5. 3x3 Tahta Başlığı
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(`Tahta: ${displayBoard.title}`, 80, 330);

    // 6. 3x3 Grid Çizimi (540x540 px)
    const startX = 80;
    const startY = 360;
    const cellSize = 300;
    const gap = 10;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cellIdx = r * 3 + c;
        const cell = displayCells[cellIdx];
        const x = startX + c * (cellSize + gap);
        const y = startY + r * (220 + gap);

        // Hücre Arka Planı
        ctx.fillStyle = cell?.answeredBy === "X"
          ? "#082f49"
          : cell?.answeredBy === "O"
          ? "#450a0a"
          : "#0a0c14";
        ctx.strokeStyle = cell?.answeredBy === "X"
          ? "#0284c7"
          : cell?.answeredBy === "O"
          ? "#b91c1c"
          : "#1e2433";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, 220, 16);
        ctx.fill();
        ctx.stroke();

        if (cell) {
          // Oyuncu Rozeti
          ctx.font = "bold 18px monospace";
          ctx.fillStyle = cell.answeredBy === "X" ? "#38bdf8" : "#f87171";
          ctx.fillText(cell.answeredBy === "X" ? "OYUNCU X" : "RAKİP O", x + 16, y + 36);

          // Film / Aktör Adı
          ctx.font = "bold 22px sans-serif";
          ctx.fillStyle = "#ffffff";
          const title = cell.actorName || cell.movie.title;
          ctx.fillText(title.length > 18 ? title.slice(0, 17) + "..." : title, x + 16, y + 80);

          if (!cell.actorName && cell.movie.year > 0) {
            ctx.font = "18px sans-serif";
            ctx.fillStyle = "#94a3b8";
            ctx.fillText(`${cell.movie.year} · ${cell.movie.director.split(" ").pop()}`, x + 16, y + 115);
          }

          // Nadirlik Puanı
          if (cell.rarityScore) {
            ctx.font = "bold 18px monospace";
            ctx.fillStyle = "#f59e0b";
            ctx.fillText(`+${cell.rarityScore} Rarity`, x + 16, y + 180);
          }
        } else {
          ctx.font = "bold 24px monospace";
          ctx.fillStyle = "#334155";
          ctx.fillText("BOŞ KARE", x + 80, y + 120);
        }
      }
    }

    // 7. Alt İstatistik Şeridi & QR/Link Çağrısı
    ctx.fillStyle = "#141824";
    ctx.strokeStyle = "#23293a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 1100, 920, 180, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`✨ TOPLAM NADİRLİK: ${rarityTotal} PUAN`, 110, 1155);

    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`vs @${opponentName} · 35mm Arena Düellosu`, 110, 1200);

    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("cine-tactico.vercel.app · 9 KARE. 2 SİNEFİL. 1 KAZANAN.", 110, 1245);

    // İndirme Bağlantısı
    const link = document.createElement("a");
    link.download = `cinexox-match-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0f1422] to-[#080a12] border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl flex flex-col relative text-white max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Üst Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <div>
              <h3 className="text-sm font-black text-amber-400 tracking-wider uppercase font-mono">
                SİNEFİL PAYLAŞIM KARTI
              </h3>
              <span className="text-[10px] text-zinc-400 font-bold">
                Letterboxd &amp; Instagram Hikaye Formatı
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canlı Kart Önizlemesi */}
        <div className="my-4 p-4 rounded-2xl bg-black/80 border border-zinc-800 relative overflow-hidden shadow-inner">
          {/* Üst Şerit */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-[10px] font-mono font-bold text-zinc-400">
            <span className="text-amber-400">KODAK 35MM · CINE-XOX</span>
            <span className="text-emerald-400">
              @{letterboxdUsername || username} ✓
            </span>
          </div>

          {/* Maç Sonuç Başlığı */}
          <div className="my-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-white">{displayBoard.title}</div>
              <div className="text-[10px] text-zinc-400 font-bold mt-0.5">
                vs @{opponentName}
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-xl text-xs font-black font-mono border ${
                matchOutcome === "VICTORY"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
              }`}
            >
              {matchOutcome === "VICTORY" ? "👑 ZAFER" : "BOZGUN"}
            </div>
          </div>

          {/* 3x3 Mini Grid */}
          <div className="grid grid-cols-3 gap-1.5 my-3">
            {displayCells.map((cell, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl text-left border flex flex-col justify-between min-h-[58px] ${
                  cell?.answeredBy === "X"
                    ? "bg-cyan-950/40 border-cyan-500/50"
                    : cell?.answeredBy === "O"
                    ? "bg-rose-950/40 border-rose-500/50"
                    : "bg-zinc-900/60 border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] font-mono font-black text-zinc-400">
                    {cell ? cell.answeredBy : "-"}
                  </span>
                  {cell?.rarityScore ? (
                    <span className="text-[7.5px] font-bold text-amber-400">
                      +{cell.rarityScore}
                    </span>
                  ) : null}
                </div>
                <div className="text-[9.5px] font-black text-white truncate leading-tight mt-1">
                  {cell ? (cell.actorName || cell.movie.title) : "Boş"}
                </div>
              </div>
            ))}
          </div>

          {/* Rarity & Alt Bilgi */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono font-bold">
            <span className="text-amber-300">✨ Nadirlik: {rarityTotal} Puan</span>
            <span className="text-zinc-500">cine-tactico.vercel.app</span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? "Hazırlanıyor..." : "Görseli İndir"}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Kopyalandı!" : "Metni Kopyala"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};