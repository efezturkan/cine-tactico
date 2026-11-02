import React from "react";
import { CellAnswer } from "@/core";

export function MiniKadrajPreview({
  cells,
  size = "sm",
  className = "",
}: {
  cells?: (CellAnswer | null)[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const safeCells = cells || Array(9).fill(null);
  
  const cellSizes = {
    sm: "w-3.5 h-3.5 rounded-[2px]",
    md: "w-6 h-6 rounded-[3px]",
    lg: "w-8 h-8 rounded-[4px]",
  };

  const gapSizes = {
    sm: "gap-1 p-1 rounded-lg",
    md: "gap-1.5 p-1.5 rounded-xl",
    lg: "gap-2 p-2 rounded-xl",
  };

  return (
    <div
      className={`grid grid-cols-3 ${gapSizes[size]} bg-[#0B0D12] border border-white/10 shrink-0 ${className}`}
      aria-label="3×3 Mini Kadraj"
    >
      {safeCells.slice(0, 9).map((c, i) => {
        let bg = "#181B22";
        if (c?.answeredBy === "X") bg = "#D9A441";
        else if (c?.answeredBy === "O") bg = "#4FA3C7";

        return (
          <div
            key={i}
            className={`${cellSizes[size]} transition-colors`}
            style={{ backgroundColor: bg }}
          />
        );
      })}
    </div>
  );
}
