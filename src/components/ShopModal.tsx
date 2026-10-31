"use client";

import React, { useState } from "react";
import { UserProfile, AVATAR_OPTIONS, AvatarOption } from "@/types/profile";
import { Film, Check, X, Lock, Sparkles } from "lucide-react";
import { audio } from "@/utils/audio";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSelectAvatar: (avatarId: string) => void;
  onBuyAvatar: (avatarId: string, costReels: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSelectAvatar,
  onBuyAvatar,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const unlockedList = profile.unlockedAvatars || ["avatar_director", "avatar_actor"];

  const handleEquip = (avatar: AvatarOption) => {
    audio.playSelect();
    onSelectAvatar(avatar.id);
    showFeedback("success", `✓ ${avatar.label} ikonu aktif profil rozetin olarak seçildi.`);
  };

  const handlePurchase = (avatar: AvatarOption) => {
    if (profile.reelsBalance < avatar.cost) {
      audio.playError();
      showFeedback("error", `Yetersiz Makara! Bu ikon için ${avatar.cost} Makara gerekiyor.`);
      return;
    }
    audio.playVictory();
    onBuyAvatar(avatar.id, avatar.cost);
    showFeedback("success", `🎉 Tebrikler! ${avatar.label} ikonu açıldı ve profiline uygulandı.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0a1122] border border-amber-500/25 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar relative text-white">
        {/* Üst Bar: Başlık, Makara Bakiyesi & Kapat */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase font-mono text-zinc-100">
                SİNEFİL <span className="text-amber-400">İKON PAZARI</span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-bold">Profil Avatarları & Rozetler</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Makara Bakiyesi */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11192d] border border-amber-500/35 text-amber-400 text-xs font-black shadow-inner">
              <Film className="w-3.5 h-3.5 fill-amber-400" />
              <span>{profile.reelsBalance.toLocaleString()}</span>
            </div>

            {/* Kapat */}
            <button
              onClick={() => {
                audio.playSelect();
                onClose();
              }}
              className="p-1.5 rounded-full bg-[#131f38] text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bilgilendirme Kartı */}
        <div className="my-3 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-zinc-300 text-xs flex items-center gap-2.5">
          <span className="text-lg">🎟️</span>
          <p className="text-[11px] leading-relaxed text-zinc-300">
            CineXOX maçları kazanarak ve Günün Kadresi'ni çözerek kazandığın{" "}
            <strong className="text-amber-400 font-black">Makaralarla</strong> yeni sinematik avatarlar aç.
          </p>
        </div>

        {/* Geri Bildirim Toast */}
        {feedbackMsg && (
          <div
            className={`mb-3 p-2.5 rounded-xl text-center text-xs font-black animate-in fade-in ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                : "bg-rose-500/20 border border-rose-500/40 text-rose-300"
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Avatar Kartları Listesi */}
        <div className="grid grid-cols-2 gap-2.5">
          {AVATAR_OPTIONS.map((a) => {
            const isUnlocked = unlockedList.includes(a.id) || a.cost === 0;
            const isEquipped = profile.avatarId === a.id;
            const canAfford = profile.reelsBalance >= a.cost;

            return (
              <div
                key={a.id}
                className={`p-3 rounded-2xl flex flex-col items-center text-center relative border transition-all ${
                  isEquipped
                    ? "bg-[#141b2d] border-amber-400/70 shadow-lg shadow-amber-950/30"
                    : isUnlocked
                    ? "bg-[#10182b] border-zinc-800 hover:border-zinc-700"
                    : "bg-[#0b101d] border-zinc-900 opacity-90"
                }`}
              >
                {/* Avatar İkonu */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${a.iconBg} flex items-center justify-center text-2xl shadow-md mb-2 border border-white/20 relative`}
                >
                  {a.emoji}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                      <Lock className="w-4 h-4 text-zinc-300" />
                    </div>
                  )}
                </div>

                {/* İsim & Açıklama */}
                <span className="text-xs font-black text-white truncate max-w-full">{a.label}</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{a.description}</span>

                {/* Buton Aksiyonu */}
                <div className="mt-2.5 w-full">
                  {isEquipped ? (
                    <span className="w-full py-1.5 px-2 rounded-xl text-[10px] font-black text-amber-400 bg-amber-400/15 border border-amber-400/30 flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> SEÇİLİ
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquip(a)}
                      className="w-full py-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[10px] active:scale-95 transition-all border border-zinc-700"
                    >
                      Kullan
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(a)}
                      className={`w-full py-1.5 px-2 rounded-xl font-black text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all shadow ${
                        canAfford
                          ? "bg-amber-400 hover:bg-amber-300 text-cinema-dark"
                          : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      <Film className="w-3 h-3 fill-current" />
                      <span>{a.cost} Makara</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
