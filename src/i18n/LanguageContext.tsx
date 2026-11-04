"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { Locale, TranslationDictionary } from "./types";
import { tr } from "./tr";
import { en } from "./en";
import {
  translateBoardTitle,
  translateCriterionLabel,
  translateCriterionSubLabel,
  translateBotRankTitle,
} from "./criteria";

export const LOCALE_STORAGE_KEY = "cinexox_locale";

export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isInitialized: boolean;
  dict: TranslationDictionary;
  t: (keyPath: string) => string;
  tBoardTitle: (title: string) => string;
  tCriterion: (label: string) => string;
  tSubLabel: (subLabel?: string) => string | undefined;
  tBot: (rankTitle: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Cihazın tercih ettiği dilden desteklenen Locale'i çözümler:
 * - Türkçe (`tr`, `tr-TR`, vb.) -> "tr"
 * - İngilizce (`en`, `en-US`, vb.) ve diğer tüm diller (`de-DE`, vb.) -> "en" fallback
 */
export function resolveDeviceLocale(
  browserLanguages?: readonly string[] | string | null
): Locale {
  if (!browserLanguages) return "en";

  const primary = Array.isArray(browserLanguages)
    ? browserLanguages[0]
    : typeof browserLanguages === "string"
    ? browserLanguages
    : undefined;

  if (typeof primary === "string") {
    const clean = primary.trim().toLowerCase();
    if (clean.startsWith("tr")) {
      return "tr";
    }
  }

  // Desteklenmeyen dillerde (de-DE, fr-FR vb.) ve İngilizce'de 'en' fallback
  return "en";
}

/**
 * Dil belirleme önceliği:
 * 1. Kullanıcının daha önce uygulama içinden seçtiği ve kalıcı olarak saklanan dil.
 * 2. Cihazın tercih ettiği dil (navigator.languages / navigator.language).
 * 3. Desteklenmeyen dillerde English ('en') fallback.
 */
export function resolveInitialLocale(
  savedPreference?: string | null,
  browserLanguages?: readonly string[] | string | null
): Locale {
  // 1. Kullanıcı tercihi mevcutsa cihaz diline bakılmaksızın doğrudan kullanılır
  if (savedPreference === "tr" || savedPreference === "en") {
    return savedPreference;
  }

  // 2 & 3. Cihaz dili (TR -> tr, diğer tüm durumlar -> en)
  return resolveDeviceLocale(browserLanguages);
}

/** Noktalı anahtar yolunu ("settings.title") sözlükte çözer; bulunamazsa anahtarı döndürür. */
function lookupKey(dict: TranslationDictionary, keyPath: string): string {
  let current: unknown = dict;
  for (const part of keyPath.split(".")) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return keyPath;
    }
  }
  return typeof current === "string" ? current : keyPath;
}

// SSR ve static export uyumu için güvenli LayoutEffect
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useIsomorphicLayoutEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
      const langs =
        typeof navigator !== "undefined"
          ? navigator.languages && navigator.languages.length > 0
            ? navigator.languages
            : navigator.language
          : null;
      const resolved = resolveInitialLocale(saved, langs);
      setLocaleState(resolved);
      if (typeof document !== "undefined") {
        document.documentElement.lang = resolved;
      }
    } catch {
      // Storage unavailable fallback
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLocale;
      }
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  const dict = useMemo(() => (locale === "en" ? en : tr), [locale]);

  const t = useCallback((keyPath: string): string => lookupKey(dict, keyPath), [dict]);

  const tBoardTitleFn = useCallback((title: string) => translateBoardTitle(title, locale), [locale]);
  const tCriterionFn = useCallback((label: string) => translateCriterionLabel(label, locale), [locale]);
  const tSubLabelFn = useCallback((sub?: string) => translateCriterionSubLabel(sub, locale), [locale]);
  const tBotFn = useCallback((rank: string) => translateBotRankTitle(rank, locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isInitialized,
      dict,
      t,
      tBoardTitle: tBoardTitleFn,
      tCriterion: tCriterionFn,
      tSubLabel: tSubLabelFn,
      tBot: tBotFn,
    }),
    [locale, setLocale, isInitialized, dict, t, tBoardTitleFn, tCriterionFn, tSubLabelFn, tBotFn]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g. in standalone tests)
    return {
      locale: "tr",
      setLocale: () => {},
      isInitialized: true,
      dict: tr,
      t: (keyPath: string) => lookupKey(tr, keyPath),
      tBoardTitle: (title: string) => title,
      tCriterion: (label: string) => label,
      tSubLabel: (sub?: string) => sub,
      tBot: (rank: string) => rank,
    };
  }
  return context;
}
