"use client";

/** Oyuncunun her botla olan galibiyet / mağlubiyet / beraberlik kaydı (yalnızca cihazda). */
export interface BotRecord {
  w: number;
  l: number;
  d: number;
}

const STORAGE_KEY = "cinexox_bot_records";

export type BotRecordBook = Record<string, BotRecord>;

/** Depodan gelen ham metni güvenle çözer: bozuk, eksik ya da tuhaf veri boş kayda döner. */
export function parseBotRecords(raw: string | null): BotRecordBook {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), 99999) : 0);
    const book: BotRecordBook = {};
    for (const [name, rec] of Object.entries(parsed as Record<string, Partial<BotRecord> | null>)) {
      if (name === "__proto__") continue;
      book[name] = { w: n(rec?.w), l: n(rec?.l), d: n(rec?.d) };
    }
    return book;
  } catch {
    return {};
  }
}

export function readBotRecords(): BotRecordBook {
  if (typeof window === "undefined") return {};
  try {
    return parseBotRecords(localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}

export function applyBotResult(book: BotRecordBook, botName: string, outcome: "W" | "L" | "D"): BotRecordBook {
  const cur = book[botName] ?? { w: 0, l: 0, d: 0 };
  const next: BotRecord = {
    w: cur.w + (outcome === "W" ? 1 : 0),
    l: cur.l + (outcome === "L" ? 1 : 0),
    d: cur.d + (outcome === "D" ? 1 : 0),
  };
  return { ...book, [botName]: next };
}

export function recordBotResult(botName: string, outcome: "W" | "L" | "D"): BotRecordBook {
  const next = applyBotResult(readBotRecords(), botName, outcome);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Depolama yoksa kayıt yalnızca bu oturumda tutulamaz
  }
  return next;
}
