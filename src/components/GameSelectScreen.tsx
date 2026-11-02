"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Film,
  Ticket,
  Swords,
  User,
  Sparkles,
  Zap,
  Award,
  Star,
  Shuffle,
  Globe,
  Clapperboard,
  Compass,
  Eye,
  Layers,
  Flame,
  Radio,
  Clock,
} from "lucide-react";
import { PRESET_BOARDS } from "@/data/boards";
import { audio } from "@/utils/audio";

export type BoardCategory = "Hepsi" | "Karakter" | "Ters Kadraj" | "Konsept" | "Klasik";

interface GameSelectScreenProps {
  onBack: () => void;
  onSelectBoard: (boardIndex: number, mode: "VS_BOT" | "PASS_AND_PLAY" | "ONLINE_ROOM") => void;
  onOpenCustomLobby: () => void;
  onOpenProfileModal?: () => void;
}

interface BoardPosterMeta {
  index: number;
  reel: string;
  category: "Karakter" | "Ters Kadraj" | "Konsept" | "Klasik";
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string; // Gradient accent
}

// 17 Preset Boards Mapped to TUR 3 Poster Meta
const POSTERS_DATA: BoardPosterMeta[] = [
  {
    index: 0,
    reel: "01",
    category: "Klasik",
    badge: "AUTEUR",
    desc: "Nolan, Tarantino, Scorsese · 3x3 Usta Yönetmenler",
    icon: Clapperboard,
    tone: "from-amber-500/15 via-transparent to-transparent",
  },
  {
    index: 1,
    reel: "02",
    category: "Karakter",
    badge: "YILDIZLAR",
    desc: "De Niro, Brad Pitt, Cillian Murphy · Suç & Oscar",
    icon: Star,
    tone: "from-purple-500/15 via-transparent to-transparent",
  },
  {
    index: 2,
    reel: "03",
    category: "Konsept",
    badge: "TERS KÖŞE",
    desc: "Plot twist & akıl oyunları · Şok edici finaller",
    icon: Eye,
    tone: "from-emerald-500/15 via-transparent to-transparent",
  },
  {
    index: 3,
    reel: "04",
    category: "Konsept",
    badge: "UZAY & ZAMAN",
    desc: "Solucan delikleri ve zamansal paradokslar",
    icon: Compass,
    tone: "from-cyan-500/15 via-transparent to-transparent",
  },
  {
    index: 4,
    reel: "05",
    category: "Konsept",
    badge: "TEK MEKAN",
    desc: "Klosterfobik gerilimler ve labirent kurgular",
    icon: Layers,
    tone: "from-yellow-600/15 via-transparent to-transparent",
  },
  {
    index: 5,
    reel: "06",
    category: "Konsept",
    badge: "YAPAY ZEKA",
    desc: "Makinelerin yükselişi ve insan iradesi",
    icon: Radio,
    tone: "from-blue-500/15 via-transparent to-transparent",
  },
  {
    index: 6,
    reel: "07",
    category: "Konsept",
    badge: "ANTİ-KAHRAMAN",
    desc: "Karanlık figürler ve ahlaki gri alanlar",
    icon: Flame,
    tone: "from-rose-600/15 via-transparent to-transparent",
  },
  {
    index: 7,
    reel: "08",
    category: "Ters Kadraj",
    badge: "TERS KADRAJ",
    desc: "Oynamadıkları filmleri bul · Negatif eleme",
    icon: Shuffle,
    tone: "from-teal-500/15 via-transparent to-transparent",
  },
  {
    index: 8,
    reel: "09",
    category: "Ters Kadraj",
    badge: "MAFYA HANEDANI",
    desc: "Kesişmeyen suç yolları · Ters mantık matrisi",
    icon: Swords,
    tone: "from-red-600/15 via-transparent to-transparent",
  },
  {
    index: 9,
    reel: "10",
    category: "Klasik",
    badge: "GÜNÜN KADRAJI",
    desc: "Günün özel film kadrajı · 2x Makara bonusu",
    icon: Clock,
    tone: "from-amber-400/20 via-transparent to-transparent",
  },
  {
    index: 10,
    reel: "11",
    category: "Karakter",
    badge: "DC vs MARVEL",
    desc: "Çizgi roman evrenlerinin sinematik çarpışması",
    icon: Zap,
    tone: "from-crimson-600/20 via-transparent to-transparent",
  },
  {
    index: 11,
    reel: "12",
    category: "Klasik",
    badge: "SCI-FI",
    desc: "Villeneuve, Nolan, Cameron · Bilim kurgu kültleri",
    icon: Globe,
    tone: "from-cyan-600/15 via-transparent to-transparent",
  },
  {
    index: 12,
    reel: "13",
    category: "Klasik",
    badge: "90'LAR KÜLT",
    desc: "Tarantino & Fincher · Bağımsız sinema çağı",
    icon: Film,
    tone: "from-orange-500/15 via-transparent to-transparent",
  },
  {
    index: 13,
    reel: "14",
    category: "Karakter",
    badge: "BAŞ AKTÖRLER",
    desc: "Method acting ustaları · Gişe & prestij savaşı",
    icon: Sparkles,
    tone: "from-yellow-500/15 via-transparent to-transparent",
  },
  {
    index: 14,
    reel: "15",
    category: "Klasik",
    badge: "GERİLİM",
    desc: "Kusursuz planlar, çözümsüz sırlar & akıl oyunları",
    icon: Eye,
    tone: "from-slate-500/15 via-transparent to-transparent",
  },
  {
    index: 15,
    reel: "16",
    category: "Konsept",
    badge: "OSCAR",
    desc: "Akademi heykeli kazananlar & prestij avı",
    icon: Award,
    tone: "from-amber-500/20 via-transparent to-transparent",
  },
  {
    index: 16,
    reel: "17",
    category: "Karakter",
    badge: "CO-STARS",
    desc: "Aynı sette devleşen efsane aktör kadroları",
    icon: Star,
    tone: "from-violet-500/15 via-transparent to-transparent",
  },
];

