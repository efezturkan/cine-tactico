/**
 * Uygulama arka plana alınınca (arama, bildirim, ana ekran) tur sayacı akmasın.
 * Gizli kalınan süre bildirilir; sayaç başlangıcı o kadar ileri alınır.
 */
export interface VisibilityDoc {
  hidden: boolean;
  addEventListener(type: "visibilitychange", cb: () => void): void;
  removeEventListener(type: "visibilitychange", cb: () => void): void;
}

export function trackHiddenTime(
  onResume: (hiddenMs: number) => void,
  doc: VisibilityDoc | undefined = typeof document !== "undefined" ? document : undefined,
  now: () => number = () => performance.now()
): () => void {
  if (!doc) return () => {};
  let hiddenAt: number | null = doc.hidden ? now() : null;
  const handler = () => {
    if (doc.hidden) {
      if (hiddenAt === null) hiddenAt = now();
    } else if (hiddenAt !== null) {
      const ms = Math.max(0, now() - hiddenAt);
      hiddenAt = null;
      if (ms > 0) onResume(ms);
    }
  };
  doc.addEventListener("visibilitychange", handler);
  return () => doc.removeEventListener("visibilitychange", handler);
}

/**
 * Gizli kalınan süreyi tur başlangıcına ekler, ama başlangıç hiçbir zaman "şimdi"den ileri olamaz.
 * (Tur arka plandayken değiştiyse başlangıç zaten gizli süre içindedir; tam süre verilir.)
 */
export function shiftTurnStart(turnStart: number, hiddenMs: number, now: number): number {
  return Math.min(turnStart + hiddenMs, now);
}
