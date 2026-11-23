import { Share } from "@capacitor/share";

export type ShareOutcome = "shared" | "cancelled" | "copied" | "failed";

export interface ShareDeps {
  isNative: () => boolean;
  nativeShare: (o: { title: string; text: string }) => Promise<unknown>;
  webShare?: (o: { title: string; text: string }) => Promise<unknown>;
  copy?: (text: string) => Promise<unknown>;
}

const isCancel = (e: unknown): boolean => {
  const m = String((e as { message?: string; name?: string })?.message ?? "") + String((e as { name?: string })?.name ?? "");
  return /cancel|abort/i.test(m);
};

/**
 * Önce yerel paylaşım sayfası (iOS/Android), sonra web paylaşımı, en son panoya kopyalama.
 * Kullanıcı sayfayı kapatırsa (iptal) pano devreye GİRMEZ ve hata sayılmaz.
 */
export async function shareText(title: string, text: string, deps: ShareDeps = defaultDeps()): Promise<ShareOutcome> {
  const payload = { title, text };
  try {
    if (deps.isNative()) {
      await deps.nativeShare(payload);
      return "shared";
    }
    if (deps.webShare) {
      await deps.webShare(payload);
      return "shared";
    }
  } catch (e) {
    if (isCancel(e)) return "cancelled";
    // Paylaşım başarısız: panoya düş
  }
  try {
    if (deps.copy) {
      await deps.copy(text);
      return "copied";
    }
  } catch {
    // pano da yoksa
  }
  return "failed";
}

function defaultDeps(): ShareDeps {
  const w = typeof window !== "undefined" ? window : undefined;
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  return {
    isNative: () => Boolean((w as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })?.Capacitor?.isNativePlatform?.()),
    nativeShare: (o) => Share.share({ title: o.title, text: o.text, dialogTitle: o.title }),
    webShare: nav && typeof nav.share === "function" ? (o) => nav.share(o) : undefined,
    copy: nav?.clipboard ? (t) => nav.clipboard.writeText(t) : undefined,
  };
}

export async function copyText(text: string, deps: ShareDeps = defaultDeps()): Promise<boolean> {
  try {
    if (deps.copy) {
      await deps.copy(text);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}
