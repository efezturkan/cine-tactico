import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { FLAGS } from "@/config/flags";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// v1.0: SHOW_ONLINE_ROOM kapalıyken ağ, hesap ve veri toplama tamamen devre dışıdır.
export const isSupabaseConfigured = Boolean(
  FLAGS.SHOW_ONLINE_ROOM &&
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey !== "your-anon-key"
);

// Güvenli istemci: Anahtarlar eksikse sahte/boş istemci ile çökme önlenir
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
