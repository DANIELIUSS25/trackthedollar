"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Contrast } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      aria-label="Toggle theme"
      title="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      <Contrast className="h-4 w-4" />
    </button>
  );
}
