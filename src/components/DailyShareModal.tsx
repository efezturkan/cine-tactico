"use client";

import React, { useState } from "react";
import { GameBoard, CellAnswer } from "@/core";
import { Share2, Copy, Check, HelpCircle, Trophy, Sparkles, X } from "lucide-react";
import { audio } from "@/utils/audio";

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
  const [copiedSOS, setCopiedSOS] = useState(false);

  if (!isOpen) return null;

  const filledCount = cells.filter(c => c !== null).length;
  const isPerfect = filledCount === 9;

  // Boş kalan ilk kareyi bul (SOS modu için)
  const emptyIndex = cells.findIndex(c => c === null);
  const emptyRow = emptyIndex !== -1 ? board.rows[Math.floor(emptyIndex / 3)].label : null;
  const emptyCol = emptyIndex !== -1 ? board.cols[emptyIndex % 3].label : null;

  // Emojili Wordle tarzı 3x3 ızgara üret
  const generateEmojiGrid = () => {
    let grid = "";
    for (let r = 0; r < 3; r++) {
      let rowStr = "";
      for (let c = 0; c < 3; c++) {
        const idx = r * 3 + c;
        rowStr += cells[idx] !== null ? "🟩 " : "⬛ ";
      }
      grid += rowStr.trim() + "\n";
    }
    return grid;
  };

  // Skor Kartı Metni
  const shareText = `🎬 CineXOX — Günün Kadresi 🍿\n\n${generateEmojiGrid()}\n🎯 Sonuç: ${filledCount}/9 Kare\n⚡ Skor: ${score.toLocaleString()} Puan\n🏆 Rütbe: ${
    isPerfect ? "Usta Sinefil 🌟" : filledCount >= 6 ? "Film Meraklısı 🎬" : "Acemi İzleyici 🍿"
  }\n\nSen de dene: ${typeof window !== "undefined" ? window.location.origin : "cinexox.app"}`;

  // SOS (Yardım Çağrısı) Metni
  const sosText = `🚨 SİNEFİL ACİL YARDIM ÇAĞRISI! 🎬\n\nCineXOX günün 3x3 bulmacasında ${filledCount}/9 yaptım ama şu karede tıkandım:\n❓ [ ${emptyRow} ] x [ ${emptyCol} ]\n\nBu iki kurala uyan filmi bilen var mı? Yorumlara yazın ya da linke tıkla sen çöz:\n👉 ${
    typeof window !== "undefined" ? window.location.origin : "cinexox.app"
  }`;

  const handleCopyScore = () => {
    audio.playSelect();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleCopySOS = () => {
    audio.playSelect();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sosText);
      setCopiedSOS(true);
      setTimeout(() => setCopiedSOS(false), 2500);
    }
  };

  const handleNativeShare = () => {
    audio.playSelect();
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: "CineXOX Günün Kadresi",
          text: filledCount < 9 && emptyIndex !== -1 ? sosText : shareText,
          url: window.location.origin,
        })
        .catch(() => {});
    } else {
      handleCopyScore();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-cinema-card border border-cinema-border rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center text-[#8A8F9A] hover:text-[#E8E6E1] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Kart Başlığı */}
        <div className="text-center pb-3 border-b border-cinema-border">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
            GÜNÜN SKOR KARTI
          </span>
          <h2 className="text-lg font-black text-white mt-1">
            {isPerfect ? "9/9 Kusursuz Tamamlama!" : `${filledCount}/9 Kare Dolduruldu`}
          </h2>
        </div>

        {/* Görsel 3x3 Mini Matris Önizlemesi */}
        <div className="my-4 p-3 rounded-2xl bg-cinema-dark border border-cinema-border/60 text-center">
          <div className="grid grid-cols-3 gap-1.5 max-w-[160px] mx-auto mb-2">
            {cells.map((c, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                  c !== null
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                    : "bg-zinc-800/80 text-zinc-500 border border-zinc-700/60"
                }`}
              >
                {c !== null ? "✓" : "?"}
              </div>
            ))}
          </div>

          <div className="text-xs font-black text-zinc-300">
            Skor: <span className="text-amber-400 font-extrabold">{score.toLocaleString()} PTS</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">
            {isPerfect ? "🌟 Usta Sinefil Rütbesi" : "🎬 Film Meraklısı Rütbesi"}
          </div>
        </div>

        {/* Aksiyon Seçenekleri */}
        <div className="space-y-2">
          {/* Normal Skor Paylaşımı */}
          <button
            onClick={handleNativeShare}
            className="w-full h-11 py-2.5 px-4 rounded-xl bg-[#D9A441] hover:bg-[#c49235] text-[#0B0D12] font-serif font-bold text-xs flex items-center justify-center gap-2 border border-[#D9A441] active:scale-95 transition-all min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            Skorunu Paylaş
          </button>

          {/* SOS (Arkadaşa Boş Kareyi Sor) — Sadece eksik varsa */}
          {filledCount < 9 && emptyIndex !== -1 && (
            <button
              onClick={handleCopySOS}
              className="w-full h-11 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[44px]"
            >
              <HelpCircle className="w-4 h-4 text-rose-400" />
              {copiedSOS ? "✓ Yardım Mesajı Kopyalandı!" : "Bu Boşluğu Arkadaşına Sor (SOS)"}
            </button>
          )}

          {/* Panoya Emojili Kopyala */}
          <button
            onClick={handleCopyScore}
            className="w-full h-11 py-2 px-3 rounded-xl bg-[#181B22] hover:bg-[#202530] text-[#E8E6E1] font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95 min-h-[44px]"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                Metin Formatında Kopyala
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
