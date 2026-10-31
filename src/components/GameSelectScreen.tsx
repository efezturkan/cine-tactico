"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Film, Globe, Shuffle, Award, Zap, Swords, Star,
  Clock, Users, Bot, Lock, ChevronRight, Layers, Play
} from "lucide-react";
import { PRESET_BOARDS } from "@/data/boards";
import { audio } from "@/utils/audio";

interface GameSelectScreenProps {
  onBack: () => void;
  onSelectBoard: (boardIndex: number, mode: "VS_BOT" | "PASS_AND_PLAY" | "ONLINE_ROOM") => void;
  onOpenCustomLobby: () => void;
}

const BOARD_META = [
  {
    index: 0,
    reel: "01",
    icon: Globe,
    color: "#d97706",
    colorBg: "rgba(217,119,6,0.08)",
    colorBorder: "rgba(217,119,6,0.35)",
    tag: "KLASİK",
    badge: "Tüm Filmler",
    desc: "Nolan, Tarantino, Scorsese. Dijital sinema arşivleriyle 3x3 taktik savaşı.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "NORMAL",
    isLive: false,
  },
  {
    index: 1,
    reel: "02",
    icon: Shuffle,
    color: "#a855f7",
    colorBg: "rgba(168,85,247,0.08)",
    colorBorder: "rgba(168,85,247,0.35)",
    tag: "YILDIZLAR",
    badge: "Yönetmen × Oyuncu",
    desc: "DiCaprio, Pitt, Hanks. Sinema tarihinin en büyük yıldızları saha doluyor.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "NORMAL",
    isLive: false,
  },
  {
    index: 2,
    reel: "03",
    icon: Award,
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.35)",
    tag: "OSCAR",
    badge: "Tür & Ödüller",
    desc: "En iyi film, tür kesişimleri, 8.5+ puanlı filmlerin karanlık bulmacaları.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "ZOR",
    isLive: false,
    isDailyPickup: true,
  },
  {
    index: 3,
    reel: "04",
    icon: Zap,
    color: "#8b151b",
    colorBg: "rgba(139,21,27,0.12)",
    colorBorder: "rgba(139,21,27,0.5)",
    tag: "DC vs MARVEL",
    badge: "⚡ Canlı Etkinlik",
    desc: "Batman mı Spider-Man mi? Evrenler çarpışıyor. Bu haftasonu 2x Makara ödülü.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "KOLAY",
    isLive: true,
  },
  {
    index: 4,
    reel: "05",
    icon: Film,
    color: "#06b6d4",
    colorBg: "rgba(6,182,212,0.08)",
    colorBorder: "rgba(6,182,212,0.35)",
    tag: "EPİK SCI-FI",
    badge: "Dune Evreni",
    desc: "Villeneuve, Nolan, Cameron. Bilim kurgunun altın çağı 3x3 arenaya dönüşüyor.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "ZOR",
    isLive: false,
  },
  {
    index: 5,
    reel: "06",
    icon: Star,
    color: "#f43f5e",
    colorBg: "rgba(244,63,94,0.08)",
    colorBorder: "rgba(244,63,94,0.35)",
    tag: "90'LAR KÜLT",
    badge: "Kült Arena",
    desc: "Pulp Fiction, Fight Club, Léon. 90'ların tüm karanlığını tahtaya taşı.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "ZOR",
    isLive: false,
  },
  {
    index: 6,
    reel: "07",
    icon: Film,
    color: "#eab308",
    colorBg: "rgba(234,179,8,0.08)",
    colorBorder: "rgba(234,179,8,0.35)",
    tag: "SİNEMA DEVLERİ",
    badge: "Ağır Sıkletler",
    desc: "DiCaprio, Christian Bale, Brad Pitt. Oscar ve drama devlerinin çatışması.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "NORMAL",
    isLive: false,
  },
  {
    index: 7,
    reel: "08",
    icon: Star,
    color: "#6366f1",
    colorBg: "rgba(99,102,241,0.08)",
    colorBorder: "rgba(99,102,241,0.35)",
    tag: "GERİLİM & GİZEM",
    badge: "Karanlık Zihinler",
    desc: "Fincher, Nolan, Villeneuve. Sinematik zeka oyunları ve başyapıtlar.",
    modes: ["VS_BOT", "PASS_AND_PLAY"],
    difficulty: "ZOR",
    isLive: false,
  },
];

const MODE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  VS_BOT: { label: "Yapay Zeka", icon: <Bot className="w-3 h-3" />, color: "text-cyan-400" },
  PASS_AND_PLAY: { label: "Pass & Play", icon: <Users className="w-3 h-3" />, color: "text-amber-400" },
  ONLINE_ROOM: { label: "Özel Oda", icon: <Swords className="w-3 h-3" />, color: "text-[#8b151b]" },
};

// Sprocket hole decoration
const SprocketColumn = ({ count = 14 }: { count?: number }) => (
  <div className="flex flex-col items-center justify-around py-3 gap-0" style={{ minHeight: "100%" }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          width: 10,
          height: 7,
          background: "#07080b",
          borderRadius: 2,
          border: "1px solid #2a2b35",
          flexShrink: 0,
        }}
      />
    ))}
  </div>
);

