"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n/useT";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { SharePopover } from "@/components/shared/SharePopover";
import { MobileLandingNav } from "@/components/shared/MobileLandingNav";

export function LandingNav() {
  const t = useT();
  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="#features" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav_features")}</Link>
        <Link href="#flows" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav_flows")}</Link>
        <Link href="#research" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav_research")}</Link>
        <Link href="/blog" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Blog</Link>
        <Link href="/methodology" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav_methodology")}</Link>
      </nav>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <Link
          href="/upgrade"
          className="hidden rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 sm:block"
        >
          {t("nav_go_pro")} ✦
        </Link>
        <SharePopover />
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4 sm:py-2"
        >
          {t("nav_dashboard")}
        </Link>
        <MobileLandingNav />
      </div>
    </>
  );
}
