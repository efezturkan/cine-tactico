"use client";

import React from "react";
import { Crown, Sparkles, Check, ShieldCheck, Zap, X, Trophy } from "lucide-react";
import { audio } from "@/utils/audio";

interface SinefilProModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
  onActivatePro: () => void;
}

export const SinefilProModal: React.FC<SinefilProModalProps> = ({
  isOpen,
  onClose,
  isPro = false,
  onActivatePro,
}) => {
  if (!isOpen) return null;

  const PERKS = [
    {
      title: "Sıfır Reklam Deneyimi",
      desc: "Maç aralarında veya lobi geçişlerinde hiçbir reklamla karşılaşmazsın.",
      icon: Zap,
    },
    {
      title: "Her Gün 3 Ücretsiz Süper Güç",
      desc: "Her gün hesabına +1 Süre Dondurucu, +1 Yönetmen İpucu ve +1 Bomba yüklenir.",
      icon: Sparkles,
    },
    {
      title: "Özel Turnuva ve Eleme Odası Kurma",
      desc: "Arkadaş grubunla 8 kişilik eleme turnuvaları ve BO3 serileri başlatabilirsin.",
      icon: Trophy,
    },
    {
      title: "Altın Taç Rozeti & Letterboxd İmzası",
      desc: "Profilinde ve maç eşleşmelerinde altın taç parıldar; Sinefil Kimliğin öne çıkar.",
      icon: Crown,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#141e36] to-[#0a1122] border border-amber-400/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-white">
        {/* Kapat */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Taç & Başlık */}
        <div className="text-center pb-3 border-b border-amber-400/20">
          <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-8 h-8 text-[#0a1122] fill-[#0a1122]" />
          </div>
          <h2 className="text-lg font-black tracking-wider text-amber-400 uppercase font-mono">
            SİNEFİL PRO
          </h2>
          <p className="text-xs text-zinc-300 mt-0.5">
            Chess.com Diamond & Duolingo Super gibi VIP Sinema Ayrıcalıkları
          </p>
        </div>

        {/* Avantajlar Listesi */}
        <div className="my-4 space-y-2.5">
          {PERKS.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div
                key={i}
                className="p-3 rounded-2xl bg-[#0f172a]/90 border border-amber-400/20 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{perk.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{perk.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aktivasyon Butonu */}
        <div className="pt-2">
          {isPro ? (
            <div className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>SİNEFİL PRO AKTİF ✓</span>
            </div>
          ) : (
            <button
              onClick={() => {
                audio.playVictory();
                onActivatePro();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-cinema-dark font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Crown className="w-4 h-4 fill-cinema-dark" />
              <span>Ücretsiz 7 Günlük Denemeyi Başlat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
