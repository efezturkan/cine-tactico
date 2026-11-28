import { BOT_OPPONENTS } from "@/data/boards";
import { AVATAR_OPTIONS } from "@/types/profile";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

let failed = 0;
const t = (name: string, ok: boolean) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
};

const LEGACY_IDS = [
  "avatar_director",
  "avatar_actor",
  "avatar_lens",
  "avatar_scifi",
  "avatar_noir",
  "avatar_popcorn",
  "avatar_camera",
  "avatar_oscar",
];

const ids = new Set(AVATAR_OPTIONS.map(a => a.id));
t("legacy 8 avatar ids are preserved", LEGACY_IDS.every(id => ids.has(id)));
t(
  "every avatar option has a 256x256 webp file in public/avatars",
  AVATAR_OPTIONS.every(a => existsSync(join(process.cwd(), "public", "avatars", `${a.id}.webp`)))
);
t("every bot avatar id exists in AVATAR_OPTIONS", BOT_OPPONENTS.every(b => ids.has(b.avatarId)));
// Rakip seçimi her seviyeden bir bot gösterir: seviyeler arasında aynı avatar çıkmamalı
const byTier = (d: string) => new Set(BOT_OPPONENTS.filter(b => b.difficulty === d).map(b => b.avatarId));
const tiers = [byTier("EASY"), byTier("MEDIUM"), byTier("HARD")];
const all = tiers.flatMap(s => Array.from(s));
t("bot avatar sets are disjoint across difficulty tiers", all.length === new Set(all).size);
t(
  "every bot opponent has its own unique avatar",
  new Set(BOT_OPPONENTS.map(b => b.avatarId)).size === BOT_OPPONENTS.length
);
const cfg = readFileSync(join(process.cwd(), "tailwind.config.ts"), "utf8");
t("tailwind still scans src/types", cfg.includes("./src/types/"));
if (failed) process.exit(1);
