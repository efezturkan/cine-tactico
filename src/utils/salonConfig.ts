"use client";

export type SalonPresetId = "kadife" | "analog" | "gumus" | "gece_mavisi";
export type SalonGrainOption = "off" | "light" | "film";

export interface SalonPreset {
  id: SalonPresetId;
  /** Ayar ekranında kullanılan ad (TR / EN) */
  label: { tr: string; en: string };
  bg: string;
  beam: string;
  /** Tüm ekranların üstüne binen, salonun ışık rengi (rgba, düşük opaklık) */
  tint: string;
}

export const SALON_PRESETS: Record<SalonPresetId, SalonPreset> = {
  kadife: {
    id: "kadife",
    label: { tr: "Kadife", en: "Velvet" },
    bg: "#0B0D12",
    beam: "#F2D9A0",
    tint: "rgba(150, 30, 45, 0.07)",
  },
  analog: {
    id: "analog",
    label: { tr: "Analog", en: "Analog" },
    bg: "#120E0A",
    beam: "#F0C27A",
    tint: "rgba(235, 160, 70, 0.09)",
  },
  gumus: {
    id: "gumus",
    label: { tr: "Gümüş", en: "Silver" },
    bg: "#0C0E12",
    beam: "#D5DEE8",
    tint: "rgba(190, 205, 225, 0.07)",
  },
  gece_mavisi: {
    id: "gece_mavisi",
    label: { tr: "Gece mavisi", en: "Midnight" },
    bg: "#080D16",
    beam: "#A9CBEA",
    tint: "rgba(40, 95, 180, 0.12)",
  },
};

export interface SalonConfig {
  preset: SalonPresetId;
  dimness: number;    // 0 - 60, default 25
  projection: number; // 0 - 100, default 65 (beam opacity 0 - 0.14)
  grain: SalonGrainOption; // "off" | "light" | "film", default "light"
}

export const DEFAULT_SALON_CONFIG: SalonConfig = {
  preset: "kadife",
  dimness: 25,
  projection: 65,
  grain: "light",
};

export const GRAIN_OPACITY: Record<SalonGrainOption, number> = {
  off: 0,
  light: 0.028,
  film: 0.075,
};

const STORAGE_KEY = "cinexox_salon_config";

export function sanitizeSalonConfig(parsed: unknown): SalonConfig {
  const p = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  const preset = typeof p.preset === "string" && p.preset in SALON_PRESETS ? (p.preset as SalonPresetId) : DEFAULT_SALON_CONFIG.preset;
  const num = (v: unknown, min: number, max: number, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : fallback;
  const grain: SalonGrainOption = p.grain === "off" || p.grain === "film" ? p.grain : "light";
  return {
    preset,
    dimness: num(p.dimness, 0, 60, DEFAULT_SALON_CONFIG.dimness),
    projection: num(p.projection, 0, 100, DEFAULT_SALON_CONFIG.projection),
    grain,
  };
}

export function getSavedSalonConfig(): SalonConfig {
  if (typeof window === "undefined") return DEFAULT_SALON_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SALON_CONFIG;
    return sanitizeSalonConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_SALON_CONFIG;
  }
}

export function saveSalonConfig(cfg: SalonConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // Depolama kapalıysa ayar yalnızca bu oturumda geçerli olur
  }
}

/**
 * Loşluk iki bileşenden oluşur: tüm ekranı hafifçe kısan düz katman ve kenarları
 * kıran vinyet. Okunabilirlik için üst sınırlar sabittir (%60 loşlukta bile metin okunur).
 */
export function computeSalonVars(cfg: SalonConfig) {
  const p = SALON_PRESETS[cfg.preset] || SALON_PRESETS.kadife;
  const dim = cfg.dimness / 100;
  return {
    bg: p.bg,
    beam: p.beam,
    tint: p.tint,
    beamOpacity: ((cfg.projection / 100) * 0.14).toFixed(4),
    dimFlat: (dim * 0.45).toFixed(4),
    dimVignette: Math.min(0.75, dim * 1.25).toFixed(4),
    grainOpacity: String(GRAIN_OPACITY[cfg.grain]),
  };
}

export const SALON_EVENT = "cinexox:salon-change";

export function applySalonConfigToDom(cfg: SalonConfig) {
  if (typeof window === "undefined" || !document?.documentElement) return;
  const v = computeSalonVars(cfg);
  const root = document.documentElement;
  root.setAttribute("data-salon", cfg.preset);
  root.style.setProperty("--salon-bg", v.bg);
  root.style.setProperty("--salon-beam", v.beam);
  root.style.setProperty("--salon-tint", v.tint);
  root.style.setProperty("--salon-beam-opacity", v.beamOpacity);
  root.style.setProperty("--salon-dim-flat", v.dimFlat);
  root.style.setProperty("--salon-dim-vignette", v.dimVignette);
  root.style.setProperty("--salon-grain-opacity", v.grainOpacity);
}
