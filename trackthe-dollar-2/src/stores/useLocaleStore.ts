"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "lt", label: "Lietuvių", flag: "🇱🇹" },
] as const;

interface LocaleState {
  locale: string;
  setLocale: (locale: string) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "ttd-locale",
    }
  )
);
