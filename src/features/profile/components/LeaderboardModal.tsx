"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  Flame,
  Award,
  Shield,
  Layers,
} from "lucide-react";
import { UserProfile, AVATAR_OPTIONS } from "@/types/profile";
import { audio } from "@/utils/audio";
import { fetchGlobalLeaderboard, isSupabaseConfigured } from "@/backend";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeLeague, setActiveLeague] = useState<
    "ALL" | "GRANDMASTER" | "DIAMOND" | "GOLD" | "SILVER" | "BRONZE"
  >("ALL");

  if (!isOpen) return null;

  const currentAvatar =
    AVATAR_OPTIONS.find(a => a.id === currentUser.avatarId) || AVATAR_OPTIONS[0];

  // Global Liderlik Tablosu Verileri
  const LEADERBOARD_DATA = [
    {
      rank: 1,
      name: "TarantinoFan_01",
      title: "Grandmaster Sinefil 👑",
      trophies: 2840,
      wins: 184,
      avatarEmoji: "🎬",
      badgeColor: "from-amber-400 to-yellow-500",
      league: "GRANDMASTER",
    },
    {
      rank: 2,
      name: "NolanUniverse",
      title: "Zaman Bükücü Dâhi ⏳",
      trophies: 2510,
      wins: 162,
      avatarEmoji: "🚀",
      badgeColor: "from-slate-300 to-slate-400",
      league: "GRANDMASTER",
    },
    {
      rank: 3,
      name: "ScorseseMafia",
      title: "Akademi Jürisi 🎖️",
      trophies: 2290,
      wins: 145,
      avatarEmoji: "🕵️",
      badgeColor: "from-amber-600 to-amber-700",
      league: "GRANDMASTER",
    },
    {
      rank: 4,
      name: "FightClubTyler",
      title: "90'lar Kült Lideri 🧼",
      trophies: 1850,
      wins: 119,
      avatarEmoji: "🌟",
      badgeColor: "from-cyan-400 to-blue-500",
      league: "DIAMOND",
    },
    {
      rank: 5,
      name: "DuneArrakis",
      title: "Baharat Lordu 🪐",
      trophies: 1620,
      wins: 98,
      avatarEmoji: "🍿",
      badgeColor: "from-cyan-400 to-blue-500",
      league: "DIAMOND",
    },
    {
      rank: 6,
      name: "MarvelGeek",
      title: "Süper Kahraman Bilgini ⚡",
      trophies: 1340,
      wins: 84,
      avatarEmoji: "🧐",
      badgeColor: "from-cyan-400 to-blue-500",
      league: "DIAMOND",
    },
    {
      rank: 7,
      name: "CillianPeak",
      title: "Gözlemci Metot Oyuncusu 🎩",
      trophies: 980,
      wins: 62,
      avatarEmoji: "🎬",
      badgeColor: "from-yellow-400 to-amber-500",
      league: "GOLD",
    },
    {
      rank: 8,
      name: "LetterboxdCritic",
      title: "Bağımsız Sinefil 📝",
      trophies: 820,
      wins: 51,
      avatarEmoji: "🌟",
      badgeColor: "from-yellow-400 to-amber-500",
      league: "GOLD",
    },
    {
      rank: 9,
      name: "Kubrick2001",
      title: "Kozmik Düşünür 🌌",
      trophies: 690,
      wins: 43,
      avatarEmoji: "🚀",
      badgeColor: "from-yellow-400 to-amber-500",
      league: "GOLD",
    },
    {
      rank: 10,
      name: "PulpVincent",
      title: "Retro Dans Ustası 🕺",
      trophies: 540,
      wins: 34,
      avatarEmoji: "🕵️",
      badgeColor: "from-slate-400 to-zinc-500",
      league: "SILVER",
    },
  ];

  const [liveLeaderboard, setLiveLeaderboard] = useState<typeof LEADERBOARD_DATA | null>(null);

  useEffect(() => {
    if (!isOpen || !isSupabaseConfigured) return;
    fetchGlobalLeaderboard(25).then(records => {
      if (records && records.length > 0) {
        const mapped = records.map((r, idx) => {
          const avatar = AVATAR_OPTIONS.find(a => a.id === r.avatar_id) || AVATAR_OPTIONS[0];
          let league: "GRANDMASTER" | "DIAMOND" | "GOLD" | "SILVER" | "BRONZE" = "BRONZE";
          let badgeColor = "from-amber-700 to-amber-900";
          if (r.rating >= 2000) {
            league = "GRANDMASTER";
            badgeColor = "from-amber-400 to-yellow-500";
          } else if (r.rating >= 1400) {
            league = "DIAMOND";
            badgeColor = "from-cyan-400 to-blue-500";
          } else if (r.rating >= 800) {
            league = "GOLD";
            badgeColor = "from-yellow-400 to-amber-500";
          } else if (r.rating >= 400) {
            league = "SILVER";
            badgeColor = "from-slate-300 to-slate-400";
          }

          return {
            rank: idx + 1,
            name: r.username,
            title: r.rank_title || "Sinefil Düellocusu",
            trophies: r.rating,
            wins: r.wins,
            avatarEmoji: avatar.emoji,
            badgeColor,
            league,
          };
        });
        setLiveLeaderboard(mapped);
      }
    });
  }, [isOpen]);

  const activeData = liveLeaderboard || LEADERBOARD_DATA;

  const filteredData =
    activeLeague === "ALL"
      ? activeData
      : activeData.filter(item => item.league === activeLeague);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#0a1122] border border-sky-500/25 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative text-white">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. ÜST BAŞLIK & SEZON SAYACI */}
        <div className="text-center pb-3 border-b border-sky-500/15">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 fill-amber-400" />
            <span>GLOBAL SİNEFİL LİGİ</span>
          </div>
          <h2 className="text-lg font-black text-white">Liderlik Tablosu</h2>

          {/* Sezon Bitiş Sayacı & Ödül */}
          <div className="flex items-center justify-center gap-3 mt-1 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Sezon Bitişine: <strong className="text-white">3 Gün 14 Saat</strong></span>
            </span>
            <span className="text-amber-400 font-bold">Ödül: 5.000 🎞️ + 100 💎</span>
          </div>
        </div>

        {/* 2. LİG SEKMELERİ (Bronz ➔ Grandmaster) */}
        <div className="flex items-center gap-1.5 my-2.5 overflow-x-auto custom-scrollbar pb-1 text-[10px] font-black">
          {[
            { id: "ALL", label: "Tümü", icon: "🌐" },
            { id: "GRANDMASTER", label: "Grandmaster 👑", icon: "👑" },
            { id: "DIAMOND", label: "Elmas 💎", icon: "💎" },
            { id: "GOLD", label: "Altın 🥇", icon: "🥇" },
            { id: "SILVER", label: "Gümüş 🥈", icon: "🥈" },
          ].map(lig => (
            <button
              key={lig.id}
              onClick={() => {
                audio.playSelect();
                setActiveLeague(lig.id as any);
              }}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all border ${
                activeLeague === lig.id
                  ? "bg-[#111e3b] border-amber-400 text-amber-300 shadow-sm ring-1 ring-amber-400"
                  : "bg-[#0b101f] border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {lig.label}
            </button>
          ))}
        </div>

        {/* 3. LİDERLİK LİSTESİ */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 my-1">
          {filteredData.map(item => {
            const isTop3 = item.rank <= 3;
            return (
              <div
                key={item.rank}
                className={`p-2.5 rounded-2xl flex items-center justify-between transition-all border ${
                  item.rank === 1
                    ? "bg-gradient-to-r from-amber-500/20 via-[#10182b] to-[#10182b] border-amber-400/50"
                    : item.rank === 2
                    ? "bg-gradient-to-r from-slate-400/15 via-[#10182b] to-[#10182b] border-slate-400/40"
                    : item.rank === 3
                    ? "bg-gradient-to-r from-amber-700/15 via-[#10182b] to-[#10182b] border-amber-700/40"
                    : "bg-[#10182b] border-zinc-800/80"
                }`}
              >
                {/* Sıralama Numarası & Avatar */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 text-center font-mono font-black text-xs">
                    {item.rank === 1 ? (
                      <span className="text-amber-400 text-sm">🥇</span>
                    ) : item.rank === 2 ? (
                      <span className="text-slate-300 text-sm">🥈</span>
                    ) : item.rank === 3 ? (
                      <span className="text-amber-600 text-sm">🥉</span>
                    ) : (
                      <span className="text-zinc-500">#{item.rank}</span>
                    )}
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#18233e] border border-zinc-700 flex items-center justify-center text-lg shadow">
                    {item.avatarEmoji}
                  </div>

                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{item.name}</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 font-bold">{item.title}</p>
                  </div>
                </div>

                {/* Kupa Sayısı & Galibiyet */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-black text-amber-400 justify-end">
                    <Trophy className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.trophies.toLocaleString()}</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold">{item.wins} G</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. SABİT ALT BAR: KULLANICININ KENDİ DURUMU (Senin Sıralaman / Progressive Disclosure) */}
        <div className="pt-2.5 mt-2 border-t border-sky-500/15">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#172342] to-[#10182b] border border-cyan-400/40 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-black font-mono ${currentUser.totalMatches < 10 ? "text-zinc-500" : "text-cyan-400"}`}>
                {currentUser.totalMatches < 10 ? "--" : "#42"}
              </span>
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-tr ${currentAvatar.iconBg} flex items-center justify-center text-lg border-2 border-cyan-400`}
              >
                {currentAvatar.emoji}
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>{currentUser.username} (Sen)</span>
                  <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-1 py-0.2 rounded font-black">
                    Level {currentUser.rankLevel || 1}
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 font-bold">
                  {currentUser.totalMatches < 10
                    ? `Derecelendirme: ${currentUser.totalMatches}/10 Maç Tamamlandı`
                    : `Gümüş Ligi · %${currentUser.totalMatches > 0 ? Math.round((currentUser.wins / currentUser.totalMatches) * 100) : 0} Galibiyet`}
                </p>
              </div>
            </div>

            <div className="text-right">
              {currentUser.totalMatches < 10 ? (
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">DERECESİZ</span>
                  <span className="text-[8px] text-zinc-500 block font-bold mt-0.5">{10 - currentUser.totalMatches} Maç Kaldı</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 text-xs font-black text-amber-400 justify-end">
                    <Trophy className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{currentUser.wins * 30 + (currentUser.draws || 0) * 10}</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold">+23 Kupa Son Maç</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
