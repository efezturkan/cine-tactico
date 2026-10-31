"use client";

import React, { useState } from "react";
import { TasteDna } from "@/types/profile";
import { Dna, Share2, Sparkles, Film, Star, Check, Copy } from "lucide-react";
import { audio } from "@/utils/audio";

interface TasteDnaCardProps {
  tasteDna: TasteDna;
  username: string;
}

export const TasteDnaCard: React.FC<TasteDnaCardProps> = ({ tasteDna, username }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `🧬 BENİM SİNEMA ZEVK DNA'M (CineXOX) 🎬\n\n🎭 Estetik: "${tasteDna.cinemaAesthetic}"\n🎯 1 Numaralı Yönetmen: ${tasteDna.topDirector}\n🍿 Favori Tür: ${tasteDna.topGenre}\n⏳ Altın Çağı: ${tasteDna.topDecade}\n\nSenin sinema DNA'n ne? Gel kapışalım: ${
    typeof window !== "undefined" ? window.location.origin : "cinexox.app"
  }`;

  const handleShare = () => {
    audio.playSelect();
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: `${username} Sinema Zevk DNA'sı`,
        text: shareText,
        url: window.location.origin,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-cinema-dark to-purple-950/40 border border-purple-500/30 shadow-xl relative overflow-hidden">
      {/* Arka Plan Neon Parıltısı */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Başlık */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
              LETTERBOXD STİLİ SİNEMATİK İMZA
            </span>
            <h3 className="text-sm font-black text-white">{username}&apos;in Sinefil Kimliği</h3>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Sinematik Kimlik / Estetik */}
      <div className="my-3 p-3 rounded-2xl bg-black/40 border border-zinc-800/80 text-center">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Sinematik Kimliğin
        </span>
        <div className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300 mt-0.5">
          &ldquo;{tasteDna.cinemaAesthetic}&rdquo;
        </div>
      </div>

      {/* Temel Metrikler */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[9px] font-bold text-zinc-500 block">Favori Yönetmen</span>
          <span className="text-xs font-black text-amber-400 truncate block mt-0.5">
            {tasteDna.topDirector}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[9px] font-bold text-zinc-500 block">Lider Tür</span>
          <span className="text-xs font-black text-cyan-400 truncate block mt-0.5">
            {tasteDna.topGenre}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[9px] font-bold text-zinc-500 block">Altın Dönem</span>
          <span className="text-xs font-black text-rose-400 truncate block mt-0.5">
            {tasteDna.topDecade}
          </span>
        </div>
      </div>

      {/* Tür Dağılım Çubukları */}
      <div className="space-y-2 mt-3 pt-2 border-t border-zinc-800/60">
        <div className="text-[10px] font-bold text-zinc-400 flex justify-between">
          <span>Tür Dağılımın</span>
          <span className="text-purple-400 font-mono">100% Eşleşme</span>
        </div>
        {tasteDna.genreBreakdown.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-zinc-300">
              <span>{item.genre}</span>
              <span className="font-mono text-zinc-500">%{item.percentage}</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  i === 0
                    ? "bg-purple-500"
                    : i === 1
                    ? "bg-cyan-500"
                    : "bg-amber-400"
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
