// Cross-platform tactile haptic feedback (Capacitor Native Taptic Engine + Web Vibration API Fallback)
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const isNative = () => {
  return typeof window !== "undefined" && (window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform?.();
};

export const haptic = {
  // Hafif dokunma
  light: async () => {
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
};
