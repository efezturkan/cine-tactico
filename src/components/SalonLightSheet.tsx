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
import { X } from "lucide-react";

interface SalonLightSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalonLightSheet: React.FC<SalonLightSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<SalonConfig>(DEFAULT_SALON_CONFIG);
  const initialConfigRef = useRef<SalonConfig>(DEFAULT_SALON_CONFIG);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedSalonConfig();
      setConfig(saved);
      initialConfigRef.current = saved;
      applySalonConfigToDom(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (id: SalonPresetId) => {
    audio.playSelect();
    const updated = { ...config, preset: id };
    setConfig(updated);
    applySalonConfigToDom(updated);
  };

  const handleDimnessChange = (val: number) => {
    const updated = { ...config, dimness: val };
    setConfig(updated);
    // Direct CSS update without jank
    document.documentElement.style.setProperty("--salon-dim", `${(val / 100).toFixed(4)}`);
  };

  const handleProjectionChange = (val: number) => {
    const updated = { ...config, projection: val };
    setConfig(updated);
    // Direct CSS update
    document.documentElement.style.setProperty(
      "--salon-beam-opacity",
      `${((val / 100) * 0.14).toFixed(4)}`
    );
  };

  const handleGrainChange = (g: SalonGrainOption) => {
    audio.playSelect();
    const updated = { ...config, grain: g };
    setConfig(updated);
    document.documentElement.style.setProperty(
      "--salon-grain-opacity",
      g === "light" ? "0.028" : "0"
    );
  };

  const handleReset = () => {
    audio.playSelect();
    setConfig(DEFAULT_SALON_CONFIG);
    applySalonConfigToDom(DEFAULT_SALON_CONFIG);
  };

  const handleConfirm = () => {
    audio.playSelect();
    saveSalonConfig(config);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleConfirm();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 select-none animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] p-5 flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#E8E6E1]">
              Salon Işığı
            </h2>
            <p className="text-xs text-[#8A8F9A] mt-0.5">
              Projeksiyon odası ve salon atmosferi ayarları.
            </p>
          </div>
          <Button variant="icon" onClick={handleConfirm} title="Kapat">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 py-4 overflow-y-auto max-h-[60vh]">
          {/* 1. Hazır Ayarlar */}
          <div>
            <span className="text-xs font-bold text-[#8A8F9A] tracking-wide block mb-2">
              HAZIR AYAR
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(SALON_PRESETS) as SalonPresetId[]).map((pid) => {
                const preset = SALON_PRESETS[pid];
                const isSelected = config.preset === pid;
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => handlePresetSelect(pid)}
                    className={`min-h-[44px] px-2 py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                      isSelected
                        ? "bg-[#181B22] border-[#D9A441] text-[#D9A441]"
                        : "bg-[#0B0D12] border-white/10 text-[#8A8F9A] hover:text-[#E8E6E1]"
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.beam }}
                    />
                    <span className="text-[11px] font-bold tracking-tight">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Loşluk (0 - 60) */}
          <div className="p-3 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[#E8E6E1]">Loşluk</span>
              <span className="text-xs font-mono font-bold text-[#D9A441]">
                %{config.dimness}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={config.dimness}
              onChange={(e) => handleDimnessChange(Number(e.target.value))}
              className="w-full accent-[#D9A441] cursor-pointer"
            />
          </div>

          {/* 3. Projeksiyon (0 - 100) */}
          <div className="p-3 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[#E8E6E1]">Projeksiyon</span>
              <span className="text-xs font-mono font-bold text-[#D9A441]">
                %{config.projection}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.projection}
              onChange={(e) => handleProjectionChange(Number(e.target.value))}
              className="w-full accent-[#D9A441] cursor-pointer"
            />
          </div>

          {/* 4. Gren (Kapalı / Hafif) */}
          <div className="p-3 rounded-xl bg-[#0B0D12] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#E8E6E1] block">Gren</span>
              <span className="text-[10px] text-[#8A8F9A]">35mm film dokusu</span>
            </div>
            <div className="flex rounded-lg bg-[#181B22] p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => handleGrainChange("off")}
                className={`min-h-[36px] px-3 rounded-md text-xs font-bold transition-all ${
                  config.grain === "off"
                    ? "bg-[#D9A441] text-[#0B0D12]"
                    : "text-[#8A8F9A] hover:text-[#E8E6E1]"
                }`}
              >
                Kapalı
              </button>
              <button
                type="button"
                onClick={() => handleGrainChange("light")}
                className={`min-h-[36px] px-3 rounded-md text-xs font-bold transition-all ${
                  config.grain === "light"
                    ? "bg-[#D9A441] text-[#0B0D12]"
                    : "text-[#8A8F9A] hover:text-[#E8E6E1]"
                }`}
              >
                Hafif
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          <Button variant="secondary" onClick={handleReset} className="flex-1">
            Sıfırla
          </Button>
          <Button variant="primary" onClick={handleConfirm} className="flex-1">
            Tamam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalonLightSheet;