export const GameSelectScreen: React.FC<GameSelectScreenProps> = ({
  onBack,
  onSelectBoard,
  onOpenCustomLobby,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const selectedMeta = selectedIndex !== null ? BOARD_META[selectedIndex] : null;

  const handleSelectBoard = (boardIndex: number) => {
    audio.playSelect();
    setSelectedIndex(boardIndex);
  };

  const handlePlay = (mode: "VS_BOT" | "PASS_AND_PLAY") => {
    if (selectedIndex === null) return;
    audio.playCombo(3);
    onSelectBoard(selectedIndex, mode);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col font-sans"
      style={{ background: "#07080b" }}
    >
      {/* Film strip borders */}
      <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col items-center overflow-hidden opacity-60">
        <SprocketColumn count={20} />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-5 flex flex-col items-center overflow-hidden opacity-60">
        <SprocketColumn count={20} />
      </div>

      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
        }}
      />

      {/* Top velvet accent bar */}
      <div
        className="h-0.5 w-full flex-shrink-0 z-10 relative"
        style={{ background: "linear-gradient(to right, transparent, #8b151b 30%, #8b151b 70%, transparent)" }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-[#1a1c24] mx-5">
        <button
          onClick={() => { audio.playSelect(); onBack(); }}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">Geri</span>
        </button>

        <div className="text-center">
          <div className="text-[9px] font-black text-[#8b151b] tracking-[0.25em] uppercase">
            KODAK 35mm · SELECT BOARD
          </div>
          <h2 className="text-sm font-black text-white tracking-widest uppercase">
            ARENA SEÇ
          </h2>
        </div>

        <div className="w-16" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 relative z-10">

        {/* Board Grid */}
        <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
          {BOARD_META.map((meta) => {
            const Icon = meta.icon;
            const isSelected = selectedIndex === meta.index;
            const board = PRESET_BOARDS[meta.index];

            return (
              <button
                key={meta.index}
                onClick={() => handleSelectBoard(meta.index)}
                className="relative text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] border-2"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${meta.colorBg}, rgba(7,8,11,0.95))`
                    : "rgba(14,16,24,0.8)",
                  borderColor: isSelected ? meta.color : "#1a1c24",
                  boxShadow: isSelected
                    ? `0 0 20px ${meta.color}30, 0 4px 16px rgba(0,0,0,0.6)`
                    : "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                {/* Live badge */}
                {meta.isLive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8b151b] text-white text-[8px] font-black uppercase tracking-wider z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    CANLI
                  </div>
                )}

                {/* Daily badge */}
                {meta.isDailyPickup && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[8px] font-black z-10">
                    <Clock className="w-2.5 h-2.5" />
                    GÜNÜN KADRESİ
                  </div>
                )}

                <div className="flex items-center gap-3 p-3">
                  {/* Reel number */}
                  <div
                    className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border"
                    style={{
                      background: meta.colorBg,
                      borderColor: meta.colorBorder,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                    <span className="text-[7px] font-black mt-0.5" style={{ color: meta.color }}>
                      REEL #{meta.reel}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="text-[9px] font-black uppercase tracking-wider"
                        style={{ color: meta.color }}
                      >
                        {meta.tag}
                      </span>
                      <span className="text-[8px] text-zinc-500 font-bold">·</span>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase">
                        {meta.difficulty}
                      </span>
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {board?.title || meta.badge}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                      {meta.desc}
                    </div>
                  </div>

                  <ChevronRight
                    className="w-4 h-4 transition-colors shrink-0"
                    style={{ color: isSelected ? meta.color : "#4b5563" }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom / Tournament Row */}
        <div className="max-w-md mx-auto mt-3">
          <div
            className="h-px w-full mb-3"
            style={{ background: "linear-gradient(to right, transparent, #2a1518, transparent)" }}
          />
          <button
            onClick={() => { audio.playSelect(); onOpenCustomLobby(); }}
            className="w-full p-3 rounded-2xl border border-[#2a1518] text-left flex items-center gap-3 transition-all active:scale-[0.98] hover:border-[#8b151b]/40"
            style={{ background: "rgba(139,21,27,0.05)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#8b151b]/10 border border-[#8b151b]/30 flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4 text-[#8b151b]" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-white">ÖZEL DÜELLO & TURNUVA</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                1v1 Özel Oda · 8 Kişilik Şampiyona · Public / Private
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8b151b]/60" />
          </button>
        </div>

        {/* Bottom padding */}
        <div className="h-36" />
      </div>

      {/* Bottom Action Area — mode picker + play */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-4 border-t border-[#1a1c24]"
        style={{
          background: "linear-gradient(to top, #07080b 80%, transparent)",
        }}
      >
        <div className="max-w-md mx-auto">
          {selectedMeta ? (
            <>
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 text-center">
                MOD SEÇ — {selectedMeta.tag}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => handlePlay("VS_BOT")}
                  className="py-3 px-4 rounded-2xl border transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    borderColor: "rgba(6,182,212,0.3)",
                  }}
                >
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="text-[10px] font-black text-white">Yapay Zeka</div>
                    <div className="text-[8px] text-cyan-400">Solo / Pratik</div>
                  </div>
                </button>
                <button
                  onClick={() => handlePlay("PASS_AND_PLAY")}
                  className="py-3 px-4 rounded-2xl border transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(217,119,6,0.08)",
                    borderColor: "rgba(217,119,6,0.3)",
                  }}
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="text-[10px] font-black text-white">Pass & Play</div>
                    <div className="text-[8px] text-amber-400">Aynı Ekranda</div>
                  </div>
                </button>
              </div>

              {/* Big Play Button */}
              <button
                onClick={() => handlePlay("VS_BOT")}
                className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, #8b151b, #b01e25)`,
                  boxShadow: "0 8px 32px rgba(139,21,27,0.5), 0 2px 8px rgba(0,0,0,0.6)",
                  color: "white",
                }}
              >
                <Play className="w-5 h-5 fill-white" />
                MAÇ BAŞLAT — {selectedMeta.tag}
              </button>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                Yukarıdan bir arena seç
              </div>
              <div className="text-[10px] text-zinc-700 mt-1">
                6 farklı sinema arenası seni bekliyor
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSelectScreen;
