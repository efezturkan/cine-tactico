"use client";

import React from "react";
import { CellAnswer, PlayerSymbol } from "@/types/game";
import { Film, Trophy, Clock, Star, Award, ShieldAlert } from "lucide-react";

interface TabletSidePanelProps {
  cells: (CellAnswer | null)[];
  currentTurn: PlayerSymbol;
  playerXScore: number;
  playerOScore: number;
}

export const TabletSidePanel: React.FC<TabletSidePanelProps> = ({
  cells,
  currentTurn,
  playerXScore,
  playerOScore
}) => {
  const answeredCells = cells.filter((c): c is CellAnswer => c !== null);

  return (
    <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-4 p-4 bg-cinema-card/50 border-l border-cinema-border/50 overflow-y-auto">
      {/* Taktik & Kurallar Kartı */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
          <Trophy className="w-3.5 h-3.5" />
          CineXOX Kuralları
        </h3>
        <ul className="text-[11px] text-zinc-300 space-y-1.5">
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold">&bull;</span>
            Kareye tıklayıp satır ve sütundaki 2 kurala da uyan bir film seçin.
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold">&bull;</span>
            Yatay, dikey veya çapraz <b className="text-white">3&apos;lü hat</b> kuran kazanır.
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold">&bull;</span>
            Süre: 20 saniye. Süresi bitenin sırası devredilir.
          </li>
        </ul>
      </div>

      {/* Oynanan Filmler Canlı Kartları */}
      <div className="flex-1 flex flex-col min-h-0 bg-cinema-card border border-cinema-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-zinc-400" />
            Oynanan Filmler ({answeredCells.length}/9)
          </span>
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {answeredCells.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-500">
              Henüz hamle yapılmadı.
              <br />İlk kareyi kim kapacak?
            </div>
          ) : (
            answeredCells.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-cinema-dark border border-cinema-border flex items-start gap-3"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                    item.answeredBy === "X"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {item.answeredBy}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-zinc-100 truncate">
                    {item.movie.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {item.movie.director} · {item.movie.year}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold text-zinc-400">
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.movie.imdbRating}
                    </span>
                    {item.movie.hasOscar && (
                      <span className="flex items-center gap-0.5 text-yellow-400">
                        <Award className="w-3 h-3" /> Oscar
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
