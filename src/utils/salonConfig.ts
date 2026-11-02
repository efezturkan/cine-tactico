"use client";

export type SalonPresetId = "kadife" | "analog" | "gumus" | "gece_mavisi";
export type SalonGrainOption = "off" | "light";

export interface SalonPreset {
  id: SalonPresetId;
  label: string;
  bg: string;
  beam: string;
}

export const SALON_PRESETS: Record<SalonPresetId, SalonPreset> = {
  kadife: {
    id: "kadife",
    label: "Kadife",
    bg: "#0B0D12",
    beam: "#F2D9A0",
  },
  analog: {
    id: "analog",
    label: "Analog",
    bg: "#120E0A",
    beam: "#F0C27A",
  },
  gumus: {
    id: "gumus",
    label: "Gümüş",
    bg: "#0C0E12",
    beam: "#D5DEE8",
  },
  gece_mavisi: {
    id: "gece_mavisi",
    label: "Gece mavisi",
    bg: "#080D16",
    beam: "#A9CBEA",
  },
};

export interface SalonConfig {
  preset: SalonPresetId;
  dimness: number;    // 0 - 60, default 25
  projection: number; // 0 - 100, default 65 (beam opacity 0 - 0.14)
  grain: SalonGrainOption; // "off" | "light", default "light"
}

export const DEFAULT_SALON_CONFIG: SalonConfig = {
  preset: "kadife",
  dimness: 25,
  projection: 65,
  grain: "light",
};

const STORAGE_KEY = "cinexox_salon_config";

export function getSavedSalonConfig(): SalonConfig {
  if (typeof window === "undefined") return DEFAULT_SALON_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SALON_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      preset: parsed.preset in SALON_PRESETS ? parsed.preset : DEFAULT_SALON_CONFIG.preset,
      dimness: typeof parsed.dimness === "number" ? Math.max(0, Math.min(60, parsed.dimness)) : DEFAULT_SALON_CONFIG.dimness,
      projection: typeof parsed.projection === "number" ? Math.max(0, Math.min(100, parsed.projection)) : DEFAULT_SALON_CONFIG.projection,
      grain: parsed.grain === "off" ? "off" : "light",
    };
  } catch {
    return DEFAULT_SALON_CONFIG;
  }
}

export function saveSalonConfig(cfg: SalonConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
}

export function applySalonConfigToDom(cfg: SalonConfig) {
  if (typeof window === "undefined" || !document?.documentElement) return;
  const p = SALON_PRESETS[cfg.preset] || SALON_PRESETS.kadife;
  const root = document.documentElement;

  root.setAttribute("data-salon", p.id);
  root.style.setProperty("--salon-bg", p.bg);
  root.style.setProperty("--salon-beam", p.beam);
  root.style.setProperty("--salon-beam-opacity", `${((cfg.projection / 100) * 0.14).toFixed(4)}`);
  root.style.setProperty("--salon-dim", `${(cfg.dimness / 100).toFixed(4)}`);
  root.style.setProperty("--salon-grain-opacity", cfg.grain === "light" ? "0.028" : "0");
}
