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
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { useTranslation } from "@/i18n";
import { Eye, SplitSquareHorizontal } from "lucide-react";

interface SalonLightSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type SalonTab = "dimness" | "projection" | "grain";

/**
 * Salon Işığı canlı önizleme (customizer) modu.
 * Tüm ekran önizlemedir; ayarlar altta ince bir dock'ta durur.
 *  - Ekrana dokun: ayarları gizle / göster (tam görüntüyü gör)
 *  - Karşılaştır'a basılı tut: ilk hâli gör, bırakınca ayarlarına dön
 *  - Vazgeç ilk hâle döner, Tamam kaydeder
 */
export const SalonLightSheet: React.FC<SalonLightSheetProps> = ({ isOpen, onClose }) => {
  const { dict, locale } = useTranslation();
  const [config, setConfig] = useState<SalonConfig>(DEFAULT_SALON_CONFIG);
  const [tab, setTab] = useState<SalonTab>("dimness");
  const [hidden, setHidden] = useState<boolean>(false);
  const [comparing, setComparing] = useState<boolean>(false);
  const initialConfigRef = useRef<SalonConfig>(DEFAULT_SALON_CONFIG);
  const configRef = useRef<SalonConfig>(DEFAULT_SALON_CONFIG);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedSalonConfig();
      setConfig(saved);
      configRef.current = saved;
      initialConfigRef.current = saved;
      setTab("dimness");
      setHidden(false);
      setComparing(false);
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

  const startCompare = () => {
    haptic.light();
    setComparing(true);
    applySalonConfigToDom(initialConfigRef.current);
  };
  const stopCompare = () => {
    if (!comparing) return;
    setComparing(false);
    applySalonConfigToDom(configRef.current);
  };

  const tabs: { id: SalonTab; label: string }[] = [
    { id: "dimness", label: dict.salon.dim },
    { id: "projection", label: dict.salon.projection },
    { id: "grain", label: dict.salon.grain },
  ];

  const grainOptions: { id: SalonGrainOption; label: string }[] = [
    { id: "off", label: dict.salon.grainOff },
    { id: "light", label: dict.salon.grainLight },
    { id: "film", label: dict.salon.grainFilm },
  ];

  const compareButton = (
    <button
      type="button"
      onPointerDown={startCompare}
      onPointerUp={stopCompare}
      onPointerLeave={stopCompare}
      onPointerCancel={stopCompare}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={dict.salon.compareHint}
      title={dict.salon.compareHint}
      className={`min-h-[40px] px-3 rounded-full border flex items-center gap-1.5 text-[11px] font-bold touch-none transition-colors ${
        comparing
          ? "bg-[#D9A441] text-[#0B0D12] border-[#D9A441]"
          : "bg-[#181B22]/90 text-[#E8E6E1] border-white/15"
      }`}
    >
      <SplitSquareHorizontal className="w-3.5 h-3.5" />
      {dict.salon.compare}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 select-none">
      {/* Önizleme yüzeyi: dokununca ayarlar gizlenir / gelir. Altındaki ekrana tıklama geçmez. */}
      <div
        className="absolute inset-0"
        onClick={() => {
          haptic.light();
          setHidden((h) => !h);
        }}
        aria-hidden="true"
      />

      {hidden ? (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-[calc(5rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setHidden(false)}
            className="min-h-[40px] px-4 rounded-full bg-[#181B22]/90 border border-[#D9A441]/50 text-[#D9A441] text-[11px] font-bold flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            {dict.salon.backToControls}
          </button>
          {compareButton}
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 w-full max-w-lg mx-auto bg-[#10131A]/92 backdrop-blur-md border-t border-x border-white/10 rounded-t-[20px] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2.5 shadow-2xl animate-in slide-in-from-bottom-3 duration-150">
          {/* Başlık + karşılaştır */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-serif text-base font-bold text-[#E8E6E1] leading-tight">{dict.salon.title}</h2>
              <p className="text-[10px] text-[#8A8F9A] leading-tight truncate">{dict.salon.tapHint}</p>
            </div>
            {compareButton}
          </div>

          {/* Hazır ayarlar */}
          <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label={dict.salon.preset}>
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
                  className={`min-h-[44px] rounded-xl border flex items-center justify-center gap-1 px-0.5 transition-all active:scale-95 ${
                    isSelected
                      ? "bg-[#181B22] border-[#D9A441] text-[#D9A441]"
                      : "bg-[#0B0D12]/80 border-white/10 text-[#8A8F9A]"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0"
                    style={{ background: `radial-gradient(circle at 35% 30%, ${preset.beam}, ${preset.bg} 85%)` }}
                  />
                  <span className="text-[10px] font-bold leading-none truncate">
                    {preset.label[locale === "en" ? "en" : "tr"]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tek seferde tek ayar: sekme + geniş kaydırıcı */}
          <div className="flex rounded-lg bg-[#0B0D12]/80 p-0.5 border border-white/10" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  audio.playSelect();
                  setTab(t.id);
                }}
                className={`flex-1 min-h-[34px] rounded-md text-[11px] font-bold transition-all ${
                  tab === t.id ? "bg-[#D9A441] text-[#0B0D12]" : "text-[#8A8F9A]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "grain" ? (
            <div className="flex rounded-lg bg-[#181B22] p-0.5 border border-white/10">
              {grainOptions.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    audio.playSelect();
                    update({ grain: g.id });
                  }}
                  className={`flex-1 min-h-[40px] rounded-md text-xs font-bold transition-all ${
                    config.grain === g.id ? "bg-[#D9A441] text-[#0B0D12]" : "text-[#8A8F9A]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 min-h-[40px]">
              <input
                type="range"
                min={0}
                max={tab === "dimness" ? 60 : 100}
                step={1}
                value={config[tab]}
                aria-label={tab === "dimness" ? dict.salon.dim : dict.salon.projection}
                onChange={(e) => update({ [tab]: Number(e.target.value) } as Partial<SalonConfig>)}
                className="flex-1 h-8 accent-[#D9A441] cursor-pointer"
              />
              <span className="w-12 text-right text-sm font-mono font-bold text-[#D9A441]">%{config[tab]}</span>
            </div>
          )}

          {/* Aksiyonlar */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] rounded-xl bg-[#181B22] border border-white/10 text-[#8A8F9A] text-xs font-bold uppercase tracking-wide active:scale-95"
            >
              {dict.salon.reset}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-[44px] rounded-xl bg-[#181B22] border border-white/10 text-[#E8E6E1] text-xs font-bold uppercase tracking-wide active:scale-95"
            >
              {dict.salon.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="min-h-[44px] rounded-xl bg-[#D9A441] text-[#0B0D12] text-xs font-bold uppercase tracking-wide active:scale-95"
            >
              {dict.salon.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonLightSheet;
