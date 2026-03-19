"use client";

import { useState, useEffect, useRef } from "react";
import { useLocaleStore } from "@/stores/useLocaleStore";

interface TProps {
  children: string;
}

function getCacheKey(locale: string, text: string) {
  return `ttd_tr:${locale}:${text.slice(0, 80)}`;
}

export function T({ children }: TProps) {
  const { locale } = useLocaleStore();
  const [text, setText] = useState(children);
  const prevLocale = useRef(locale);

  useEffect(() => {
    if (locale === "en") {
      setText(children);
      return;
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(getCacheKey(locale, children));
      if (cached) {
        setText(cached);
        prevLocale.current = locale;
        return;
      }
    } catch {}

    // Fetch translation
    fetch("/api/v1/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: children, targetLocale: locale }),
    })
      .then((r) => r.json())
      .then((data: { translatedText: string }) => {
        setText(data.translatedText);
        try {
          localStorage.setItem(getCacheKey(locale, children), data.translatedText);
        } catch {}
      })
      .catch(() => setText(children));
  }, [locale, children]);

  return <>{text}</>;
}
