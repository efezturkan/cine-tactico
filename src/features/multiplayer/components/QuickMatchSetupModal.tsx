"use client";

import React, { useState } from "react";
import { X, Film, Swords, Trophy, Sparkles, Check, Lock, ChevronRight } from "lucide-react";
import { audio } from "@/utils/audio";
import { ContentPoolType } from "@/core";
import { UserProfile } from "@/types/profile";

interface QuickMatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatchmaking: (
    mode: "CLASSIC" | "SINEFIL",
    contentPool: ContentPoolType,
    difficulty: "EASY" | "NORMAL" | "HARD"
  ) => void;
  userProfile: UserProfile;
}

export const QuickMatchSetupModal: React.FC<QuickMatchSetupModalProps> = ({
  isOpen,
  onClose,
  onStartMatchmaking,
  userProfile,
}) => {
  const [selectedMode, setSelectedMode] = useState<"CLASSIC" | "SINEFIL">("CLASSIC");
  const [contentPool, setContentPool] = useState<ContentPoolType>("HYBRID");
  const [difficulty, setDifficulty] = useState<"EASY" | "NORMAL" | "HARD">("NORMAL");
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSinefilLocked = (userProfile.totalMatches || 0) < 3;

  const handleSelectMode = (mode: "CLASSIC" | "SINEFIL") => {
    audio.playSelect();
    if (mode === "SINEFIL" && isSinefilLocked) {
      setInfoNotice("🏆 Sinefil Modu ilk 3 maçtan sonra açılır! (Önizleme aktif)");
      setTimeout(() => setInfoNotice(null), 3000);
    }
    setSelectedMode(mode);
  };

  const handleConfirm = () => {
    audio.playVictory();
    onStartMatchmaking(selectedMode, contentPool, difficulty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col relative text-white overflow-hidden border"
        style={{
          background: "linear-gradient(135deg, rgba(14,16,24,0.98), rgba(10,11,16,0.99))",
          borderColor: "rgba(217,119,6,0.4)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Kapat Butonu */}
        <button
          onClick={() => {
            audio.playSelect();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-2 mb-1">
          <Film className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-black text-white font-mono uppercase tracking-wider">
            HIZLI OYNA AYARLARI
          </h2>
        </div>
        <p className="text-[11px] text-zinc-400 mb-4 font-bold">
          3 saniyede tercihlerini belirle ve kuyruğa gir.
        </p>

        {infoNotice && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black animate-in fade-in text-center">
            {infoNotice}
          </div>
        )}

        {/* 1. SEÇİM: MOD (Klasik vs Sinefil) */}
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5 font-mono">
            1. NE OYNAMAK İSTİYORSUN?
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Klasik Mod */}
            <button
              onClick={() => handleSelectMode("CLASSIC")}
              className="p-3 rounded-2xl border text-left transition-all relative active:scale-95"
              style={{
                background:
                  selectedMode === "CLASSIC"
                    ? "rgba(217,119,6,0.15)"
                    : "rgba(14,16,24,0.8)",
                borderColor: selectedMode === "CLASSIC" ? "#d97706" : "#1a1c24",
                boxShadow: "none",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-white">🎭 Klasik</span>
                {selectedMode === "CLASSIC" && (
                  <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
                )}
              </div>
              <p className="text-[9px] text-zinc-400 font-bold leading-tight">
                Yönetmen × Oyuncu & Tür
              </p>
              <span className="text-[8px] font-black text-amber-400 mt-1 inline-block uppercase tracking-wider">
                Varsayılan
              </span>
            </button>

            {/* Sinefil Mod */}
            <button
              onClick={() => handleSelectMode("SINEFIL")}
              className="p-3 rounded-2xl border text-left transition-all relative active:scale-95"
              style={{
                background:
                  selectedMode === "SINEFIL"
                    ? "rgba(139,21,27,0.2)"
                    : "rgba(14,16,24,0.8)",
                borderColor: selectedMode === "SINEFIL" ? "#8b151b" : "#1a1c24",
                boxShadow: "none",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-white flex items-center gap-1">
                  🏆 Sinefil
                  {isSinefilLocked && <Lock className="w-2.5 h-2.5 text-zinc-500" />}
                </span>
                {selectedMode === "SINEFIL" && (
                  <Check className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />
                )}
              </div>
              <p className="text-[9px] text-zinc-400 font-bold leading-tight">
                Yönetmen × Oscar Durumu
              </p>
              <span className="text-[8px] font-black text-rose-400 mt-1 inline-block uppercase tracking-wider">
                Prestij & Derinlik
              </span>
            </button>
          </div>
        </div>

        {/* 2. SEÇİM: İÇERİK HAVUZU (Film / Dizi / Karma) */}
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5 font-mono">
            2. İÇERİK HAVUZU
          </span>
          <div
            className="grid grid-cols-3 p-1 rounded-2xl gap-1"
            style={{ background: "#0a0b10", border: "1px solid #1a1c24" }}
          >
            {[
              { id: "FILM", label: "🎬 Film" },
              { id: "SERIES", label: "📺 Dizi" },
              { id: "HYBRID", label: "⚡ Karma (Önerilen)" },
            ].map((p) => {
              const isSelected = contentPool === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    audio.playSelect();
                    setContentPool(p.id as ContentPoolType);
                  }}
                  className="py-2 px-1 rounded-xl text-center text-[10px] font-black transition-all active:scale-95"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #d97706, #b45309)"
                      : "transparent",
                    color: isSelected ? "#07080b" : "#9ca3af",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SEÇİM: ZORLUK (Kolay / Normal / Zor) */}
        <div className="mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5 font-mono">
            3. ZORLUK DERECESİ
          </span>
          <div
            className="grid grid-cols-3 p-1 rounded-2xl gap-1"
            style={{ background: "#0a0b10", border: "1px solid #1a1c24" }}
          >
            {[
              { id: "EASY", label: "🟢 Kolay", sub: "Acemi" },
              { id: "NORMAL", label: "🟡 Normal", sub: "Dengeli (Varsayılan)" },
              { id: "HARD", label: "🔴 Zor", sub: "Usta" },
            ].map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    audio.playSelect();
                    setDifficulty(d.id as any);
                  }}
                  className="py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all active:scale-95"
                  style={{
                    background: isSelected
                      ? d.id === "HARD"
                        ? "#8b151b"
                        : d.id === "NORMAL"
                        ? "#d97706"
                        : "#059669"
                      : "transparent",
                    color: isSelected ? (d.id === "NORMAL" ? "#07080b" : "white") : "#9ca3af",
                  }}
                >
                  <span className="text-[10px] font-black">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BÜYÜK BAŞLAT BUTONU: MAÇ BUL / OYNA */}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] transition-all"
          style={{
            background: "linear-gradient(135deg, #8b151b 0%, #b01e25 40%, #d97706 100%)",
            boxShadow: "0 8px 30px rgba(139,21,27,0.5), 0 2px 8px rgba(0,0,0,0.8)",
            color: "white",
          }}
        >
          <Swords className="w-5 h-5 fill-white" />
          <span>MAÇ BUL (KUYRUĞA GİR)</span>
          <ChevronRight className="w-4 h-4 opacity-75" />
        </button>

        {/* Alt bilgi: Filtreler nerede? */}
        <div className="mt-3 text-center">
          <span className="text-[9px] text-zinc-500 font-bold">
            Derin filtreler (ülke, platform, banlar) için <b className="text-zinc-400">Özel Oda</b>'yı kullanabilirsiniz.
          </span>
        </div>
      </div>
    </div>
  );
};
