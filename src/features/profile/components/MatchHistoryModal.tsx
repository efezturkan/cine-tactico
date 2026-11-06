"use client";

import React, { useState } from "react";
import { MatchRecord, UserProfile } from "@/types/profile";
import { GameBoard, findMatchingMovies, getSharedActors } from "@/core";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { X, Share2, Eye, Film } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MiniKadrajPreview } from "@/components/ui/MiniKadrajPreview";
import { FLAGS } from "@/config/flags";
import { useTranslation } from "@/i18n";

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { locale, tBoardTitle } = useTranslation();
  const isEn = locale === "en";

  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  if (!isOpen) return null;

  const matches: MatchRecord[] = profile?.matchHistory ?? [];

  const formatDateShort = (ts: number) => {
    try {
      return new Intl.DateTimeFormat(isEn ? "en-US" : "tr-TR", {
        day: "numeric",
        month: "short",
      }).format(new Date(ts));
    } catch {
      return "";
    }
  };

  const handleShare = (m: MatchRecord) => {
    audio.playSelect();
    haptic.light();
    const rawTitle = m.board.title.includes(":") ? m.board.title.split(":")[0].trim() : m.board.title;
    const dTitle = tBoardTitle(rawTitle);
    const outcomeText = isEn
      ? m.outcome === "VICTORY"
        ? "Scene's yours!"
        : m.outcome === "DRAW"
        ? "Blind Frame (Tie)"
        : "Not this take"
      : m.outcome === "VICTORY"
      ? "Sahne senin!"
      : m.outcome === "DRAW"
      ? "Kör kadraj"
      : "Bu çekim olmadı";
    const shareText = `${isEn ? "CineXOX Duel" : "CineXOX Düellosu"}: ${dTitle} · ${isEn ? "Result" : "Sonuç"}: ${outcomeText}`;
    if (navigator.share) {
      navigator.share({ title: "CineXOX", text: shareText }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm select-none"
    >
      {/* 2.4 & 7E Alt Sheet (Bottom Sheet) */}
      <div className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] p-4 sm:p-5 flex flex-col max-h-[92dvh] shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 shrink-0" />

        {/* 7E.1 Başlık: Serif 'Arşiv', altında 'Son düellolar' */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#E8E6E1] tracking-wide">
              Arşiv
            </h2>
            <p className="text-xs text-[#8A8F9A] mt-0.5 font-sans">
              Son düellolar
            </p>
          </div>
          <Button variant="icon" onClick={onClose} title="Kapat">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-3 space-y-3 custom-scrollbar pr-1">
          {selectedMatch ? (
            /* Detay / İnceleme Görünümü */
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    audio.playSelect();
                    setSelectedMatch(null);
                  }}
                  className="text-xs font-bold text-[#D9A441] hover:underline"
                >
                  &larr; {isEn ? "Back to list" : "Listeye Dön"}
                </button>
                <Button
                  variant="inline"
                  onClick={() => handleShare(selectedMatch)}
                  className="flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "Share" : "Paylaş"}</span>
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/10">
                <span className="font-serif text-sm font-bold text-[#E8E6E1] block">
                  {tBoardTitle(selectedMatch.board.title)}
                </span>
                <span className="text-xs text-[#8A8F9A] mt-0.5 block">
                  vs {selectedMatch.opponent.name} · {formatDateShort(selectedMatch.timestamp)}
                </span>
              </div>

              {/* 3×3 Önizleme */}
              <div className="flex justify-center py-2">
                <MiniKadrajPreview cells={selectedMatch.cells} className="scale-125" />
              </div>
            </div>
          ) : matches.length === 0 ? (
            /* 7E.5 Boş Durum */
            <div className="py-16 text-center text-[#8A8F9A]">
              <Film className="w-8 h-8 text-[#D9A441]/40 mx-auto mb-2" />
              <p className="font-serif text-sm font-bold text-[#E8E6E1]">
                {isEn ? "No records in the archive yet." : "Arşivde henüz kayıt yok."}
              </p>
            </div>
          ) : (
            /* 7E.2 Maç Listesi */
            matches.map((m) => {
              const isWin = m.outcome === "VICTORY";
              const isDraw = m.outcome === "DRAW";
              const dTitle = m.board.title.includes(":")
                ? m.board.title.split(":")[0].trim()
                : m.board.title;
              const oppName = m.opponent?.name || (isEn ? "Cinephile Bot" : "Sinefil Botu");

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#181B22] border border-white/10 flex flex-col gap-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider border ${
                          isWin
                            ? "bg-[#D9A441]/15 text-[#D9A441] border-[#D9A441]/40"
                            : isDraw
                            ? "bg-white/5 text-[#8A8F9A] border-white/10"
                            : "bg-white/[0.03] text-[#8A8F9A] border-white/10"
                        }`}
                      >
                        {isWin
                          ? isEn
                            ? "Scene's yours!"
                            : "Sahne senin!"
                          : isDraw
                          ? isEn
                            ? "Blind frame"
                            : "Kör kadraj"
                          : isEn
                          ? "Not this take"
                          : "Bu çekim olmadı"}
                      </span>
                      <span className="text-xs text-[#8A8F9A] font-sans">
                        {formatDateShort(m.timestamp)}
                      </span>
                    </div>

                    {FLAGS.SHOW_POINTS_SYSTEM && m.scoreRarity > 0 && (
                      <span className="text-xs font-mono font-bold text-[#D9A441]">
                        +{m.scoreRarity}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <div className="font-serif font-bold text-sm text-[#E8E6E1] truncate">
                        {tBoardTitle(dTitle)}
                      </div>
                      <div className="text-xs text-[#8A8F9A] truncate mt-0.5">
                        vs {oppName}
                      </div>
                    </div>

                    {/* Sağda Mini Kadraj */}
                    <MiniKadrajPreview cells={m.cells} />
                  </div>

                  {/* Alt Satır Küçük Butonlar */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <Button
                      variant="inline"
                      onClick={() => handleShare(m)}
                      className="flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{isEn ? "Share" : "Paylaş"}</span>
                    </Button>
                    <Button
                      variant="inline"
                      onClick={() => {
                        audio.playSelect();
                        setSelectedMatch(m);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isEn ? "Inspect" : "İncele"}</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
