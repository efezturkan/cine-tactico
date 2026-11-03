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
  HelpCircle,
} from "lucide-react";
import { PRESET_BOARDS } from "@/data/boards";
import { audio } from "@/utils/audio";
import { BottomNav } from "./ui/BottomNav";

export type BoardCategory = "Hepsi" | "Karakter" | "Ters Kadraj" | "Konsept" | "Klasik";

interface GameSelectScreenProps {
  onBack: () => void;
  onSelectBoard: (boardIndex: number, mode: "VS_BOT" | "PASS_AND_PLAY" | "ONLINE_ROOM") => void;
  onOpenCustomLobby: () => void;
  onOpenProfileModal?: () => void;
  onOpenHowToPlay?: () => void;
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
    desc: "Kesişmeyen suç yolları · Ters mantık kadrajı",
    icon: Swords,
    tone: "from-red-600/15 via-transparent to-transparent",
  },
  {
    index: 9,
    reel: "10",
    category: "Klasik",
    badge: "GÜNÜN KADRAJI",
    desc: "Günün özel film kadrajı · Günlük prestij",
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
    badge: "KARAKTER",
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
  onOpenHowToPlay,
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

      {/* 7B.1 Top Bar: Serif Başlık Ortada, Sağda "?" Butonu (44x44 dokunma alanı, 20px soluk çizgi ikon) */}
      <header className="relative z-20 flex items-center justify-center px-4 py-3 border-b border-white/5 bg-[#0B0D12]/95 backdrop-blur-sm min-h-[52px]">
        <h1 className="text-lg sm:text-xl font-serif font-bold text-[#E8E6E1] tracking-wider text-center">
          Vizyondakiler
        </h1>
        {onOpenHowToPlay && (
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              onOpenHowToPlay();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8A8F9A] hover:text-[#E8E6E1] transition-colors"
            title="Nasıl oynanır?"
            aria-label="Nasıl oynanır rehberi"
          >
            <HelpCircle className="w-5 h-5 stroke-[1.5]" />
          </button>
        )}
      </header>

      {/* 7B.2 Filter Strip: Sans, Normal Harf */}
      <div className="relative z-20 flex items-center gap-2 overflow-x-auto scrollbar-none px-4 sm:px-6 py-2.5 border-b border-white/5 bg-[#0D0F15]">
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium normal-case whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? "bg-[#181B22] text-[#D9A441] border border-[#D9A441]/50 shadow-sm"
                  : "bg-transparent text-[#8A8F9A] border border-white/10 hover:text-[#E8E6E1] hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 2-Column Poster Grid */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-3 pb-24 custom-scrollbar relative z-10 max-w-xl mx-auto w-full">
        {filteredPosters.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            <Film className="w-8 h-8 text-[#D9A441]/40 mx-auto mb-2" />
            <p className="font-serif text-sm text-[#E8E6E1]">Arşivde henüz kayıt yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredPosters.map((poster) => {
              const board = PRESET_BOARDS[poster.index];
              const fullTitle = board?.title || `Makara #${poster.reel}`;
              const displayTitle = fullTitle.includes(":")
                ? fullTitle.split(":")[0].trim()
                : fullTitle;
              const subTitle = fullTitle.includes(":")
                ? fullTitle.split(":")[1].trim()
                : poster.desc;

              return (
                <button
                  key={poster.index}
                  type="button"
                  data-poster-card="true"
                  onClick={() => handleLaunchPoster(poster)}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden text-left p-3.5 flex flex-col justify-between bg-[#12141A] border border-white/10 hover:border-[#D9A441]/50 transition-all duration-200 active:scale-[0.98] shadow-md"
                >
                  {/* Mood Gradient Accent */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${poster.tone} pointer-events-none`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/40 to-transparent opacity-95 pointer-events-none" />

                  {/* Viewfinder corner brackets */}
                  <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/20 pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/20 pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/20 pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/20 pointer-events-none" />

                  {/* Top Poster Meta: Makara No + Rozet */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="font-mono text-[9px] font-semibold text-[#D9A441]/90 tracking-widest">
                      MAKARA #{poster.reel}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-semibold uppercase bg-white/5 border border-white/10 text-[#8A8F9A]">
                      {poster.badge}
                    </span>
                  </div>

                  {/* 7B.3 Center/Bottom Content: Büyük Serif displayTitle, Açıklama, Sağ Altta Ok */}
                  <div className="relative z-10 w-full mt-auto">
                    <h2 className="font-serif font-bold text-[#E8E6E1] text-base sm:text-lg leading-snug group-hover:text-[#D9A441] transition-colors line-clamp-2">
                      {displayTitle}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-[#8A8F9A] font-sans line-clamp-2 mt-1 leading-tight">
                      {subTitle}
                    </p>

                    {/* Sağ Altta Küçük Ok */}
                    <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-end">
                      <span className="text-[#D9A441] font-bold text-sm group-hover:translate-x-1 transition-transform">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Bar — 4 tabs (Vizyondakiler active in gold) */}
      <BottomNav
        activeTab="GAME_SELECT"
        onSelectTab={(tabId) => {
          if (tabId === "HOME") {
            onBack();
          } else if (tabId === "CUSTOM_ROOM") {
            onOpenCustomLobby();
          } else if (tabId === "PROFILE") {
            if (onOpenProfileModal) onOpenProfileModal();
            else onBack();
          }
        }}
      />
    </div>
  );
};

export default GameSelectScreen;
