// Tur 10C: Rehber Gösterim ve Sürüm Yönetimi
const GUIDE_STORAGE_KEY = "cinexox_rehber_v1";
let inMemoryGuideSeen = false;

export function hasSeenGuide(): boolean {
  if (inMemoryGuideSeen) return true;
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(GUIDE_STORAGE_KEY) === "görüldü";
  } catch {
    return inMemoryGuideSeen;
  }
}

export function markGuideAsSeen(): void {
  inMemoryGuideSeen = true;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUIDE_STORAGE_KEY, "görüldü");
  } catch {
    // Session memory fallback handles private/restricted browsing
  }
}
