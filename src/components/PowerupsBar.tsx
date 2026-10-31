"use client";

import React from "react";
import { PowerupInventory } from "@/types/profile";
import { Clock, Lightbulb, Bomb, Zap, ShoppingBag } from "lucide-react";
import { audio } from "@/utils/audio";

interface PowerupsBarProps {
  powerups: PowerupInventory;
  onUseFreeze: () => void;
  onUseHint: () => void;
  onUseBomb: () => void;
  onUseDouble: () => void;
  onOpenShop: () => void;
  isDoubleActive?: boolean;
}

export const PowerupsBar: React.FC<PowerupsBarProps> = ({
  powerups,
  onUseFreeze,
  onUseHint,
  onUseBomb,
  onUseDouble,
  onOpenShop,
  isDoubleActive = false,
}) => {
  return (
    <div className="w-full max-w-md mx-auto my-1.5 p-2 rounded-2xl bg-[#0a1122]/90 border border-sky-500/20 backdrop-blur-md shadow-lg flex items-center justify-between gap-1.5 z-20">
      <div className="flex items-center gap-1 pl-1">
        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block font-mono">
          JOKERLER
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* 1. Süre Dondurucu (+15s) */}
        <button
          onClick={() => {
            if ((powerups.freezeTime || 0) > 0) {
              audio.playPowerup();
              onUseFreeze();
            } else {
              audio.playSelect();
              onOpenShop();
            }
          }}
          className={`py-1 px-2 rounded-xl flex items-center gap-1 text-[10px] font-black border transition-all active:scale-95 ${
            (powerups.freezeTime || 0) > 0
              ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
          title="Shot clock süresine +15s ekle"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>+15s</span>
          <span className="text-[9px] px-1 py-0.2 bg-white/10 rounded-full text-white">
            {powerups.freezeTime || 0}
          </span>
        </button>

        {/* 2. Yönetmen İpucu */}
        <button
          onClick={() => {
            if ((powerups.directorHint || 0) > 0) {
              audio.playPowerup();
              onUseHint();
            } else {
              audio.playSelect();
              onOpenShop();
            }
          }}
          className={`py-1 px-2 rounded-xl flex items-center gap-1 text-[10px] font-black border transition-all active:scale-95 ${
            (powerups.directorHint || 0) > 0
              ? "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
          title="Zor kare için ipucu fısılda"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>İpucu</span>
          <span className="text-[9px] px-1 py-0.2 bg-white/10 rounded-full text-white">
            {powerups.directorHint || 0}
          </span>
        </button>

        {/* 3. Bomba / Çekim Tekrarı */}
        <button
          onClick={() => {
            if ((powerups.bombRetake || 0) > 0) {
              audio.playPowerup();
              onUseBomb();
            } else {
              audio.playSelect();
              onOpenShop();
            }
          }}
          className={`py-1 px-2 rounded-xl flex items-center gap-1 text-[10px] font-black border transition-all active:scale-95 ${
            (powerups.bombRetake || 0) > 0
              ? "bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
          title="Rakibin karesini sıfırla"
        >
          <Bomb className="w-3.5 h-3.5 text-rose-400" />
          <span>Bomba</span>
          <span className="text-[9px] px-1 py-0.2 bg-white/10 rounded-full text-white">
            {powerups.bombRetake || 0}
          </span>
        </button>

        {/* 4. Gişe Rekoru (2x Puan) */}
        <button
          onClick={() => {
            if ((powerups.doublePoints || 0) > 0) {
              audio.playPowerup();
              onUseDouble();
            } else {
              audio.playSelect();
              onOpenShop();
            }
          }}
          className={`py-1 px-2 rounded-xl flex items-center gap-1 text-[10px] font-black border transition-all active:scale-95 ${
            isDoubleActive
              ? "bg-emerald-500 text-cinema-dark border-emerald-400 animate-pulse font-extrabold"
              : (powerups.doublePoints || 0) > 0
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
          title="Hamle puanını 2'ye katla"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>2x</span>
          <span className="text-[9px] px-1 py-0.2 bg-white/10 rounded-full">
            {powerups.doublePoints || 0}
          </span>
        </button>

        {/* Market Kısayolu */}
        <button
          onClick={() => {
            audio.playSelect();
            onOpenShop();
          }}
          className="p-1 rounded-lg bg-[#11192d] hover:bg-[#16213b] border border-sky-500/30 text-amber-400 active:scale-90 transition-transform"
          title="Marketten Joker Satın Al"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
