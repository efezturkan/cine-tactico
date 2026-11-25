import { generateReverseBoard } from "@/data/generatedBoards";
import { getSharedActors } from "@/core/engine/validator";

let failed = 0;
const t = (name: string, ok: boolean) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
};

let built = 0;
let allShared = true;
let distinct = true;
for (let seed = 1; seed <= 200; seed++) {
  const b = generateReverseBoard(seed);
  if (!b) continue;
  built++;
  const titles = [...b.rows, ...b.cols].map(c => c.value.toLowerCase());
  if (new Set(titles).size !== 6) distinct = false;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (getSharedActors(b.rows[r].value, b.cols[c].value).length < 1) allShared = false;
}
t("most seeds yield boards (>=120 of 200; the rest fall back to preset boards)", built >= 120);
t("every cell has >=1 shared actor", allShared);
t("six distinct films per board", distinct);
t("same seed gives same board", JSON.stringify(generateReverseBoard(42)) === JSON.stringify(generateReverseBoard(42)));
let b = generateReverseBoard(7);
for (let s = 8; !b && s < 60; s++) b = generateReverseBoard(s);
if (!b) throw new Error("no board");
t("board is REVERSE_CAST with 9 validCounts", b.boardMode === "REVERSE_CAST" && Object.keys(b.validCounts).length === 9);
if (failed) process.exit(1);
