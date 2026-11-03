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

const LOCALE_STORAGE_KEY = "cinexox_locale";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: TranslationDictionary;
  t: (keyPath: string) => string;
  tBoardTitle: (title: string) => string;
  tCriterion: (label: string) => string;
  tSubLabel: (subLabel?: string) => string | undefined;
  tBot: (rankTitle: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (saved === "tr" || saved === "en") {
        setLocaleState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      } else if (typeof navigator !== "undefined") {
        const browserLang = navigator.language.toLowerCase();
        const detected: Locale = browserLang.startsWith("tr") ? "tr" : "en";
        setLocaleState(detected);
        if (typeof document !== "undefined") {
          document.documentElement.lang = detected;
        }
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
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
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
      dict,
      t,
      tBoardTitle: tBoardTitleFn,
      tCriterion: tCriterionFn,
      tSubLabel: tSubLabelFn,
      tBot: tBotFn,
    }),
    [locale, setLocale, dict, t, tBoardTitleFn, tCriterionFn, tSubLabelFn, tBotFn]
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
