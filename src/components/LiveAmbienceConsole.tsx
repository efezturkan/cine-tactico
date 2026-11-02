"use client";

import React, { useState } from "react";
import {
  CinemaAmbience,
  AmbienceTheme,
  GrainLevel,
  CornerAccentOption,
  AMBIENCE_THEMES,
  CORNER_ACCENT_COLORS,
  DEFAULT_AMBIENCE,
} from "@/types/profile";
import {
  X,
  RotateCcw,
  Sun,
  Moon,
  Eye,
  Sliders,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audio } from "@/utils/audio";

interface LiveAmbienceConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  ambience: CinemaAmbience;
  onUpdateAmbience: (updated: Partial<CinemaAmbience>) => void;
  onResetAmbience: () => void;
}

export const LiveAmbienceConsole: React.FC<LiveAmbienceConsoleProps> = ({
  isOpen,
  onClose,
  ambience,
  onUpdateAmbience,
  onResetAmbience,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const currentTheme = AMBIENCE_THEMES[ambience.theme] || AMBIENCE_THEMES.velvet_red;

  if (!isOpen) return null;

  const handleThemeChange = (themeKey: AmbienceTheme) => {
    audio.playSelect();
    onUpdateAmbience({ theme: themeKey });
  };

  const handleDimnessChange = (val: number) => {
    // Güvenli sınırlar: %50 (asla aşırı aydınlık olup gözü yormaz) ile %96 (asla zifiri simsiyah olup metinleri kaybetmez)
    const clamped = Math.max(50, Math.min(96, val));
    onUpdateAmbience({ dimness: clamped });
  };

  const handleGlowChange = (val: number) => {
    // Güvenli sınırlar: %15 ile %90
    const clamped = Math.max(15, Math.min(90, val));
    onUpdateAmbience({ glowIntensity: clamped });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto pointer-events-auto notif-enter font-sans select-none">
      {/* İnce Kılavuz İpucu Barı (Üst Bilgi) */}
      <div className="flex justify-center mb-1">
        <div className="px-3 py-1 rounded-full bg-black/80 border border-zinc-700/60 backdrop-blur-md shadow-xl flex items-center gap-2 text-[10px] font-mono text-zinc-300">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ background: currentTheme.accentColor }} />
          <span>CANLI AMBİYANS AYARI: <strong>{currentTheme.label}</strong></span>
          <span className="text-zinc-500">|</span>
          <span className="text-amber-400">%{ambience.dimness} Loş</span>
        </div>
      </div>

      {/* Ana Konsol Kartı */}
      <div
        className="rounded-t-3xl border-t border-x p-3.5 shadow-2xl backdrop-blur-xl transition-all"
        style={{
          background: "linear-gradient(to top, rgba(7,8,11,0.98), rgba(14,16,24,0.95))",
          borderColor: currentTheme.accentColor,
          boxShadow: "0 -4px 16px rgba(0,0,0,0.7)",
        }}
      >
        {/* Konsol Üst Çubuğu (Drag / Minimize / Close) */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              title={isMinimized ? "Genişlet" : "Daralt"}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{currentTheme.emoji}</span>
                <span>Salon Işık Masası</span>
              </div>
              <div className="text-[8px] font-mono text-zinc-400">
                Ana ekranı görerek canlı ayarla
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onResetAmbience}
              className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[9px] font-mono font-bold flex items-center gap-1 transition-colors"
              title="Varsayılan optimum ayarlara dön"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Sıfırla</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl font-black text-xs text-white shadow-md transition-all active:scale-95 flex items-center gap-1"
              style={{
                background: currentTheme.accentColor,
                boxShadow: `0 2px 10px ${currentTheme.glowRgba}`,
              }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tamam</span>
            </button>
          </div>
        </div>

        {/* 1. Hızlı Tema Seçimi (5 Renk Hapı) — Her zaman görünür */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          {(Object.keys(AMBIENCE_THEMES) as AmbienceTheme[]).map((themeKey) => {
            const t = AMBIENCE_THEMES[themeKey];
            const isSelected = ambience.theme === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => handleThemeChange(themeKey)}
                className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all border ${
                  isSelected
                    ? "ring-2 scale-105 shadow-md"
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: isSelected ? t.glowRgba : "rgba(14,16,24,0.7)",
                  borderColor: isSelected ? t.accentColor : "#232635",
                  boxShadow: "none",
                }}
                title={t.label}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/30 mb-0.5 shadow-sm"
                  style={{ background: t.accentColor }}
                />
                <span className="text-[7.5px] font-black truncate max-w-full text-white">
                  {t.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Detaylı Sliderlar ve Anahtarlar (Minimize Değilse Açılır) */}
        {!isMinimized && (
          <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-150">
            {/* Köşe ve Kadraj Vurgu Rengi Aksanı */}
            <div className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
              <span className="text-[8px] font-black uppercase text-zinc-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Kadraj Köşeleri:
              </span>
              <div className="flex gap-1 overflow-x-auto">
                {(Object.keys(CORNER_ACCENT_COLORS) as CornerAccentOption[]).map((cKey) => {
                  const c = CORNER_ACCENT_COLORS[cKey];
                  const isSelected = (ambience.cornerAccent || "AUTO") === cKey;
                  return (
                    <button
                      key={cKey}
                      onClick={() => {
                        audio.playSelect();
                        onUpdateAmbience({ cornerAccent: cKey });
                      }}
                      className={`px-1.5 py-0.5 rounded-lg text-[8px] font-mono font-bold flex items-center gap-0.5 transition-all border ${
                        isSelected
                          ? "bg-white/15 border-white text-white shadow-sm ring-1 ring-white/50"
                          : "bg-zinc-800/80 border-transparent text-zinc-400 hover:text-white"
                      }`}
                      title={c.label}
                    >
                      <span>{c.emoji}</span>
                      <span>{c.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider 1: Salon Loşluğu (%50 - %96 Güvenli Aralık) */}
            <div className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="flex items-center justify-between text-[9px] font-black uppercase text-zinc-300 mb-1">
                <span className="flex items-center gap-1">
                  <Moon className="w-3 h-3 text-indigo-400" />
                  Salon Karartması / Loşluk
                </span>
                <span className="font-mono text-amber-400 font-bold">%{ambience.dimness}</span>
              </div>
              <input
                type="range"
                min="50"
                max="96"
                step="2"
                value={ambience.dimness}
                onChange={(e) => handleDimnessChange(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500 mt-0.5">
                <span>Rahat Loşluk (%50)</span>
                <span className="text-amber-400/80">Optimum (%85)</span>
                <span>Zifiri Gece (%96)</span>
              </div>
            </div>

            {/* Slider 2: Projeksiyon Hüzmesi (%15 - %90 Güvenli Aralık) */}
            <div className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="flex items-center justify-between text-[9px] font-black uppercase text-zinc-300 mb-1">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  Projeksiyon Parıltısı
                </span>
                <span className="font-mono text-rose-400 font-bold">%{ambience.glowIntensity}</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={ambience.glowIntensity}
                onChange={(e) => handleGlowChange(Number(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500 mt-0.5">
                <span>Loş Hüzme (%15)</span>
                <span className="text-rose-400/80">Doğal (%65)</span>
                <span>Görkemli Işık (%90)</span>
              </div>
            </div>

            {/* Gren ve Filigran Mini Butonları */}
            <div className="grid grid-cols-2 gap-2">
              {/* Gren Seçimi */}
              <div className="p-1.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                <span className="text-[8px] font-black uppercase text-zinc-400 ml-1">Gren:</span>
                <div className="flex gap-1">
                  {[
                    { id: "OFF", label: "Yok" },
                    { id: "SUBTLE", label: "Doğal" },
                    { id: "VINTAGE", label: "Vintage" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => onUpdateAmbience({ grain: g.id as GrainLevel })}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                        ambience.grain === g.id
                          ? "bg-amber-400 text-black shadow"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vizör Filigranı Toggle */}
              <button
                onClick={() => onUpdateAmbience({ showWatermark: !ambience.showWatermark })}
                className="p-1.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between px-2 text-[8px] font-black uppercase text-zinc-400 active:scale-95 transition-all"
              >
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  Filigran:
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                    ambience.showWatermark
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {ambience.showWatermark ? "AÇIK" : "KAPALI"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAmbienceConsole;
