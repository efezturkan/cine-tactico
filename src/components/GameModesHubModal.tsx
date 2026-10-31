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
  const [activeTab, setActiveTab] = useState<"ACTIVE_5" | "COMING_SOON" | "COMBINATIONS">("ACTIVE_5");
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. OYNANABİLİR CINEXOX MASALARI & ÇARPIŞMALARI
  const TOP_5_MODES = [
    {
      idx: 0,
      title: "Klasik Sinefil (Yönetmen x Oyuncu)",
      badge: "Popüler & Dengeli",
      color: "text-amber-400",
      border: "border-amber-400/40",
      bg: "bg-amber-400/10",
      desc: "Christopher Nolan, Tarantino, Scorsese kesişiminde Leonardo DiCaprio, Brad Pitt ve Christian Bale.",
    },
    {
      idx: 1,
      title: "Yıldız Oyuncular & Tür Çarpışması",
      badge: "Oyuncu Odaklı",
      color: "text-cyan-400",
      border: "border-cyan-400/40",
      bg: "bg-cyan-400/10",
      desc: "Brad Pitt, Cillian Murphy, Robert De Niro satırları; Suç, 8.0+ Puan ve 2010 Sonrası sütunları.",
    },
    {
      idx: 2,
      title: "Günün XOX Meydan Okuması",
      badge: "Günlük Rutin",
      color: "text-purple-400",
      border: "border-purple-400/40",
      bg: "bg-purple-400/10",
      desc: "Denis Villeneuve, David Fincher, Christopher Nolan satırları; Bilim Kurgu, Dram ve 8.0+ Puan sütunları.",
    },
    {
      idx: 3,
      title: "⚡ DC vs MARVEL (Süper Kahraman Düellosu)",
      badge: "🔥 Hafta Sonu Modu",
      color: "text-rose-400",
      border: "border-rose-500/50",
      bg: "bg-gradient-to-r from-red-600/20 to-blue-600/20",
      desc: "Christian Bale (Batman/Gorr), James Gunn, Ryan Reynolds kesişiminde DC Evreni x Marvel (MCU) x 8.0+ Puan Efsaneleri.",
    },
    {
      idx: 4,
      title: "🪐 Epik Bilim Kurgu: Dune & Nolan Evreni",
      badge: "Sci-Fi Efsaneleri",
      color: "text-amber-300",
      border: "border-amber-400/40",
      bg: "bg-amber-500/10",
      desc: "Denis Villeneuve, Nolan, Timothée Chalamet satırları; Bilim Kurgu, Oscar ve 8.0+ Puan sütunları.",
    },
    {
      idx: 5,
      title: "🩸 90'lar Kült Arenası: Pulp Fiction & Fight Club",
      badge: "Kült Bağımsızlar",
      color: "text-emerald-400",
      border: "border-emerald-400/40",
      bg: "bg-emerald-400/10",
      desc: "Brad Pitt (Tyler Durden), Tarantino (Pulp Fiction), Fincher (Se7en) satırları; Suç, 8.0+ Puan ve 90'lar sütunları.",
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
              setActiveTab("ACTIVE_5");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "ACTIVE_5"
                ? "bg-amber-400 text-cinema-dark font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            5 Ana Matris
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
            Diğer Oyunlar
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

        {/* 1. SEKME: EN MANTIKLI 5 OYNANABİLİR MATRİS */}
        {activeTab === "ACTIVE_5" && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-zinc-400 mb-1">
              Test edilip dengelenmiş, anında oynanabilir 5 ana sinema matrisi:
            </p>
            {TOP_5_MODES.map((mode, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border ${mode.border} ${mode.bg} flex items-center justify-between gap-3 transition-all hover:scale-[1.01]`}
              >
                <div>
                  <div className="flex items-center gap-2">
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
                    onSelectPlayableBoard(mode.idx, mode.title);
                    onClose();
                  }}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-cinema-dark font-black text-xs flex items-center gap-1 shadow-md active:scale-95 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-cinema-dark" />
                  <span>Oyna</span>
                </button>
              </div>
            ))}
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
                    alert(`${game.title} için ön kayıt alındı! Geliştirme tamamlandığında bildirim alacaksın.`);
                  }}
                  className="mt-1 py-1.5 px-3 rounded-xl bg-[#15223e] hover:bg-[#1a2b4f] border border-sky-500/30 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 self-start active:scale-95"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Prototipi İncele</span>
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
