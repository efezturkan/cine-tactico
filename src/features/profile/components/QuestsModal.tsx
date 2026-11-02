"use client";

import React, { useState } from "react";
import { Trophy, Gift, CheckCircle2, Star, Flame, X, Film, Sparkles, Gem, Shield, Check } from "lucide-react";
import { audio } from "@/utils/audio";

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelsBalance: number;
  dailyStreak?: number;
  onClaimDaily: (amount: number) => void;
  claimedDaily: boolean;
  claimedQuestIds?: string[];
  onClaimQuest?: (questId: string, reels: number) => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  isOpen,
  onClose,
  reelsBalance,
  dailyStreak = 3,
  onClaimDaily,
  claimedDaily,
  claimedQuestIds = [],
  onClaimQuest,
}) => {
  const [activeTab, setActiveTab] = useState<"DAILY_LOGIN" | "DAILY_QUESTS" | "WEEKLY_MEGA">("DAILY_QUESTS");
  const [claimedQuestsLocal, setClaimedQuestsLocal] = useState<string[]>([]);

  if (!isOpen) return null;

  const dailyRewards = [
    { day: 1, amount: 50, label: "Gün 1" },
    { day: 2, amount: 75, label: "Gün 2" },
    { day: 3, amount: 100, label: "Gün 3" },
    { day: 4, amount: 125, label: "Gün 4" },
    { day: 5, amount: 150, label: "Gün 5" },
    { day: 6, amount: 200, label: "Gün 6" },
    { day: 7, amount: 350, label: "Gün 7 🏆" },
  ];

  const dailyQuests = [
    {
      id: "q1",
      title: "Günün İlk Düellosunu Kazan",
      desc: "Herhangi bir modda 1 galibiyet elde et",
      rewardReels: 100,
      progress: "1/1",
      completed: true,
    },
    {
      id: "q2",
      title: "x3 Kombo Yakala",
      desc: "Tek maçta art arda 3 doğru hamle yap",
      rewardReels: 150,
      progress: "2/3",
      completed: false,
    },
    {
      id: "q3",
      title: "Günün Kadresi'nde Kare Kapat",
      desc: "Günün matrisinde en az 5 kare tamamla",
      rewardReels: 120,
      progress: "3/5",
      completed: false,
    },
  ];

  const weeklyQuests = [
    {
      id: "w1",
      title: "15 Karşılaşma Tamamla",
      desc: "Hafta boyunca toplam 15 maç yap",
      rewardReels: 500,
      progress: "11/15",
      pct: 73,
    },
    {
      id: "w2",
      title: "Sinefil Bilgisi",
      desc: "Tek maçta %10 altı nadir filmler bul",
      rewardReels: 350,
      progress: "2/3",
      pct: 66,
    },
    {
      id: "w3",
      title: "7 Günlük Seri",
      desc: "7 gün boyunca her gün en az 1 maç oyna",
      rewardReels: 600,
      progress: `${dailyStreak}/7`,
      pct: Math.round((dailyStreak / 7) * 100),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl p-5 flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-[#F1EEE7] tactile-card"
        style={{
          background: "linear-gradient(180deg, #1E222B 0%, #14171D 100%)",
          borderColor: "rgba(255,255,255,0.14)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 6px 0 #08090C, inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl tactile-btn-surface text-[#A5A8B0] hover:text-[#F1EEE7]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık ve Kredi Bakiyesi */}
        <div className="text-center pb-3 border-b border-white/10">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl flex items-center justify-center text-[#0F1115] shadow-md tactile-btn-amber">
            <Gift className="w-6 h-6 fill-[#0F1115]" />
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 px-2.5 py-0.5 rounded-md border border-[#F5A623]/30">
            SİNEFİL ÖDÜL KÜRSÜSÜ &middot; SEZON 01
          </span>
          <h2 className="text-xl font-serif tracking-wide text-[#F1EEE7] mt-1">Görevler &amp; Günlük Ödüller</h2>

          {/* Günlük Seri Rozeti */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF334B]/10 border border-[#FF334B]/30 text-[#FF334B] text-xs font-black">
              <Flame className="w-4 h-4 fill-[#FF334B] animate-pulse" />
              <span>{dailyStreak} Günlük Seri</span>
            </div>
          </div>
        </div>

        {/* Sekmeler: Günlük Görevler, Haftalık Mücadele, 7 Günlük Giriş */}
        <div className="flex gap-1.5 my-3 p-1 rounded-2xl bg-[#11141A] border border-white/10 text-xs font-bold text-[#A5A8B0]">
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("DAILY_QUESTS");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "DAILY_QUESTS"
                ? "tactile-btn-amber text-[#0F1115] font-black shadow-md"
                : "hover:text-[#F1EEE7]"
            }`}
          >
            Günlük (3)
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("WEEKLY_MEGA");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "WEEKLY_MEGA"
                ? "tactile-btn-surface text-[#F5A623] font-black shadow-md"
                : "hover:text-[#F1EEE7]"
            }`}
          >
            Haftalık Sandık
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("DAILY_LOGIN");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "DAILY_LOGIN"
                ? "tactile-btn-cyan text-[#0F1115] font-black shadow-md"
                : "hover:text-[#F1EEE7]"
            }`}
          >
            7 Günlük Seri
          </button>
        </div>

        {/* 1. SEKME: GÜNLÜK GÖREVLER */}
        {activeTab === "DAILY_QUESTS" && (
          <div className="space-y-2.5">
            {dailyQuests.map(q => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-[#10182b] border border-sky-500/20 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{q.title}</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      ({q.progress})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{q.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold">
                    <span className="text-amber-400">+{q.rewardReels} Makara</span>
                  </div>
                </div>

                {q.completed ? (
                  claimedQuestIds.includes(q.id) || claimedQuestsLocal.includes(q.id) ? (
                    <span className="text-[11px] font-black text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-xl">
                      Alındı ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        audio.playSuccess();
                        setClaimedQuestsLocal(prev => [...prev, q.id]);
                        if (onClaimQuest) {
                          onClaimQuest(q.id, q.rewardReels);
                        } else {
                          onClaimDaily(q.rewardReels);
                        }
                      }}
                      className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black text-xs shadow-md active:scale-95 whitespace-nowrap animate-pulse"
                    >
                      Topla!
                    </button>
                  )
                ) : (
                  <span className="text-[10px] font-black text-zinc-500 bg-[#131f38] px-2.5 py-1.5 rounded-xl border border-white/5">
                    Devam Ediyor
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. SEKME: HAFTALIK BÜYÜK SANDIK */}
        {activeTab === "WEEKLY_MEGA" && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-purple-500/20 border border-purple-500/40 text-center">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-1" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Haftalık Büyük Sinefil Sandığı
              </h4>
              <p className="text-[10px] text-zinc-300 mt-0.5">
                Pazar gecesi sıfırlanır: Toplam <span className="text-amber-400 font-black">+1450 Makara</span>
              </p>
            </div>

            {weeklyQuests.map(w => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl bg-[#10182b] border border-sky-500/20"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-white">{w.title}</span>
                  <span className="font-mono text-zinc-400 font-bold">{w.progress}</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">{w.desc}</p>
                {/* Progress bar */}
                <div className="w-full h-2 bg-zinc-900 rounded-full mt-2 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                    style={{ width: `${w.pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] font-bold">
                  <span className="text-amber-400">Ödül: +{w.rewardReels} Makara</span>
                  <span className="text-zinc-500">%{w.pct}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. SEKME: 7 GÜNLÜK GİRİŞ SERİSİ TAKVİMİ */}
        {activeTab === "DAILY_LOGIN" && (
          <div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {dailyRewards.slice(0, 4).map(r => (
                <div
                  key={r.day}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    r.day <= dailyStreak
                      ? "bg-amber-400/10 border-amber-400/50 text-amber-300"
                      : "bg-[#10182b] border-zinc-800 text-zinc-500"
                  }`}
                >
                  <span className="text-[10px] font-bold block">{r.label}</span>
                  <span className="text-xs font-black block mt-0.5">+{r.amount} 🎟️</span>
                  {r.day <= dailyStreak && (
                    <span className="text-[9px] font-black text-emerald-400 mt-1 block">✓ ALINDI</span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {dailyRewards.slice(4).map(r => (
                <div
                  key={r.day}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    r.day === 7
                      ? "bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border-amber-400 text-amber-300"
                      : r.day <= dailyStreak
                      ? "bg-amber-400/10 border-amber-400/50 text-amber-300"
                      : "bg-[#10182b] border-zinc-800 text-zinc-500"
                  }`}
                >
                  <span className="text-[10px] font-bold block">{r.label}</span>
                  <span className="text-xs font-black block mt-0.5">+{r.amount} 🎟️</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (claimedDaily) return;
                audio.playVictory();
                onClaimDaily(100);
              }}
              disabled={claimedDaily}
              className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                claimedDaily
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                  : "bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-cinema-dark shadow-amber-500/20"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>{claimedDaily ? "Bugünkü Ödülü Aldın (Yarın Gel!)" : "Bugünün Giriş Ödülünü Al (+100 Makara)"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
