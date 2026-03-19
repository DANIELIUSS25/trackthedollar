"use client";

import { useLocaleStore } from "@/stores/useLocaleStore";
import { t, type TranslationKey } from "@/lib/i18n/translations";

export function useT() {
  const { locale } = useLocaleStore();
  return (key: TranslationKey) => t(locale, key);
}
