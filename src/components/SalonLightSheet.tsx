"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SalonConfig,
  SalonPresetId,
  SalonGrainOption,
  SALON_PRESETS,
  DEFAULT_SALON_CONFIG,
  getSavedSalonConfig,
  saveSalonConfig,
  applySalonConfigToDom,
} from "@/utils/salonConfig";
import { Button } from "@/components/ui/Button";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { useTranslation } from "@/i18n";
import { X } from "lucide-react";

interface SalonLightSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Salon Işığı ayar sayfası. Arka plan karartılmaz ve sayfa kısa tutulur:
 * ayar değiştikçe Gişe ekranı canlı olarak değişir. Vazgeç / X ilk hâle döner,
 * Tamam kaydeder.
 */
export const SalonLightSheet: React.FC<SalonLightSheetProps> = ({ isOpen, onClose }) => {
  const { dict, locale } = useTranslation();
  const [config, setConfig] = useState<SalonConfig>(DEFAULT_SALON_CONFIG);
  const initialConfigRef = useRef<SalonConfig>(DEFAULT_SALON_CONFIG);
  const configRef = useRef<SalonConfig>(DEFAULT_SALON_CONFIG);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedSalonConfig();
      setConfig(saved);
      configRef.current = saved;
      initialConfigRef.current = saved;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (patch: Partial<SalonConfig>) => {
    const next = { ...configRef.current, ...patch };
    configRef.current = next;
    setConfig(next);
    applySalonConfigToDom(next);
  };

  const handleConfirm = () => {
    audio.playSelect();
    saveSalonConfig(configRef.current);
    onClose();
  };

  const handleCancel = () => {
    audio.playSelect();
    applySalonConfigToDom(initialConfigRef.current);
    onClose();
  };

  const handleReset = () => {
    audio.playSelect();
    haptic.light();
    configRef.current = DEFAULT_SALON_CONFIG;
    setConfig(DEFAULT_SALON_CONFIG);
    applySalonConfigToDom(DEFAULT_SALON_CONFIG);
  };

  const grainOptions: { id: SalonGrainOption; label: string }[] = [
    { id: "off", label: dict.salon.grainOff },
    { id: "light", label: dict.salon.grainLight },
    { id: "film", label: dict.salon.grainFilm },
  ];

  const sliders = [
    { key: "dimness" as const, label: dict.salon.dim, hint: dict.salon.dimHint, max: 60 },
    { key: "projection" as const, label: dict.salon.projection, hint: dict.salon.projectionHint, max: 100 },
  ];

  return (
    // Sayfa dışına dokunmak ayarı kaydeder; ekran karartılmadığı için önizleme açık kalır.
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleConfirm();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end select-none"
    >
      <div className="w-full max-w-lg mx-auto bg-[#14171D]/95 backdrop-blur-md border-t border-x border-white/10 rounded-t-[24px] px-4 pt-2.5 pb-4 flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2 shrink-0" />

        <div className="flex items-start justify-between pb-2 border-b border-white/10">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold text-[#E8E6E1]">{dict.salon.title}</h2>
            <p className="text-[11px] text-[#8A8F9A] mt-0.5 leading-snug">{dict.salon.sub}</p>
          </div>
          <Button variant="icon" onClick={handleCancel} title={dict.salon.cancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-2 pt-2.5">
          {/* Hazır ayarlar */}
          <div>
            <span className="text-[10px] font-bold text-[#8A8F9A] tracking-wider block mb-1.5">
              {dict.salon.preset}
            </span>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={dict.salon.preset}>
              {(Object.keys(SALON_PRESETS) as SalonPresetId[]).map((pid) => {
                const preset = SALON_PRESETS[pid];
                const isSelected = config.preset === pid;
                return (
                  <button
                    key={pid}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      audio.playSelect();
                      haptic.light();
                      update({ preset: pid });
                    }}
                    className={`min-h-[46px] px-1.5 py-1.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? "bg-[#181B22] border-[#D9A441] text-[#D9A441]"
                        : "bg-[#0B0D12] border-white/10 text-[#8A8F9A] hover:text-[#E8E6E1]"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/25"
                      style={{ background: `radial-gradient(circle at 35% 30%, ${preset.beam}, ${preset.bg} 85%)` }}
                    />
                    <span className="text-[10px] font-bold tracking-tight leading-none">
                      {preset.label[locale === "en" ? "en" : "tr"]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kaydırıcılar */}
          {sliders.map((s) => (
            <div key={s.key} className="px-3 py-2 rounded-xl bg-[#0B0D12] border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-xs font-medium text-[#E8E6E1]">{s.label}</span>
                  <span className="text-[10px] text-[#8A8F9A] truncate">{s.hint}</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#D9A441]">%{config[s.key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={s.max}
                step={1}
                value={config[s.key]}
                aria-label={s.label}
                onChange={(e) => update({ [s.key]: Number(e.target.value) } as Partial<SalonConfig>)}
                className="w-full h-7 accent-[#D9A441] cursor-pointer"
              />
            </div>
          ))}

          {/* Gren */}
          <div className="px-3 py-2 rounded-xl bg-[#0B0D12] border border-white/5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-medium text-[#E8E6E1] block">{dict.salon.grain}</span>
              <span className="text-[10px] text-[#8A8F9A]">{dict.salon.grainHint}</span>
            </div>
            <div className="flex rounded-lg bg-[#181B22] p-0.5 border border-white/10 shrink-0">
              {grainOptions.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    audio.playSelect();
                    update({ grain: g.id });
                  }}
                  className={`min-h-[36px] px-3 rounded-md text-xs font-bold transition-all ${
                    config.grain === g.id ? "bg-[#D9A441] text-[#0B0D12]" : "text-[#8A8F9A] hover:text-[#E8E6E1]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-white/10">
          <Button variant="secondary" onClick={handleReset} className="flex-1">
            {dict.salon.reset}
          </Button>
          <Button variant="secondary" onClick={handleCancel} className="flex-1">
            {dict.salon.cancel}
          </Button>
          <Button variant="primary" onClick={handleConfirm} className="flex-1">
            {dict.salon.done}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalonLightSheet;
