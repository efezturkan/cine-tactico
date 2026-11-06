"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { audio } from "@/utils/audio";
import { markGuideAsSeen } from "@/utils/guideStorage";
import { useTranslation } from "@/i18n";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { locale } = useTranslation();
  const isEn = locale === "en";

  if (!isOpen) return null;

  const handleDismiss = () => {
    audio.playSelect();
    markGuideAsSeen();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#14171D] border border-white/10 p-5 sm:p-6 flex flex-col shadow-2xl relative">
        {/* Viewfinder corner brackets */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-white/20 pointer-events-none" />

        {/* Top micro tag */}
        <div className="text-center mb-1">
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#D9A441] uppercase">
            35MM · 24 FPS
          </span>
        </div>

        {/* Title (Serif, Alt başlık kaldırıldı) */}
        <div className="text-center my-1.5">
          <h2 className="font-serif text-2xl font-bold text-[#E8E6E1]">
            {isEn ? "How to play?" : "Nasıl oynanır?"}
          </h2>
        </div>

        {/* 3 Parça Tek Kartta (İç içe kutular ve numara daireleri kaldırıldı) */}
        <div className="flex flex-col my-3">
          {/* a) Kesişim Görseli: 2x2 Mini Düzen */}
          <div className="pb-3.5 border-b border-white/5 flex flex-col items-center">
            <div className="grid grid-cols-2 gap-1.5 w-full max-w-[210px] items-center justify-center">
              {/* Boş köşe */}
              <div className="h-9 rounded-lg border border-transparent flex items-center justify-center opacity-30 text-[#8A8F9A] font-mono text-xs">
                ✕
              </div>
              {/* Sütun Kriteri */}
              <div className="h-9 px-2 rounded-lg bg-[#0B0D12] border border-white/10 flex items-center justify-center text-center">
                <span className="text-[10px] font-sans font-bold text-[#8A8F9A] truncate">
                  C. Nolan
                </span>
              </div>
              {/* Satır Kriteri */}
              <div className="h-9 px-2 rounded-lg bg-[#0B0D12] border border-white/10 flex items-center justify-center text-center">
                <span className="text-[10px] font-sans font-bold text-[#8A8F9A] truncate">
                  L. DiCaprio
                </span>
              </div>
              {/* Kesişim Hücresi (Altın çerçeveli, içinde film adı) */}
              <div className="h-9 px-2 rounded-lg bg-[#181B22] border border-[#D9A441] shadow-[0_0_12px_rgba(217,164,65,0.12)] flex items-center justify-center text-center">
                <span className="text-[11px] font-serif font-bold text-[#D9A441] truncate">
                  Inception
                </span>
              </div>
            </div>
            <p className="text-xs text-[#8A8F9A] text-center mt-2.5">
              {isEn ? "Find the film shared by row and column." : "Satır ve sütunun ortak filmini bul."}
            </p>
          </div>

          {/* b) İnce Altın Süre Çubuğu (%72 Dolu) */}
          <div className="py-3.5 border-b border-white/5 flex flex-col items-center">
            <div className="w-full max-w-[200px] h-1.5 bg-[#0B0D12] rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-[#D9A441] rounded-full"
                style={{ width: "72%" }}
              />
            </div>
            <p className="text-xs text-[#8A8F9A] text-center mt-2">
              {isEn ? "You have 12 seconds." : "12 saniyen var."}
            </p>
          </div>

          {/* c) Üç Mini 3x3 Kadraj (Yatay, Dikey, Çapraz) */}
          <div className="pt-3.5 flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* 1. Yatay Hat */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#0B0D12] border border-white/10 shrink-0">
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#4FA3C7]/65" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#4FA3C7]/65" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
              </div>

              {/* 2. Dikey Hat */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#0B0D12] border border-white/10 shrink-0">
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#4FA3C7]/65" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#4FA3C7]/65" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
              </div>

              {/* 3. Çapraz Hat */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#0B0D12] border border-white/10 shrink-0">
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#4FA3C7]/65" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#4FA3C7]/65" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#181B22]" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D9A441]" />
              </div>
            </div>
            <p className="text-xs text-[#8A8F9A] text-center mt-2.5">
              {isEn ? "Three cells in a row, column, or diagonal: Scene's yours!" : "Yatay, dikey ya da çapraz üç kare: Sahne senin!"}
            </p>
          </div>
        </div>

        {/* Ana Buton (Tek buton: ANLADIM) */}
        <Button variant="primary" onClick={handleDismiss} className="w-full mt-2">
          {isEn ? "GOT IT" : "ANLADIM"}
        </Button>
      </div>
    </div>
  );
};

export default HowToPlayModal;
