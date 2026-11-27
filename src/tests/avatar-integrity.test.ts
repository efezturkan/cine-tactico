import { BOT_OPPONENTS } from "@/data/boards";
import { AVATAR_OPTIONS } from "@/types/profile";
import { readFileSync } from "fs";
import { join } from "path";

let failed = 0;
const t = (name: string, ok: boolean) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
};

const ids = new Set(AVATAR_OPTIONS.map(a => a.id));
t("every bot avatar id exists in AVATAR_OPTIONS", BOT_OPPONENTS.every(b => ids.has(b.avatarId)));
// Rakip seçimi her seviyeden bir bot gösterir: seviyeler arasında aynı avatar çıkmamalı (hangi bot gelirse gelsin 3 farklı ikon)
const byTier = (d: string) => new Set(BOT_OPPONENTS.filter(b => b.difficulty === d).map(b => b.avatarId));
const tiers = [byTier("EASY"), byTier("MEDIUM"), byTier("HARD")];
const all = tiers.flatMap(s => Array.from(s));
t("bot avatar sets are disjoint across difficulty tiers", all.length === new Set(all).size);
t("no avatar is used by more than 2 bots", AVATAR_OPTIONS.every(a => BOT_OPPONENTS.filter(b => b.avatarId === a.id).length <= 2));
const cfg = readFileSync(join(process.cwd(), "tailwind.config.ts"), "utf8");
t("tailwind still scans src/types", cfg.includes("./src/types/"));
if (failed) process.exit(1);
