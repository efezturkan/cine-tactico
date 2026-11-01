"use client";

import React, { useState, useMemo } from "react";
import { TasteDna } from "@/types/profile";
import { Dna, Share2, Sparkles, Film, Star, Check, Copy, ExternalLink, Link2, Edit3 } from "lucide-react";
import { audio } from "@/utils/audio";
import { assetResolver } from "@/utils/assetResolver";

interface TasteDnaCardProps {
  tasteDna: TasteDna;
  username: string;
  letterboxdUsername?: string;
  onUpdateLetterboxd?: (handle: string) => void;
}

export const TasteDnaCard: React.FC<TasteDnaCardProps> = ({
  tasteDna,
  username,
  letterboxdUsername,
  onUpdateLetterboxd,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingLb, setIsEditingLb] = useState(false);
  const [lbInput, setLbInput] = useState(letterboxdUsername || "");
  const [lbSaved, setLbSaved] = useState(false);

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

  const dirAsset = useMemo(
    () => assetResolver.resolveForDirector(tasteDna.topDirector),
    [tasteDna.topDirector]
  );

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
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-zinc-500 block">Favori Yönetmen</span>
          <div className="flex items-center gap-1.5 mt-0.5 justify-center max-w-full">
            {dirAsset.isAvailable && dirAsset.src && (
              <img
                src={dirAsset.src}
                alt=""
                className="w-4 h-4 rounded-full object-cover border border-amber-400/50 shrink-0"
              />
            )}
            <span className="text-xs font-black text-amber-400 truncate">
              {tasteDna.topDirector}
            </span>
          </div>
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

      {/* ── LETTERBOXD SİMBİYOTİK KÖPRÜ MODÜLÜ ─── */}
      <div className="mt-4 pt-3 border-t border-purple-500/20">
        <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase text-emerald-400 tracking-wider">
                LETTERBOXD KİMLİĞİ
              </span>
            </div>
            {letterboxdUsername && !isEditingLb && (
              <a
                href={`https://letterboxd.com/${letterboxdUsername}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-zinc-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Profili Gör</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          {isEditingLb ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">@</span>
                <input
                  type="text"
                  value={lbInput}
                  onChange={(e) => setLbInput(e.target.value)}
                  placeholder="kullaniciadi"
                  className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500/50 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  const cleaned = lbInput.trim().replace(/^@/, "");
                  if (onUpdateLetterboxd && cleaned) {
                    onUpdateLetterboxd(cleaned);
                  }
                  setIsEditingLb(false);
                  setLbSaved(true);
                  setTimeout(() => setLbSaved(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shrink-0 transition-all active:scale-95"
              >
                Kaydet
              </button>
            </div>
          ) : letterboxdUsername ? (
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-black text-white font-mono truncate">
                  @{letterboxdUsername}
                </span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  Onaylı Sinefil ✓
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setIsEditingLb(true);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                title="Değiştir"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-[10px] text-zinc-400">
                Profilini bağla, izlediğin yönetmenleri arenaya taşı.
              </span>
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setIsEditingLb(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black shrink-0 transition-all active:scale-95 flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                <span>Bağla (+100 🎞️)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
