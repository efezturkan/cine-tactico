// Dokunsal geri bildirim: iOS/Android'de Capacitor Haptics (Taptic Engine), tarayıcıda Vibration API.
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

type Step = () => Promise<void>;

function hapticAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("cinexox_haptic") !== "0";
  } catch {
    // Depolama kapalıysa (özel gezinme) varsayılan: açık.
    return true;
  }
}

export function setHapticEnabled(enabled: boolean): void {
  try {
    localStorage.setItem("cinexox_haptic", enabled ? "1" : "0");
  } catch {
    // Depolama kapalıysa tercih bu oturumla sınırlı kalır; oyun etkilenmez.
  }
}

const impact = (style: ImpactStyle): Step => () => Haptics.impact({ style });
const notify = (type: NotificationType): Step => () => Haptics.notification({ type });

let reported = false;
function reportOnce(error: unknown): void {
  // Titreşim oyunun parçası değildir, ama sessizce yutulmaz: bir kez uyarı yazılır.
  if (reported) return;
  reported = true;
  console.warn("[haptics] native çağrı başarısız oldu; titreşim bu oturumda sessiz kalabilir", error);
}

/**
 * Yerel platformda sırayla Capacitor adımlarını, web'de tek bir titreşim desenini çalıştırır.
 * Web'de `navigator.vibrate` özelliği platform kontrolüyle seçilir; çağrı istisna fırlatmaz.
 */
async function play(steps: Step[], webPattern: number | number[]): Promise<void> {
  if (!hapticAllowed()) return;
  if (Capacitor.isNativePlatform()) {
    try {
      for (let i = 0; i < steps.length; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 60));
        await steps[i]();
      }
    } catch (error) {
      reportOnce(error);
    }
    return;
  }
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(webPattern);
  }
}

export const haptic = {
  light: () => play([impact(ImpactStyle.Light)], 10),
  medium: () => play([impact(ImpactStyle.Medium)], 35),
  success: () => play([notify(NotificationType.Success)], [20, 40, 30]),
  error: () => play([notify(NotificationType.Error)], [60, 30, 60]),
  victory: () => play([notify(NotificationType.Success), impact(ImpactStyle.Heavy)], [40, 60, 40, 60, 100]),
  cellSelect: () => haptic.light(),
  wrong: () => play([impact(ImpactStyle.Light), impact(ImpactStyle.Light)], [20, 30, 20]),
  kesin: () => haptic.medium(),
  loss: () => play([impact(ImpactStyle.Light)], 70),
  tick: () => play([impact(ImpactStyle.Light)], 5),
};
