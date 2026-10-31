import { supabase, isSupabaseConfigured } from "./client";
import { User, Session } from "@supabase/supabase-js";
import { LeaderboardProfileRecord } from "./types";

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: LeaderboardProfileRecord | null;
  isAnonymous: boolean;
  error?: string;
}

/**
 * Mevcut Supabase oturumunu getirir veya otomatik anonim oturum başlatır.
 * Hem Web (localStorage) hem de Mobil (Capacitor) ortamında kalıcıdır.
 */
export async function ensureAnonymousSession(): Promise<AuthState> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      user: null,
      session: null,
      profile: null,
      isAnonymous: true,
      error: "Supabase yapılandırılmamış.",
    };
  }

  try {
    // 1. Mevcut aktif oturumu kontrol et
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;

    if (sessionData?.session?.user) {
      const user = sessionData.session.user;
      const profile = await fetchProfileByUserId(user.id);
      return {
        user,
        session: sessionData.session,
        profile,
        isAnonymous: Boolean(user.is_anonymous),
      };
    }

    // 2. Aktif oturum yoksa yeni anonim oturum başlat
    const { data: signInData, error: signInErr } = await supabase.auth.signInAnonymously();
    if (signInErr) {
      // Supabase Dashboard'da henüz Anonymous Auth açılmamışsa bilgilendirici hata
      if (signInErr.message?.includes("disabled") || signInErr.status === 422) {
        console.warn(
          "[Cine-XOX Auth] Supabase Dashboard üzerinde 'Anonymous Sign-ins' henüz aktif edilmemiş. (Authentication -> Providers -> Anonymous)"
        );
      }
      throw signInErr;
    }

    if (signInData.user && signInData.session) {
      const user = signInData.user;
      const profile = await fetchProfileByUserId(user.id);
      return {
        user,
        session: signInData.session,
        profile,
        isAnonymous: true,
      };
    }

    return {
      user: null,
      session: null,
      profile: null,
      isAnonymous: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Anonim oturum açılamadı.";
    return {
      user: null,
      session: null,
      profile: null,
      isAnonymous: true,
      error: message,
    };
  }
}

/**
 * Veritabanından kullanıcı profili çeker
 */
export async function fetchProfileByUserId(userId: string): Promise<LeaderboardProfileRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as LeaderboardProfileRecord | null;
  } catch {
    return null;
  }
}

/**
 * Kullanıcı adını güvenli RPC fonksiyonuyla benzersizlik kontrolü yaparak günceller
 */
export async function updateUsernameWithUniqueness(
  newUsername: string
): Promise<{ success: boolean; username?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  try {
    const { data, error } = await supabase.rpc("change_username", {
      new_username: newUsername,
    });

    if (error) throw error;

    if (data && typeof data === "object") {
      const res = data as { success: boolean; username?: string; error?: string };
      return res;
    }

    return { success: true, username: newUsername };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kullanıcı adı güncellenemedi.";
    return { success: false, error: msg };
  }
}

/**
 * Geleceğe hazırlık: Anonim hesabı e-posta/şifre ile kalıcı hesaba bağlama (Account Linking)
 */
export async function linkAnonymousAccountToEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Hesap bağlama başarısız oldu.";
    return { success: false, error: msg };
  }
}
