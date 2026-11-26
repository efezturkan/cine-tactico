"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { audio } from "@/utils/audio";
import { haptic, setHapticEnabled } from "@/utils/haptics";
import {
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Sliders,
  HelpCircle,
  Shield,
  FileText,
  Info,
  ChevronRight,
  Globe,
} from "lucide-react";
import { useTranslation } from "@/i18n";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  muted: boolean;
  onToggleMute?: () => void;
  onOpenSalonLight: () => void;
  onOpenHowToPlay: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  muted,
  onToggleMute,
  onOpenSalonLight,
  onOpenHowToPlay,
}) => {
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem("cinexox_haptic") !== "0";
    } catch {
      return true;
    }
  });

  const { locale, setLocale, dict } = useTranslation();
  const [volume, setVolumeState] = useState<number>(() => Math.round(audio.getVolume() * 100));
  const [showTerms, setShowTerms] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabledState(next);
    setHapticEnabled(next);
    audio.playSelect();
    if (next) {
      haptic.light();
    }
  };

  return (
    <div role="dialog" aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
              {dict.settings.title}
            </h2>
            <p className="text-xs text-[#8A8F9A] mt-0.5">
              {dict.settings.subtitle}
            </p>
          </div>
          <Button variant="icon" onClick={onClose} title={dict.common.close}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings List */}
        <div className="flex flex-col gap-2 py-4 overflow-y-auto max-h-[60vh]">
          {/* 1. Ses Anahtarı */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                {muted ? <VolumeX className="w-4 h-4 text-[#E5484D]" /> : <Volume2 className="w-4 h-4 text-[#D9A441]" />}
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.soundEffects}</span>
                <span className="text-[11px] text-[#8A8F9A]">{muted ? dict.common.off : dict.common.on}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                audio.playSelect();
                if (onToggleMute) onToggleMute();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                !muted ? "bg-[#D9A441]" : "bg-white/10"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#0B0D12] transition-transform ${
                  !muted ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 1b. Ses düzeyi (ana kanal kazancı) */}
          <div className={`p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 transition-opacity ${muted ? "opacity-40" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#E8E6E1]">{locale === "en" ? "Volume" : "Ses düzeyi"}</span>
              <span className="text-[11px] font-mono text-[#8A8F9A]">{locale === "en" ? `${volume}%` : `%${volume}`}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={volume}
              disabled={muted}
              aria-label={locale === "en" ? "Volume" : "Ses düzeyi"}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolumeState(v);
                audio.setVolume(v / 100);
              }}
              onPointerUp={() => audio.playChessMove()}
              onKeyUp={() => audio.playChessMove()}
              className="w-full h-6 accent-[#D9A441]"
            />
          </div>

          {/* 2. Titreşim Anahtarı */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <Smartphone className="w-4 h-4 text-[#8A8F9A]" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.haptics}</span>
                <span className="text-[11px] text-[#8A8F9A]">{hapticsEnabled ? dict.common.on : dict.common.off}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleHaptics}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                hapticsEnabled ? "bg-[#D9A441]" : "bg-white/10"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#0B0D12] transition-transform ${
                  hapticsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 3. Dil / Language Seçici */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#D9A441]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.language}</span>
                <span className="text-[11px] text-[#8A8F9A]">{dict.settings.languageSub}</span>
              </div>
            </div>
            <div className="inline-flex items-center rounded-lg bg-[#14171d] border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => {
                  if (locale !== "tr") {
                    audio.playSelect();
                    haptic.light();
                    setLocale("tr");
                  }
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  locale === "tr" ? "bg-[#D9A441] text-[#0B0D12] font-semibold shadow-sm" : "text-[#8A8F9A] hover:text-[#E8E6E1]"
                }`}
              >
                Türkçe
              </button>
              <button
                type="button"
                onClick={() => {
                  if (locale !== "en") {
                    audio.playSelect();
                    haptic.light();
                    setLocale("en");
                  }
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  locale === "en" ? "bg-[#D9A441] text-[#0B0D12] font-semibold shadow-sm" : "text-[#8A8F9A] hover:text-[#E8E6E1]"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* 4. Salon Işığı Satırı */}
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              onOpenSalonLight();
            }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition active:scale-[0.99] text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#D9A441]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.salonLight}</span>
                <span className="text-[11px] text-[#8A8F9A]">{dict.settings.salonLightSub}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8A8F9A]" />
          </button>

          {/* 5. Nasıl Oynanır Satırı */}
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              onOpenHowToPlay();
            }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition active:scale-[0.99] text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.howToPlay}</span>
                <span className="text-[11px] text-[#8A8F9A]">{dict.settings.howToPlaySub}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8A8F9A]" />
          </button>

          {/* 6. Gizlilik Politikası */}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audio.playSelect()}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.privacyPolicy}</span>
                <span className="text-[11px] text-[#8A8F9A]">{dict.settings.privacyPolicySub}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8A8F9A]" />
          </a>

          {/* 6. Kullanım Koşulları */}
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setShowTerms(!showTerms);
            }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">
                  {locale === "tr" ? "Kullanım Koşulları" : "Terms of Use"}
                </span>
                <span className="text-[11px] text-[#8A8F9A]">
                  {locale === "tr" ? "Hizmet şartları ve kurallar" : "Service terms and rules"}
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#8A8F9A] transition-transform ${showTerms ? "rotate-90" : ""}`} />
          </button>

          {showTerms && (
            <div className="p-3 rounded-xl bg-[#07080B] border border-white/5 text-[11px] text-[#8A8F9A] leading-relaxed">
              {locale === "tr"
                ? "Crosscut, sinemaseverler için geliştirilmiş taktiksel bir oyundur. Yapılan hamleler ve oyuncu kayıtları yerel veya anonim olarak saklanır. Servis kesintilerinden veya üçüncü taraf veri uyuşmazlıklarından dolayı sorumluluk kabul edilmez."
                : "Crosscut is a tactical game designed for cinephiles. Moves and player records are stored locally or anonymously. No liability is accepted for service interruptions or third-party data discrepancies."}
            </div>
          )}

          {/* 8. Hakkında */}
          <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3.5 h-3.5 text-[#8A8F9A]" />
              <span className="text-[11px] font-bold text-[#E8E6E1]">Crosscut v1.0.0 (35MM)</span>
            </div>
            <p className="text-[11px] text-[#8A8F9A] leading-relaxed">
              {locale === "tr"
                ? "Film verileri açık kaynaklardan derlenmiştir. Crosscut, adı geçen kişi, marka ve yapımlarla bağlantılı veya onaylı değildir."
                : "Film metadata is compiled from open sources. Crosscut is not affiliated with or endorsed by the individuals, brands, or productions mentioned."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10">
          <Button variant="secondary" onClick={onClose} className="w-full">
            {dict.common.close}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
