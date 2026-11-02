"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { audio } from "@/utils/audio";
import { X, Film } from "lucide-react";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDismiss = () => {
    audio.playSelect();
    try {
      localStorage.setItem("cinexox_seen_guide", "1");
    } catch {}
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#14171D] border border-white/10 p-6 flex flex-col shadow-2xl relative">
        <Button
          variant="icon"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Top micro tag */}
        <div className="text-center mb-1">
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#D9A441] uppercase">
            35MM · 24 FPS
          </span>
        </div>

        {/* Title */}
        <div className="text-center my-2">
          <h2 className="font-serif text-2xl font-bold text-[#E8E6E1]">
            Nasıl Oynanır?
          </h2>
          <p className="text-xs text-[#8A8F9A] mt-0.5">
            Üç hamlede sinematik zafer.
          </p>
        </div>

        {/* 3 Step Rules */}
        <div className="flex flex-col gap-3 my-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0B0D12] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-[#181B22] border border-[#D9A441]/40 text-[#D9A441] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p className="text-xs text-[#E8E6E1] leading-relaxed">
              Kadrajdaki iki kriterin kesiştiği filmi bul.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0B0D12] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-[#181B22] border border-[#D9A441]/40 text-[#D9A441] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p className="text-xs text-[#E8E6E1] leading-relaxed">
              Hamle için 12 saniyen var.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0B0D12] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-[#181B22] border border-[#D9A441]/40 text-[#D9A441] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p className="text-xs text-[#E8E6E1] leading-relaxed">
              Üç kareyi yan yana getir. Kesin!
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button variant="primary" onClick={handleDismiss} className="w-full">
          ANLADIM
        </Button>
      </div>
    </div>
  );
};

export default HowToPlayModal;
