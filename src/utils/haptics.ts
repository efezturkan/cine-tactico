// Cross-platform tactile haptic feedback (Capacitor Native Taptic Engine + Web Vibration API Fallback)
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const isNative = () => {
  return typeof window !== "undefined" && (window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform?.();
};

function hapticAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("cinexox_haptic") !== "0";
  } catch {
    return true;
  }
}

export function setHapticEnabled(enabled: boolean): void {
  try {
    localStorage.setItem("cinexox_haptic", enabled ? "1" : "0");
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

export const haptic = {
  // Hafif dokunma
  light: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Safe fallback
    }
  },

  // Orta sertlikte dokunma (Joker, hamle patlaması)
  medium: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(35);
      }
    } catch {
      // Safe fallback
    }
  },

  // Başarılı hamle (Çift tatlı vuruş)
  success: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([20, 40, 30]);
      }
    } catch {
      // Safe fallback
    }
  },

  // Hata / Süre uyarısı (Sert titreşim)
  error: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Error });
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([60, 30, 60]);
      }
    } catch {
      // Safe fallback
    }
  },

  // Zafer / XOX çizgisi
  victory: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Success });
        setTimeout(() => {
          Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
        }, 150);
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([40, 60, 40, 60, 100]);
      }
    } catch {
      // Safe fallback
    }
  },

  // ── Tur 10B: Standart Haptic Haritası ──
  // Hücre seç = hafif
  cellSelect: async () => {
    return haptic.light();
  },

  // Yanlış = çift kısa
  wrong: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Light });
        setTimeout(() => {
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        }, 60);
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([20, 30, 20]);
      }
    } catch {}
  },

  // Kesin! = orta
  kesin: async () => {
    return haptic.medium();
  },

  // Kayıp = tek uzun hafif
  loss: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(70);
      }
    } catch {}
  },

  // Geri sayım tık = çok hafif
  tick: async () => {
    if (!hapticAllowed()) return;
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      }
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(5);
      }
    } catch {}
  },
};
