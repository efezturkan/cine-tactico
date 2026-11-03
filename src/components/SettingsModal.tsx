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
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { ASSET_MANIFEST } from "@/data/assets";

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
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [showLicenses, setShowLicenses] = useState<boolean>(false);

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
    <div
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
                <span className="text-[10px] text-[#8A8F9A]">{muted ? dict.common.off : dict.common.on}</span>
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

          {/* 2. Titreşim Anahtarı */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <Smartphone className="w-4 h-4 text-[#8A8F9A]" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.haptics}</span>
                <span className="text-[10px] text-[#8A8F9A]">{hapticsEnabled ? dict.common.on : dict.common.off}</span>
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
                <span className="text-[10px] text-[#8A8F9A]">{dict.settings.languageSub}</span>
              </div>
            </div>
            <div className="inline-flex items-center rounded-lg bg-[#14171d] border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  haptic.light();
                  setLocale("tr");
                }}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors ${
                  locale === "tr" ? "bg-[#D9A441] text-[#0B0D12]" : "text-[#8A8F9A] hover:text-[#E8E6E1]"
                }`}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  haptic.light();
                  setLocale("en");
                }}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors ${
                  locale === "en" ? "bg-[#D9A441] text-[#0B0D12]" : "text-[#8A8F9A] hover:text-[#E8E6E1]"
                }`}
              >
                EN
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
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition-all active:scale-[0.99] text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#D9A441]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.salonLight}</span>
                <span className="text-[10px] text-[#8A8F9A]">{dict.settings.salonLightSub}</span>
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
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition-all active:scale-[0.99] text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.howToPlay}</span>
                <span className="text-[10px] text-[#8A8F9A]">{dict.settings.howToPlaySub}</span>
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
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">{dict.settings.privacyPolicy}</span>
                <span className="text-[10px] text-[#8A8F9A]">{dict.settings.privacyPolicySub}</span>
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
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#8A8F9A]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">
                  {locale === "tr" ? "Kullanım Koşulları" : "Terms of Use"}
                </span>
                <span className="text-[10px] text-[#8A8F9A]">
                  {locale === "tr" ? "Hizmet şartları ve kurallar" : "Service terms and rules"}
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#8A8F9A] transition-transform ${showTerms ? "rotate-90" : ""}`} />
          </button>

          {showTerms && (
            <div className="p-3 rounded-xl bg-[#07080B] border border-white/5 text-[11px] text-[#8A8F9A] leading-relaxed">
              {locale === "tr"
                ? "CineXOX, sinemaseverler için geliştirilmiş taktiksel bir oyundur. Yapılan hamleler ve oyuncu kayıtları yerel veya anonim olarak saklanır. Servis kesintilerinden veya üçüncü taraf veri uyuşmazlıklarından dolayı sorumluluk kabul edilmez."
                : "CineXOX is a tactical game designed for cinephiles. Moves and player records are stored locally or anonymously. No liability is accepted for service interruptions or third-party data discrepancies."}
            </div>
          )}

          {/* 7. Lisanslar ve Görsel Atıfları (Creative Commons) */}
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setShowLicenses(!showLicenses);
            }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 hover:border-white/15 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#181B22] flex items-center justify-center text-[#D9A441]">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#E8E6E1] block">
                  {locale === "tr" ? "Lisanslar & Görsel Atıfları" : "Licenses & Attributions"}
                </span>
                <span className="text-[10px] text-[#8A8F9A]">
                  Wikimedia Commons (CC BY / CC BY-SA)
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#8A8F9A] transition-transform ${showLicenses ? "rotate-90" : ""}`} />
          </button>

          {showLicenses && (
            <div className="p-3 rounded-xl bg-[#07080B] border border-white/5 text-[10px] text-[#8A8F9A] space-y-2 max-h-56 overflow-y-auto">
              <p className="text-[11px] text-[#E8E6E1] font-semibold">
                {locale === "tr" ? "Açık Lisanslı Portreler (Creative Commons):" : "Open Licensed Portraits (Creative Commons):"}
              </p>
              <p className="text-[9px] text-[#8A8F9A]">
                {locale === "tr"
                  ? "Aşağıdaki 11 portre görseli Wikimedia Commons üzerinden alınmış, 160×160 piksel boyutuna kırpılmış ve yeniden boyutlandırılmıştır. Eser sahipleri CineXOX'u onaylamaz veya desteklemez:"
                  : "The following 11 portrait images are sourced from Wikimedia Commons, cropped and resized to 160×160 pixels. Licensors do not endorse CineXOX:"}
              </p>
              <div className="space-y-2 pt-1">
                {ASSET_MANIFEST.map((item) => (
                  <div key={item.id} className="border-b border-white/5 pb-1.5 space-y-0.5">
                    <span className="text-[#E8E6E1] font-medium block">
                      {item.title ?? item.id}
                    </span>
                    <span className="text-[#8A8F9A] text-[9px] block">
                      {locale === "tr" ? "Yazar / Atıf" : "Author / Attribution"}: {item.author} ({item.attribution})
                    </span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px]">
                      <a
                        href={item.sourcePageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D9A441] underline hover:opacity-80"
                      >
                        {locale === "tr" ? "Kaynak (Wikimedia Commons)" : "Source (Wikimedia Commons)"}
                      </a>
                      <span>·</span>
                      {item.licenseUrl ? (
                        <a
                          href={item.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D9A441] underline hover:opacity-80"
                        >
                          {locale === "tr" ? "Lisans" : "License"}: {item.license}
                        </a>
                      ) : (
                        <span className="text-[#D9A441]">
                          {locale === "tr" ? "Lisans" : "License"}: {item.license}
                        </span>
                      )}
                    </div>
                    {item.modified && (
                      <span className="text-[#8A8F9A]/80 text-[9px] block italic">
                        {locale === "tr"
                          ? "Değişiklik: Uygulama içi gösterim için 160×160 piksel olarak kırpıldı ve yeniden boyutlandırıldı."
                          : "Changes: Cropped and resized to 160×160 pixels for in-app display."}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Hakkında */}
          <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3.5 h-3.5 text-[#8A8F9A]" />
              <span className="text-[11px] font-bold text-[#E8E6E1]">CineXOX v1.0.0 (35MM)</span>
            </div>
            <p className="text-[10px] text-[#8A8F9A] leading-relaxed">
              {locale === "tr"
                ? "Film verileri açık kaynaklardan derlenmiştir. CineXOX, adı geçen kişi, marka ve yapımlarla bağlantılı veya onaylı değildir."
                : "Film metadata is compiled from open sources. CineXOX is not affiliated with or endorsed by the individuals, brands, or productions mentioned."}
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
