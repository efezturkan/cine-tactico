"use client";

import React, { useState } from "react";
import { HelpCircle, CheckCircle2, ChevronRight, ChevronLeft, Film, Trophy, Swords, X } from "lucide-react";
import { audio } from "@/utils/audio";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "1. Kesişimi Gör, Kareyi Seç",
      desc: "Her satır ve sütunun başında bir sinema kuralı yer alır (Yönetmen, Oyuncu, Tür, Oscar vb.). İki kuralın kesiştiği kareye dokun.",
      badge: "TEMEL MANTIK",
      visual: (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center my-3">
          <div className="flex items-center justify-center gap-2 text-xs font-black mb-2">
            <span className="px-2 py-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Christopher Nolan
            </span>
            <span>+</span>
            <span className="px-2 py-1 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              Leonardo DiCaprio
            </span>
          </div>
          <div className="text-[11px] text-zinc-400">
            Hedef: İki ismin de yer aldığı ortak filmi bul!
          </div>
        </div>
      ),
    },
    {
      title: "2. Hafızana Güven, Filmi Seç",
      desc: "Arama kutusuna aklındaki filmi yaz. Arama listesinde kopya yok! Filmin o yönetmene veya oyuncuya ait olduğunu kendin bilmelisin.",
      badge: "SPOILER-FREE",
      visual: (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center my-3">
          <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-emerald-500/50 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Inception (2010)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[11px] text-zinc-400 mt-2">
            Doğru cevap verince kare afişiyle kaplanır ve senin renginle mühürlenir!
          </div>
        </div>
      ),
    },
    {
      title: "3. 3'lü Hat Kur & Taktiksel Çal",
      desc: "Yatay, dikey veya çapraz 3 kareyi ilk tamamlayan maçı kazanır. 'Kare Çalma' açıkken rakibin karesini daha yüksek puanlı bir filmle geri alabilirsin!",
      badge: "TAKTIK VE ZAFER",
      visual: (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center my-3">
          <div className="grid grid-cols-3 gap-1.5 max-w-[140px] mx-auto mb-2">
            <div className="aspect-square rounded bg-cyan-500 text-black font-black flex items-center justify-center text-xs">X</div>
            <div className="aspect-square rounded bg-cyan-500 text-black font-black flex items-center justify-center text-xs">X</div>
            <div className="aspect-square rounded bg-cyan-500 text-black font-black flex items-center justify-center text-xs ring-2 ring-amber-400 animate-pulse">X</div>
          </div>
          <div className="text-xs font-black text-amber-400">
            🏆 3&apos;LÜ HAT = ANINDA ZAFER!
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-cinema-card border border-cinema-border rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Kapat */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık */}
        <div className="text-center pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
            {currentSlide.badge}
          </span>
          <h2 className="text-lg font-black text-white mt-1.5">{currentSlide.title}</h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{currentSlide.desc}</p>
        </div>

        {/* Görsel Simülasyon */}
        {currentSlide.visual}

        {/* Sayfa İndikatörleri */}
        <div className="flex justify-center gap-1.5 my-3">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                step === i ? "w-6 bg-amber-400" : "w-2 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Navigasyon Butonları */}
        <div className="flex gap-2 pt-2 border-t border-cinema-border">
          {step > 0 && (
            <button
              onClick={() => {
                audio.playSelect();
                setStep(s => s - 1);
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Geri
            </button>
          )}

          {step < slides.length - 1 ? (
            <button
              onClick={() => {
                audio.playSelect();
                setStep(s => s + 1);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-cinema-dark font-black text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-amber-500/20"
            >
              İleri
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                audio.playVictory();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-black text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-rose-500/20"
            >
              Anladım, Oyuna Başla! 🎬
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
