// Cross-platform tactile haptic feedback (Mobile Web Vibration API + Capacitor Fallback)

export const haptic = {
  // Hafif dokunma
  light: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe ignore
      }
    }
  },

  // Orta sertlikte dokunma (Joker, hamle patlaması)
  medium: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(35);
      } catch {
        // Safe ignore
      }
    }
  },

  // Başarılı hamle (Çift tatlı vuruş)
  success: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([20, 40, 30]);
      } catch {
        // Safe ignore
      }
    }
  },

  // Hata / Süre uyarısı (Sert titreşim)
  error: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([60, 30, 60]);
      } catch {
        // Safe ignore
      }
    }
  },

  // Zafer / XOX çizgisi
  victory: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([40, 60, 40, 60, 100]);
      } catch {
        // Safe ignore
      }
    }
  }
};
