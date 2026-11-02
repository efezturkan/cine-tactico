"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronRight, ChevronLeft, X, Lock } from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "1. Kesişimi Oku, Kareyi Seç",
      desc: "Her satır ve sütunda bir sinema kriteri yer alır (Yönetmen, Başrol, Tür, Ödül, Dönem). İki kriterin kesiştiği hedef kareye dokun.",
      badge: "ADIM 1",
      visual: (
        <div className="p-4 rounded-xl bg-night border border-white/10 text-center my-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-lg bg-gold/15 text-gold border border-gold/40">
              Christopher Nolan
            </span>
            <span className="font-mono text-muted">×</span>
            <span className="px-3 py-1 rounded-lg bg-team-blue/15 text-team-blue border border-team-blue/40">
              Leonardo DiCaprio
            </span>
          </div>
          <div className="text-xs text-muted">
            Hedef: İki kriteri aynı anda sağlayan ortak filmi bulmak.
          </div>
        </div>
      ),
    },
    {
      title: "2. 12 Saniyede Filmi Doğrula",
      desc: "Arama kutusuna aklındaki filmi yaz. Adil rekabet için arama listesinde yönetmen, yıl veya tür ipucu gösterilmez.",
      badge: "ADIM 2",
      visual: (
        <div className="p-4 rounded-xl bg-night border border-white/10 text-center my-4">
          <div className="p-2.5 rounded-lg bg-control border border-scored/60 flex items-center justify-between text-xs font-bold text-scored">
            <span>Inception</span>
            <CheckCircle2 className="w-4 h-4 text-scored" />
          </div>
          <div className="text-xs text-muted mt-2">
            Doğru cevapta kare senin renginle mühürlenir.
          </div>
        </div>
      ),
    },
    {
      title: "3. Üçlü Hattı Kur & Kazan",
      desc: "Yatay, dikey veya çapraz 3 kareyi ilk birleştiren düelloyu kazanır. İki oyuncu da bir karede yanılırsa o kare sahipsiz kilitlenir.",
      badge: "ADIM 3",
      visual: (
        <div className="p-4 rounded-xl bg-night border border-white/10 text-center my-4">
          <div className="grid grid-cols-3 gap-1.5 max-w-[144px] mx-auto mb-2.5">
            <div className="aspect-square rounded-lg bg-gold text-night font-display font-extrabold flex items-center justify-center text-base">
              X
            </div>
            <div className="aspect-square rounded-lg bg-gold text-night font-display font-extrabold flex items-center justify-center text-base">
              X
            </div>
            <div className="aspect-square rounded-lg bg-gold text-night font-display font-extrabold flex items-center justify-center text-base ring-2 ring-ink">
              X
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gold">
            <span>3&apos;LÜ HAT = ZAFER</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-muted">
              <Lock className="w-3 h-3" /> Kilitli kare çalınamaz
            </span>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm animate-card-in rounded-2xl bg-panel border border-white/10 p-6 shadow-2xl flex flex-col relative text-ink">
        {/* Close */}
        <button
          onClick={() => {
            audio.playSelect();
            onClose();
          }}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-ink"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            {currentSlide.badge}
          </span>
          <h2 className="font-display text-2xl font-extrabold italic uppercase tracking-wide text-ink mt-1">
            {currentSlide.title}
          </h2>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            {currentSlide.desc}
          </p>
        </div>

        {/* Visual Simulation */}
        {currentSlide.visual}

        {/* Step Indicators */}
        <div className="flex justify-center gap-1.5 my-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                step === i ? "w-6 bg-gold" : "w-2 bg-control"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          {step > 0 && (
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                setStep((s) => s - 1);
              }}
              className="tactile-btn-surface h-11 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1 text-[#F1EEE7]"
            >
              <ChevronLeft className="w-4 h-4" />
              Geri
            </button>
          )}

          {step < slides.length - 1 ? (
            <button
              onClick={() => {
                audio.playSelect();
                haptic.light();
                setStep((s) => s + 1);
              }}
              className="tactile-btn-amber flex-1 h-11 px-4 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1 text-[#0F1115]"
            >
              <span>İLERİ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                audio.playSuccess();
                haptic.light();
                onClose();
              }}
              className="tactile-btn-amber flex-1 h-11 px-4 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-[#0F1115]"
            >
              <span>OYUNA BAŞLA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
