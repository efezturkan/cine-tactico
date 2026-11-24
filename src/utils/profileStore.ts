import type { UserProfile } from "@/types/profile";

/**
 * Yerel profil kaydı (save-systems: sürüm damgası, savunmacı yükleme, doğrulama).
 * Bozuk, eksik ya da elle değiştirilmiş kayıt oyunu çökertmez ve ekranda NaN göstermez:
 * yalnızca bilinen alanlar, doğru türde ve makul aralıkta alınır; gerisi varsayılanda kalır.
 */
export const PROFILE_SCHEMA_VERSION = 1;

const NUMBER_KEYS = [
  "rankLevel", "totalMatches", "wins", "losses", "draws", "highestCombo", "dailyStreak", "reelsBalance", "diamondsBalance",
] as const;
const STRING_KEYS = ["avatarId", "rankTitle", "favoriteGenre", "favoriteDirector", "favoriteMode", "letterboxdUsername"] as const;
const MAX_NUMBER = 1_000_000_000;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function sanitizeStoredProfile(raw: unknown): Partial<UserProfile> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, unknown> = {};

  for (const k of NUMBER_KEYS) {
    const v = raw[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[k] = Math.min(MAX_NUMBER, Math.floor(v));
  }
  for (const k of STRING_KEYS) {
    const v = raw[k];
    if (typeof v === "string" && v.length > 0 && v.length <= 60) out[k] = v;
  }
  if (typeof raw.username === "string") {
    const name = raw.username.trim().slice(0, 24);
    if (name) out.username = name;
  }
  if (typeof raw.lastStreakDateUtc === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastStreakDateUtc)) {
    out.lastStreakDateUtc = raw.lastStreakDateUtc;
  }
  for (const k of ["streakProtected", "isPro"] as const) {
    if (typeof raw[k] === "boolean") out[k] = raw[k];
  }
  if (Array.isArray(raw.lastFiveMatches)) {
    out.lastFiveMatches = raw.lastFiveMatches.filter(x => x === "W" || x === "L" || x === "D").slice(-5);
  }
  if (Array.isArray(raw.unlockedAvatars)) {
    out.unlockedAvatars = raw.unlockedAvatars.filter((x): x is string => typeof x === "string" && x.length <= 60).slice(0, 100);
  }
  if (Array.isArray(raw.matchHistory)) {
    out.matchHistory = raw.matchHistory.filter(isPlainObject).slice(0, 20);
  }
  if (isPlainObject(raw.powerups)) out.powerups = raw.powerups;
  if (isPlainObject(raw.tasteDna)) out.tasteDna = raw.tasteDna;
  return out as Partial<UserProfile>;
}

/** Diske yazılacak biçim: sürüm damgalı */
export function serializeProfile(profile: UserProfile): string {
  return JSON.stringify({ ...profile, schemaVersion: PROFILE_SCHEMA_VERSION });
}

/** Okuma: JSON bozuksa ya da daha yeni sürümse boş döner (varsayılanlar kullanılır) */
export function parseStoredProfile(text: string | null): Partial<UserProfile> {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text) as unknown;
    if (isPlainObject(parsed) && typeof parsed.schemaVersion === "number" && parsed.schemaVersion > PROFILE_SCHEMA_VERSION) return {};
    return sanitizeStoredProfile(parsed);
  } catch {
    return {};
  }
}
