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
const cfg = readFileSync(join(process.cwd(), "tailwind.config.ts"), "utf8");
t("tailwind scans src/types (avatar gradient classes live there)", cfg.includes("./src/types/"));
if (failed) process.exit(1);
