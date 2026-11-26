import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

/**
 * Seri, profil ve Günlük Kadraj sonucu WebView'ın localStorage'ında durur. iOS, depolama
 * sıkışınca WebView verisini sessizce silebilir. Bu modül anahtarların bir kopyasını
 * yerel Preferences'ta (UserDefaults) tutar ve localStorage boş kalmışsa geri yükler.
 * Ağ yoktur; veri cihazdan çıkmaz. Uygulama silinirse ikisi de silinir (beklenen davranış).
 */
export const SNAPSHOT_KEY = "crosscut_snapshot_v1";
const PREFIX = "cinexox_";

export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface SnapshotBackend {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
}

export function collectSnapshot(storage: StorageLike): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    const value = storage.getItem(key);
    if (value !== null) out[key] = value;
  }
  return out;
}

export async function saveSnapshot(storage: StorageLike, backend: SnapshotBackend): Promise<void> {
  const snapshot = collectSnapshot(storage);
  // Boş durumu kopyalama: aksi halde silinmiş localStorage, sağlam yedeğin üstüne yazılırdı.
  if (Object.keys(snapshot).length === 0) return;
  await backend.write(JSON.stringify(snapshot));
}

/** localStorage'ta hiç uygulama anahtarı yoksa ve yedek varsa geri yükler. Yüklediyse true döner. */
export async function restoreIfEmpty(storage: StorageLike, backend: SnapshotBackend): Promise<boolean> {
  if (Object.keys(collectSnapshot(storage)).length > 0) return false;
  const raw = await backend.read();
  if (!raw) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false; // bozuk yedek yok sayılır; oyun temiz başlar
  }
  if (!parsed || typeof parsed !== "object") return false;
  let restored = 0;
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (key.startsWith(PREFIX) && typeof value === "string") {
      storage.setItem(key, value);
      restored++;
    }
  }
  return restored > 0;
}

const nativeBackend: SnapshotBackend = {
  read: async () => (await Preferences.get({ key: SNAPSHOT_KEY })).value,
  write: async (value) => {
    await Preferences.set({ key: SNAPSHOT_KEY, value });
  },
};

/** Yalnızca yerel (iOS/Android) uygulamada çalışır. Geri yükleme olduysa sayfayı bir kez yeniler. */
export function startDurableStore(): () => void {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) return () => {};
  let cancelled = false;
  const save = () => {
    saveSnapshot(window.localStorage, nativeBackend).catch((error) =>
      console.warn("[durableStore] yedek yazılamadı", error)
    );
  };
  restoreIfEmpty(window.localStorage, nativeBackend)
    .then((restored) => {
      if (cancelled) return;
      if (restored) window.location.reload();
      else window.setTimeout(save, 3000);
    })
    .catch((error) => console.warn("[durableStore] yedek okunamadı", error));
  const onHide = () => {
    if (document.visibilityState === "hidden") save();
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", save);
  return () => {
    cancelled = true;
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", save);
  };
}
