"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserProfile, PowerupInventory, AVATAR_OPTIONS } from "@/types/profile";
import {
  ShoppingBag,
  Wallet,
  Gem,
  Tv,
  Clock,
  Lightbulb,
  Bomb,
  Zap,
  Flame,
  Shield,
  Check,
  X,
  Sparkles,
  Lock,
} from "lucide-react";
import { audio } from "@/utils/audio";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateBalance: (reelsDelta: number, diamondsDelta: number) => void;
  onBuyPowerup: (powerup: keyof PowerupInventory, costReels: number, costDiamonds: number) => void;
  onBuyAvatar: (avatarId: string, costReels: number, costDiamonds: number) => void;
  onBuyStreakFreeze: (costDiamonds: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateBalance,
  onBuyPowerup,
  onBuyAvatar,
  onBuyStreakFreeze,
}) => {
  const [activeTab, setActiveTab] = useState<"POWERUPS" | "AVATARS" | "FREE_REWARDS">("POWERUPS");
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adSeconds, setAdSeconds] = useState(3);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const adIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
        adIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
        adIntervalRef.current = null;
      }
      setIsWatchingAd(false);
      setAdSeconds(3);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleWatchAd = () => {
    audio.playSelect();
    setIsWatchingAd(true);
    setAdSeconds(3);

    if (adIntervalRef.current) clearInterval(adIntervalRef.current);
    adIntervalRef.current = setInterval(() => {
      setAdSeconds(prev => {
        if (prev <= 1) {
          if (adIntervalRef.current) {
            clearInterval(adIntervalRef.current);
            adIntervalRef.current = null;
          }
          setIsWatchingAd(false);
          onUpdateBalance(200, 25);
          audio.playSuccess();
          showFeedback("🎉 Reklam Ödülü: +200 Makara ve +25 Elmas Kazandın!");
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const POWERUP_ITEMS: {
    key: keyof PowerupInventory;
    name: string;
    sub: string;
    icon: any;
    costReels: number;
    costDiamonds: number;
    color: string;
    bg: string;
  }[] = [
    {
      key: "freezeTime",
      name: "Süre Dondurucu (+15s)",
      sub: "Kafa Topu Buzlanma: Shot clock süresini dondurur, rahatça düşün.",
      icon: Clock,
      costReels: 150,
      costDiamonds: 0,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/30",
    },
    {
      key: "directorHint",
      name: "Yönetmen İpucu",
      sub: "Zor bir kare için yönetmenin dönemini veya başrol harfini fısıldar.",
      icon: Lightbulb,
      costReels: 200,
      costDiamonds: 0,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      key: "bombRetake",
      name: "Çekim Tekrarı (Bomba)",
      sub: "Rakibin ele geçirdiği bir kareyi bombalayıp tekrar boşaltır.",
      icon: Bomb,
      costReels: 0,
      costDiamonds: 30,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30",
    },
    {
      key: "doublePoints",
      name: "Gişe Rekoru (2x Puan)",
      sub: "Bu hamlede kazanacağın kombo ve arcade puanını ikiye katlar.",
      icon: Zap,
      costReels: 0,
      costDiamonds: 20,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0a1122] border border-sky-500/20 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-white">
        {/* Üst Bar: Başlık, Bakiyeler & Kapat */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-500/10">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-black tracking-wider uppercase font-mono text-zinc-100">
              SİNEFİL <span className="text-amber-400">MARKETİ</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Makara Bakiyesi */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#11192d] border border-amber-500/30 text-amber-400 text-xs font-black shadow-inner">
              <Wallet className="w-3.5 h-3.5 fill-amber-400" />
              <span>{profile.reelsBalance.toLocaleString()}</span>
            </div>
            {/* Elmas Bakiyesi */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#11192d] border border-cyan-500/30 text-cyan-400 text-xs font-black shadow-inner">
              <Gem className="w-3.5 h-3.5 fill-cyan-400" />
              <span>{profile.diamondsBalance || 45}</span>
            </div>
            {/* Kapat */}
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-[#131f38] text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Geri Bildirim Toast */}
        {feedbackMsg && (
          <div className="my-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs font-black text-emerald-300 animate-in fade-in">
            {feedbackMsg}
          </div>
        )}

        {/* 1. ÜCRETSİZ REKLAM İZLE KAZAN BANNERI (Kafa Topu / Block Blast Modeli) */}
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/15 to-cyan-500/20 border border-amber-400/40 relative overflow-hidden flex items-center justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 uppercase tracking-wider">
              <Tv className="w-3.5 h-3.5" /> ÜCRETSİZ ÖDÜL
            </div>
            <div className="text-xs font-bold text-zinc-200 mt-0.5">
              1 Kısa Reklam İzle: <span className="text-amber-400 font-black">+200 Makara</span> & <span className="text-cyan-400 font-black">+25 Elmas</span>
            </div>
          </div>

          <button
            onClick={handleWatchAd}
            disabled={isWatchingAd}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-cinema-dark font-black text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {isWatchingAd ? `İzleniyor (${adSeconds}s)...` : "İzle & Al"}
          </button>
        </div>

        {/* Sekmeler: Jokerler, Avatarlar, Seri Koruması */}
        <div className="flex gap-1.5 my-2 p-1 rounded-2xl bg-[#0f172a] border border-sky-500/15 text-xs font-bold text-zinc-400">
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("POWERUPS");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "POWERUPS"
                ? "bg-amber-400 text-cinema-dark font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            Jokerler (Kafa Topu)
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("AVATARS");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "AVATARS"
                ? "bg-purple-500 text-white font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            Avatarlar
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("FREE_REWARDS");
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "FREE_REWARDS"
                ? "bg-cyan-500 text-cinema-dark font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            Seri Koruması
          </button>
        </div>

        {/* İÇERİK 1: JOKERLER (Kafa Topu 2 Tarzı Güçlendiriciler) */}
        {activeTab === "POWERUPS" && (
          <div className="space-y-2 mt-2">
            {POWERUP_ITEMS.map(item => {
              const Icon = item.icon;
              const count = profile.powerups ? profile.powerups[item.key] || 0 : 0;
              const canAfford =
                item.costReels > 0
                  ? profile.reelsBalance >= item.costReels
                  : (profile.diamondsBalance || 0) >= item.costDiamonds;

              return (
                <div
                  key={item.key}
                  className={`p-3 rounded-2xl border ${item.bg} flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#080d1a] border border-white/10 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">{item.name}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                          Sahipsin: {count}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{item.sub}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!canAfford) {
                        audio.playError();
                        showFeedback("Yetersiz bakiye! Reklam izleyerek kazanabilirsin.");
                        return;
                      }
                      audio.playPowerup();
                      onBuyPowerup(item.key, item.costReels, item.costDiamonds);
                      showFeedback(`+1 ${item.name} satın alındı!`);
                    }}
                    className={`py-1.5 px-3 rounded-xl font-black text-xs flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap ${
                      canAfford
                        ? "bg-amber-400 hover:bg-amber-300 text-cinema-dark shadow"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    {item.costReels > 0 ? (
                      <>
                        <Wallet className="w-3 h-3 fill-cinema-dark" />
                        <span>{item.costReels}</span>
                      </>
                    ) : (
                      <>
                        <Gem className="w-3 h-3 fill-cinema-dark" />
                        <span>{item.costDiamonds}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* İÇERİK 2: KİLİTLİ AVATARLAR */}
        {activeTab === "AVATARS" && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {AVATAR_OPTIONS.map((a, i) => {
              const isUnlocked =
                profile.unlockedAvatars && profile.unlockedAvatars.includes(a.id)
                  ? true
                  : i < 2; // İlk 2'si açık
              const cost = (i + 1) * 200;

              return (
                <div
                  key={a.id}
                  className="p-3 rounded-2xl bg-[#10182b] border border-sky-500/20 flex flex-col items-center text-center relative"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${a.iconBg} flex items-center justify-center text-2xl shadow-md mb-2 border border-white/20`}
                  >
                    {a.emoji}
                  </div>
                  <span className="text-xs font-black text-white">{a.label}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">Efsanevi Rozet</span>

                  {isUnlocked ? (
                    <span className="mt-2 text-[10px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" /> AÇIK
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (profile.reelsBalance < cost) {
                          audio.playError();
                          showFeedback("Yetersiz Makara! Reklam izle veya maç kazan.");
                          return;
                        }
                        audio.playVictory();
                        onBuyAvatar(a.id, cost, 0);
                        showFeedback(`Tebrikler! ${a.label} avatarı açıldı.`);
                      }}
                      className="mt-2 py-1 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-cinema-dark font-black text-xs flex items-center gap-1 active:scale-95 shadow"
                    >
                      <Wallet className="w-3 h-3 fill-cinema-dark" />
                      {cost}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* İÇERİK 3: DUOLINGO SERİ KORUMASI (STREAK FREEZE) */}
        {activeTab === "FREE_REWARDS" && (
          <div className="mt-2 space-y-3">
            <div className="p-4 rounded-2xl bg-[#10182b] border border-cyan-500/30 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white">Seri Kalkanı (Streak Freeze)</h4>
                  <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    Duolingo Mantığı
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  1 gün oyuna girmesen bile {profile.dailyStreak} günlük serin sıfırlanmaz.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#131f38] border border-sky-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-zinc-200 block">1x Seri Kalkanı Satın Al</span>
                <span className="text-[10px] text-zinc-400">Durum: {profile.streakProtected ? "Aktif (Korumada ✓)" : "Korumasız"}</span>
              </div>
              <button
                onClick={() => {
                  if ((profile.diamondsBalance || 0) < 50) {
                    audio.playError();
                    showFeedback("Yetersiz Elmas! Reklam izleyerek elmas kazanabilirsin.");
                    return;
                  }
                  audio.playVictory();
                  onBuyStreakFreeze(50);
                  showFeedback("Seri Kalkanı aktif edildi! Yarın girmezsen serin yanmayacak.");
                }}
                disabled={profile.streakProtected}
                className={`py-2 px-3.5 rounded-xl font-black text-xs flex items-center gap-1.5 active:scale-95 shadow ${
                  profile.streakProtected
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-cyan-400 hover:bg-cyan-300 text-cinema-dark"
                }`}
              >
                <Gem className="w-3.5 h-3.5 fill-cinema-dark" />
                <span>50 Elmas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
