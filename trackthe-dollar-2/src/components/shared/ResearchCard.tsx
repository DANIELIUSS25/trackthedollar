"use client";

import { cn } from "@/lib/utils/cn";
import { Landmark, Droplets, Receipt } from "lucide-react";

interface ResearchItem {
  id: string;
  title: string;
  summary: string;
  category: "fiscal" | "liquidity" | "debt";
  date: string;
  metric: string;
}

interface ResearchCardProps {
  items: ResearchItem[];
  className?: string;
}

const CATEGORY_CONFIG = {
  fiscal: { icon: Receipt, color: "text-positive", bg: "bg-positive/10", label: "Fiscal" },
  liquidity: { icon: Droplets, color: "text-info", bg: "bg-info/10", label: "Liquidity" },
  debt: { icon: Landmark, color: "text-gold-400", bg: "bg-gold-400/10", label: "Debt" },
};

export function ResearchCard({ items, className }: ResearchCardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => {
        const cat = CATEGORY_CONFIG[item.category];
        const Icon = cat.icon;
        return (
          <article
            key={item.id}
            className="group panel p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised"
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  cat.bg,
                  cat.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("label-sm", cat.color)}>{cat.label}</span>
                  <span className="text-2xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              </div>
              <div className="hidden shrink-0 sm:block">
                <span className="rounded-md border border-border bg-surface-2 px-2 py-1 font-data text-2xs font-medium text-foreground">
                  {item.metric}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
          </article>
        );
      })}
    </div>
  );
}
