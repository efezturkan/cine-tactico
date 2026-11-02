"use client";

import React from "react";
import { CellAnswer, PlayerSymbol } from "@/core";
import { Film, Trophy, Award } from "lucide-react";

interface TabletSidePanelProps {
  cells: (CellAnswer | null)[];
  currentTurn: PlayerSymbol;
  playerXScore: number;
  playerOScore: number;
}

export const TabletSidePanel: React.FC<TabletSidePanelProps> = ({
  cells,
}) => {
  const answeredCells = cells.filter((c): c is CellAnswer => c !== null);

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-3 p-4 border-l border-white/10 bg-night/60 overflow-y-auto">
      {/* Rules Summary Card */}
      <div className="rounded-2xl bg-panel border border-white/10 p-4 shadow-md">
        <h3 className="font-display text-sm font-extrabold italic uppercase tracking-wider text-gold flex items-center gap-1.5 mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>OYUN KURALLARI</span>
        </h3>
        <ul className="text-xs text-muted space-y-1.5 leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-gold font-bold">&bull;</span>
            <span>Satır ve sütundaki iki kritere de uyan ortak filmi seç.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-gold font-bold">&bull;</span>
            <span>
              Yatay, dikey veya çapraz <strong className="text-ink">3&apos;lü hat</strong> kuran kazanır.
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-gold font-bold">&bull;</span>
            <span>Hamle süresi 12 saniyedir. Mühürlenen kare çalınamaz.</span>
          </li>
        </ul>
      </div>

      {/* Live Match Film Log */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-panel border border-white/10 p-4 shadow-md">
        <h3 className="font-display text-sm font-extrabold italic uppercase tracking-wider text-muted flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-gold" />
            <span>MÜHÜRLENEN KARELER ({answeredCells.length}/9)</span>
          </span>
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {answeredCells.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted/60">
              Henüz kare mühürlenmedi.
              <br />
              İlk hamleyi yapmak için bir kesişim seç.
            </div>
          ) : (
            answeredCells.map((item, idx) => {
              const isX = item.answeredBy === "X";
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-night border border-white/10 flex items-start gap-2.5"
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-display font-extrabold text-xs shrink-0"
                    style={{
                      backgroundColor: isX ? "rgba(245, 196, 81, 0.18)" : "rgba(76, 154, 255, 0.18)",
                      color: isX ? "#F5C451" : "#4C9AFF",
                      border: `1px solid ${isX ? "rgba(245, 196, 81, 0.45)" : "rgba(76, 154, 255, 0.45)"}`,
                    }}
                  >
                    {item.answeredBy}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-ink truncate">
                      {item.actorName || item.movie.title}
                    </div>
                    {!item.actorName && item.movie.year > 0 && (
                      <div className="text-[10px] text-muted truncate mt-0.5">
                        {item.movie.director} · {item.movie.year}
                      </div>
                    )}
                    {item.movie.hasOscar && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gold">
                        <Award className="w-3 h-3" /> Oscar
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