const CATEGORIES: BoardCategory[] = [
  "Hepsi",
  "Karakter",
  "Ters Kadraj",
  "Konsept",
  "Klasik",
];

// 35mm film edge perforations
const SprocketColumn = ({ count = 28 }: { count?: number }) => (
  <div className="flex flex-col items-center justify-around py-3 gap-2 h-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-2.5 h-3.5 rounded-[2px] bg-[#07080b] border border-white/10 shrink-0"
      />
    ))}
  </div>
);

export const GameSelectScreen: React.FC<GameSelectScreenProps> = ({
  onBack,
  onSelectBoard,
  onOpenCustomLobby,
  onOpenProfileModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<BoardCategory>("Hepsi");

  // Filtered poster list
  const filteredPosters = useMemo(() => {
    if (activeCategory === "Hepsi") return POSTERS_DATA;
    return POSTERS_DATA.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const handleLaunchPoster = (poster: BoardPosterMeta) => {
    audio.playSelect();
    onSelectBoard(poster.index, "VS_BOT");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col font-sans bg-[#0B0D12] overflow-hidden select-none">
      {/* 35mm Film Sprocket Strips (Left & Right) */}
      <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none z-0">
        <SprocketColumn count={32} />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none z-0">
        <SprocketColumn count={32} />
      </div>

      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
        }}
      />

      {/* Top velvet gold accent line */}
      <div
        className="h-0.5 w-full flex-shrink-0 z-20 relative"
        style={{
          background: "linear-gradient(to right, transparent, #D9A441 30%, #D9A441 70%, transparent)",
          opacity: 0.4,
        }}
      />

      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/5 bg-[#0B0D12]/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => {
            audio.playSelect();
            onBack();
          }}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors active:scale-95 px-2 py-1 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 text-[#D9A441]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Gişe</span>
        </button>

        <div className="text-center">
          <div className="text-[9px] font-mono font-bold text-[#D9A441] tracking-[0.25em] uppercase">
            CINE-XOX · 35MM
          </div>
          <h1 className="text-base sm:text-lg font-serif font-bold text-[#E8E6E1] tracking-wider uppercase">
            Vizyondakiler
          </h1>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-mono text-zinc-500 tracking-wider font-semibold">
            {filteredPosters.length} AFİŞ
          </span>
        </div>
      </header>

      {/* Filter Strip */}
      <div className="relative z-20 flex items-center gap-1.5 overflow-x-auto scrollbar-none px-4 sm:px-6 py-2 border-b border-white/5 bg-[#0D0F15]">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                audio.playSelect();
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? "bg-[#181B22] text-[#D9A441] border border-[#D9A441]/50 shadow-sm"
                  : "bg-[#12141A] text-zinc-400 border border-white/5 hover:text-white hover:border-white/15"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 2-Column Poster Grid */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-3 pb-24 custom-scrollbar relative z-10 max-w-xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3">
          {filteredPosters.map((poster) => {
            const board = PRESET_BOARDS[poster.index];
            const Icon = poster.icon;

            return (
              <button
                key={poster.index}
                type="button"
                data-poster-card="true"
                onClick={() => handleLaunchPoster(poster)}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden text-left p-3 flex flex-col justify-between bg-[#12141A] border border-white/10 hover:border-[#D9A441]/50 transition-all duration-200 active:scale-[0.98] shadow-md"
              >
                {/* Mood Gradient Accent */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${poster.tone} pointer-events-none`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-transparent to-transparent opacity-90 pointer-events-none" />

                {/* Viewfinder corner brackets */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/20 pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/20 pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/20 pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/20 pointer-events-none" />

                {/* Top Poster Meta */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span className="font-mono text-[9px] font-semibold text-[#D9A441]/90 tracking-widest">
                    MAKARA #{poster.reel}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase bg-white/5 border border-white/10 text-zinc-300">
                    {poster.badge}
                  </span>
                </div>

                {/* Center Cinema Reel Emblem */}
                <div className="relative z-10 flex items-center justify-center my-auto py-2">
                  <div className="w-12 h-12 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/30 group-hover:text-[#D9A441] group-hover:border-[#D9A441]/40 group-hover:scale-105 transition-all duration-200 shadow-inner">
                    <Icon className="w-5 h-5 stroke-[1.7]" />
                  </div>
                </div>

                {/* Bottom Content: Title & Action */}
                <div className="relative z-10 w-full mt-auto">
                  <h2 className="font-serif font-bold text-white text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-[#D9A441] transition-colors">
                    {board?.title || `Makara #${poster.reel}`}
                  </h2>
                  <p className="text-[9px] text-zinc-400 font-sans truncate mt-1">
                    {poster.desc}
                  </p>

                  {/* Card Action Row */}
                  <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-mono text-zinc-500 font-medium tracking-wider">
                      3×3 MATRİS
                    </span>
                    <span className="text-[8px] font-mono text-[#D9A441] font-bold tracking-wider flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      BAŞLAT →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Bar — 4 tabs (Vizyondakiler active in gold) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-3 pt-2 bg-[#0B0D12]/95 backdrop-blur-md border-t border-white/5 max-w-lg mx-auto"
        style={{
          paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))",
        }}
      >
        {[
          {
            label: "Gişe",
            icon: Ticket,
            active: false,
            act: () => {
              audio.playSelect();
              onBack();
            },
          },
          {
            label: "Vizyondakiler",
            icon: Film,
            active: true,
            act: undefined,
          },
          {
            label: "Özel Gösterim",
            icon: Swords,
            active: false,
            act: () => {
              audio.playSelect();
              onOpenCustomLobby();
            },
          },
          {
            label: "Sinefil Kartı",
            icon: User,
            active: false,
            act: () => {
              audio.playSelect();
              if (onOpenProfileModal) onOpenProfileModal();
              else onBack();
            },
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={tab.act}
              className={`flex flex-col items-center transition-all active:scale-95 px-3 py-1 rounded-xl ${
                tab.active
                  ? "bg-[#181B22] border border-[#D9A441]/40"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon
                className="w-4 h-4 stroke-[1.8]"
                style={{ color: tab.active ? "#D9A441" : "#8A8F9A" }}
              />
              <span
                className="text-[9px] font-bold mt-0.5 tracking-wide"
                style={{ color: tab.active ? "#D9A441" : "#8A8F9A" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default GameSelectScreen;
