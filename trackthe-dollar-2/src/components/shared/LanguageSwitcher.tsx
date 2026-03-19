"use client";

import { useState, useRef, useEffect } from "react";
import { Languages } from "lucide-react";
import { useLocaleStore, SUPPORTED_LOCALES } from "@/stores/useLocaleStore";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!mounted) return null;

  const current = SUPPORTED_LOCALES.find((l) => l.code === locale) ?? SUPPORTED_LOCALES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch language"
        title={`Language: ${current.label}`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <Languages className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-white/10 bg-[#111] shadow-2xl p-1.5 animate-fade-in">
          {SUPPORTED_LOCALES.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-green-500/10 text-green-400"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
