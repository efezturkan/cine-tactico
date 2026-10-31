"use client";

import React, { useState } from "react";
import {
  Gamepad2,
  Film,
  Sparkles,
  Trophy,
  Shuffle,
  Flame,
  Clock,
  Layers,
  ChevronRight,
  Eye,
  Check,
  X,
  Play,
  Tv,
  HelpCircle,
} from "lucide-react";
import { audio } from "@/utils/audio";

import { PRESET_BOARDS } from "@/data/boards";

interface GameModesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayableBoard: (boardIdx: number, modeTitle: string) => void;
}

export const GameModesHubModal: React.FC<GameModesHubModalProps> = ({
  isOpen,
  onClose,
  onSelectPlayableBoard,
}) => {
  const [activeTab, setActiveTab] = useState<"ACTIVE_MODES" | "COMING_SOON" | "COMBINATIONS">("ACTIVE_MODES");
  const [modeFilter, setModeFilter] = useState<"ALL" | "CLASSIC" | "COSTARS" | "REVERSE" | "CONCEPT">("ALL");
  const [registeredTitle, setRegisteredTitle] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. OYNANABİLİR CINEXOX MASALARI & ÇARPIŞMALARI (Gerçek PRESET_BOARDS Eşleştirmesi)
  const PLAYABLE_ARENAS = [
    {
      id: "board_costars_legends",
      category: "COSTARS",
      title: "⭐ Karakter × Karakter (Co-Stars: Ortak Film)",
      badge: "✨ Yeni & Çok İstenen",
      color: "text-amber-300",
      border: "border-amber-400/50",
      bg: "bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-yellow-500/15",
      desc: "Christian Bale, Leonardo DiCaprio, Cillian Murphy kesişiminde Tom Hardy, Michael Caine, Matt Damon. İki karakterin/aktörün birlikte oynadığı ortak filmleri bul!",
    },
    {
      id: "board_master_1",
      category: "CLASSIC",
      title: "🎬 Auteur Savaşları (Yönetmen × Oyuncu)",
      badge: "Popüler & Dengeli",
      color: "text-amber-400",
      border: "border-amber-400/40",
      bg: "bg-amber-400/10",
      desc: "Christopher Nolan, Tarantino, Scorsese kesişiminde Leonardo DiCaprio, Brad Pitt ve Christian Bale.",
    },
    {
      id: "board_reverse_nolan_titans",
      category: "REVERSE",
      title: "🔄 Ters Kadraj: Nolan & Yıldızlar Kadrosu",
      badge: "Hafıza & Hız",
      color: "text-emerald-400",
      border: "border-emerald-400/40",
      bg: "bg-emerald-500/10",
      desc: "İki filmin kesişimindeki ortak oyuncuyu klavyeyle doğrudan yaz! Inception, The Prestige, Interstellar vs Dunkirk, Oppenheimer.",
    },
    {
      id: "board_reverse_mafia_cult",
      category: "REVERSE",
      title: "🔄 Ters Kadraj: Suç Dehaları & Mafya Hanedanı",
      badge: "Kült Hafıza",
      color: "text-emerald-400",
      border: "border-emerald-400/40",
      bg: "bg-emerald-500/10",
      desc: "The Godfather, Goodfellas, Scarface vs Heat, Taxi Driver, Casino. İki suç klasiğinin ortak aktörünü hatırla ve yaz!",
    },
    {
      id: "board_concept_mindbending",
      category: "CONCEPT",
      title: "🧠 Sinefil Konsept: Zihin Bükücüler & Gizem",
      badge: "14 Kült Tema",
      color: "text-indigo-400",
      border: "border-indigo-400/40",
      bg: "bg-indigo-500/10",
      desc: "Plot Twist, Zaman Yolculuğu ve Paranoya temalarında Christopher Nolan, Denis Villeneuve ve David Fincher.",
    },
    {
      id: "board_concept_puzzle_chamber",
      category: "CONCEPT",
      title: "📦 Sinefil Konsept: Tek Mekan & Labirent",
      badge: "Kurgusal Kriz",
      color: "text-indigo-400",
      border: "border-indigo-400/40",
      bg: "bg-indigo-500/10",
      desc: "Tek Mekan, Kurgusal Labirent ve Ahlaki İkilem temalarında Alfred Hitchcock, Quentin Tarantino ve David Fincher.",
    },
    {
      id: "board_master_2",
      category: "CLASSIC",
      title: "🌟 Yıldız Oyuncular & Tür Çarpışması",
      badge: "Oyuncu Odaklı",
      color: "text-cyan-400",
      border: "border-cyan-400/40",
      bg: "bg-cyan-400/10",
      desc: "Brad Pitt, Cillian Murphy, Robert De Niro satırları; Suç, 8.0+ Puan ve 2010 Sonrası sütunları.",
    },
    {
      id: "board_dc_marvel",
      category: "CLASSIC",
      title: "⚡ DC vs MARVEL (Süper Kahraman Düellosu)",
      badge: "🔥 Popüler Mod",
      color: "text-rose-400",
      border: "border-rose-500/50",
      bg: "bg-gradient-to-r from-red-600/20 to-blue-600/20",
      desc: "Christian Bale (Batman), James Gunn, Ryan Reynolds kesişiminde DC Evreni x Marvel (MCU) x 8.0+ Puan Efsaneleri.",
    },
    {
      id: "board_dune_scifi",
      category: "CLASSIC",
      title: "🪐 Epik Bilim Kurgu: Dune & Nolan Evreni",
      badge: "Sci-Fi Efsaneleri",
      color: "text-amber-300",
      border: "border-amber-400/40",
      bg: "bg-amber-500/10",
      desc: "Denis Villeneuve, Christopher Nolan, Timothée Chalamet satırları; Bilim Kurgu, Oscar ve 8.0+ Puan sütunları.",
    },
    {
      id: "board_90s_cult",
      category: "CLASSIC",
      title: "🩸 90'lar Kült Arenası: Pulp Fiction & Fight Club",
      badge: "Kült Bağımsızlar",
      color: "text-emerald-400",
      border: "border-emerald-400/40",
      bg: "bg-emerald-400/10",
      desc: "Brad Pitt (Tyler Durden), Tarantino (Pulp Fiction), Fincher (Se7en) satırları; Suç, 8.0+ Puan ve 90'lar sütunları.",
    },
    {
      id: "board_daily_today",
      category: "CLASSIC",
      title: "📅 Günün XOX Meydan Okuması",
      badge: "Günlük Rutin",
      color: "text-purple-400",
      border: "border-purple-400/40",
      bg: "bg-purple-400/10",
      desc: "Tüm dünyayla aynı tahtada yarış. Bilim Kurgu, Dram ve 8.0+ Puan kesişiminde en nadir filmleri bul!",
    },
  ];

  // 2. DİĞER OYUN MODLARI (PLACEHOLDER'LAR)
  const COMING_SOON_MODES = [
    {
      id: "wordle",
      title: "Cine-Wordle: Günün Gizli Filmi",
      tag: "Kelime / Tahmin",
      desc: "6 tahminde gizli filmi bul. Her denemede Tür, Yönetmen, Çıkış Yılı ve Puanına göre yeşil/sarı ipuçları açılır.",
      status: "Alfa Aşamasında",
    },
    {
      id: "nerdle",
      title: "Cine2Nerdle: 1v1 Zincirleme Düello",
      tag: "Gerçek Zamanlı Hız",
      desc: "Her oyuncu sırayla bir önceki filmle ortak oyuncusu veya yönetmeni olan yeni bir film söyler. Süresi biten elenir!",
      status: "Prototip Hazır",
    },
    {
      id: "mosaic",
      title: "Afiş Mozaik (Blur Guess)",
      tag: "Görsel Refleks",
      desc: "Bulanık ve pikselli film afişi saniye saniye netleşir. En az pikselli anda filmi doğru yazan maksimum puanı kapar.",
      status: "Tasarım Aşamasında",
    },
    {
      id: "boxoffice",
      title: "Gişe Arenası: Higher or Lower",
      tag: "Hızlı Tüketim (Block Blast Hızı)",
      desc: "'Oppenheimer mı daha çok hasılat yaptı yoksa Inception mı?' Tek tıkla yukarı/aşağı seç, seriyi sürdür, kombo yap!",
      status: "Geliştiriliyor",
    },
  ];

  // 3. MATEMATİKSEL KOMBİNATORYAL OLASILIK LİSTESİ (Kullanıcının fikir üretmesi için tüm varyasyonlar)
  const COMBINATORIAL_VARIATIONS = [
    { cat: "1. İsim & Kadro", combos: ["Yönetmen x Oyuncu", "Oyuncu x Oyuncu (Ortak Film / Co-Stars)", "Yönetmen x Yönetmen (Ortak Yapım)", "Yönetmen x Görüntü Yönetmeni (Roger Deakins vb.)"] },
    { cat: "2. Ödül & Prestij", combos: ["Yönetmen x Oscar Kazananı", "Oyuncu x Oscar / Altın Küre", "En İyi Film Adayı x Cannes / Altın Palmiye", "BAFTA x Metascore 90+"] },
    { cat: "3. Dönem & Zaman", combos: ["Dönem (90'lar, 2000'ler, 2010+) x Tür", "Dönem x Yönetmen (Örn: Nolan'ın 2000'ler filmleri)", "Süre (150+ Dakika Epik) x Dönem", "Yıl x Bütçe"] },
    { cat: "4. Finansal & Gişe", combos: ["1 Milyar $ Hasılat x Bağımsız Stüdyo", "Düşük Bütçe (<$5M) x Yüksek Hasılat (Gişe Mucizesi)", "Bütçe ($200M+) x Flop (Gişe Batığı)"] },
    { cat: "5. Müzik & Ses", combos: ["Besteci (Hans Zimmer, Morricone) x Yönetmen", "En İyi Orijinal Şarkı Oscarı x Müzikal Türü", "İkonik Film Müziği x Bilim Kurgu"] },
    { cat: "6. Dizi & Televizyon", combos: ["Platform (HBO, Netflix, Apple TV+) x Showrunner", "Mini Dizi x Emmy Ödülü", "9.0+ Puanlı Bölüm x Drama / Suç"] },
    { cat: "7. Kültür & Coğrafya", combos: ["Kore / Asya Sineması x Gerilim", "Fransız Yeni Dalgası x Yönetmen", "Türk Bağımsız Sineması x Festival Ödüllü"] },
    { cat: "8. Uyarlama & Kaynak", combos: ["Roman Uyarlaması x Yönetmen", "Çizgi Roman / DC / Marvel x Tür", "Gerçek Hayat Hikayesi (Biyografi) x Oscar"] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0a1122] border border-sky-500/20 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-white">
        {/* Üst Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-500/10">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-black tracking-wider uppercase font-mono text-zinc-100">
              OYUN MODLARI & <span className="text-amber-400">ARENA</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[#131f38] text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-1.5 my-3 p-1 rounded-2xl bg-[#0f172a] border border-sky-500/15 text-xs font-bold text-zinc-400">
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("ACTIVE_MODES");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "ACTIVE_MODES"
                ? "bg-amber-400 text-cinema-dark font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            Aktif Masalar ({PLAYABLE_ARENAS.length})
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("COMING_SOON");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "COMING_SOON"
                ? "bg-cyan-500 text-cinema-dark font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            Yeni Formatlar
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("COMBINATIONS");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "COMBINATIONS"
                ? "bg-purple-500 text-white font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            Olasılık Matrisi
          </button>
        </div>

        {/* 1. SEKME: OYNANABİLİR CINEXOX ARENALARI */}
        {activeTab === "ACTIVE_MODES" && (
          <div className="space-y-3">
            {/* Kategori Filtresi */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold text-zinc-400 scrollbar-none">
              <button
                onClick={() => setModeFilter("ALL")}
                className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap ${
                  modeFilter === "ALL"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                    : "bg-[#0f172a] hover:text-white border border-transparent"
                }`}
              >
                Hepsi
              </button>
              <button
                onClick={() => setModeFilter("COSTARS")}
                className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                  modeFilter === "COSTARS"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                    : "bg-[#0f172a] hover:text-white border border-transparent"
                }`}
              >
                ⭐ Karakter × Karakter
              </button>
              <button
                onClick={() => setModeFilter("REVERSE")}
                className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                  modeFilter === "REVERSE"
                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-[#0f172a] hover:text-white border border-transparent"
                }`}
              >
                🔄 Ters Kadraj
              </button>
              <button
                onClick={() => setModeFilter("CONCEPT")}
                className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                  modeFilter === "CONCEPT"
                    ? "bg-indigo-400/20 text-indigo-300 border border-indigo-400/40"
                    : "bg-[#0f172a] hover:text-white border border-transparent"
                }`}
              >
                🧠 14 Kült Tema
              </button>
              <button
                onClick={() => setModeFilter("CLASSIC")}
                className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap ${
                  modeFilter === "CLASSIC"
                    ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40"
                    : "bg-[#0f172a] hover:text-white border border-transparent"
                }`}
              >
                🎬 Klasik Düello
              </button>
            </div>

            <div className="space-y-2.5">
              {PLAYABLE_ARENAS.filter(
                m => modeFilter === "ALL" || m.category === modeFilter
              ).map((mode) => {
                const realIdx = PRESET_BOARDS.findIndex(b => b.id === mode.id);
                return (
                  <div
                    key={mode.id}
                    className={`p-3.5 rounded-2xl border ${mode.border} ${mode.bg} flex items-center justify-between gap-3 transition-all hover:scale-[1.01]`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white">{mode.title}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-[#0a1122]/70 ${mode.color}`}>
                          {mode.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                        {mode.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        audio.playVictory();
                        const targetIdx = realIdx >= 0 ? realIdx : 0;
                        onSelectPlayableBoard(targetIdx, mode.title);
                        onClose();
                      }}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-cinema-dark font-black text-xs flex items-center gap-1 shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5 fill-cinema-dark" />
                      <span>Oyna</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. SEKME: DİĞER OYUN MODLARI (PLACEHOLDER'LAR) */}
        {activeTab === "COMING_SOON" && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-zinc-400 mb-1">
              Gelecek güncellemelerde eklenecek prototip oyun formatları:
            </p>
            {COMING_SOON_MODES.map(game => (
              <div
                key={game.id}
                className="p-3.5 rounded-2xl bg-[#10182b] border border-sky-500/20 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{game.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {game.tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {game.status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{game.desc}</p>
                <button
                  onClick={() => {
                    audio.playSelect();
                    setRegisteredTitle(game.title);
                    setTimeout(() => setRegisteredTitle(null), 3000);
                  }}
                  className="mt-1 py-1.5 px-3 rounded-xl bg-[#15223e] hover:bg-[#1a2b4f] border border-sky-500/30 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 self-start active:scale-95"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>
                    {registeredTitle === game.title ? "✓ Ön Kayıt Alındı!" : "Prototipi İncele"}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. SEKME: TÜM KOMBİNATORYAL OLASILIK MATRİSİ */}
        {activeTab === "COMBINATIONS" && (
          <div className="space-y-3">
            <p className="text-[11px] text-zinc-300">
              Yeni matrisler ve oyun kurguları türetmek için kullanabileceğimiz <span className="text-amber-400 font-black">32 farklı kombinasyon havuzu</span>:
            </p>
            {COMBINATORIAL_VARIATIONS.map((group, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#0f172a] border border-sky-500/15"
              >
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1.5">
                  {group.cat}
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.combos.map((c, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 rounded-lg bg-[#141f38] text-[10px] font-bold text-zinc-300 border border-white/5 flex items-center gap-1.5"
                    >
                      <span className="text-amber-400 text-xs">&bull;</span>
                      <span className="truncate">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
