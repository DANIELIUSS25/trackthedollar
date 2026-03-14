"use client";

import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface AIBriefingCardProps {
  title: string;
  summary: string;
  sources: string[];
  generatedAt: string;
  className?: string;
}

export function AIBriefingCard({
  title,
  summary,
  sources,
  generatedAt,
  className,
}: AIBriefingCardProps) {
  return (
    <div className={cn("panel-hero p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <ConfidenceBadge source="AI Generated" lastUpdated={generatedAt} />
      </div>

      <div className="mb-4 text-sm leading-relaxed text-foreground/90">
        {summary.split("\n").map((paragraph, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="label-sm text-muted-foreground">Sources:</span>
        {sources.map((source) => (
          <span
            key={source}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-2xs text-muted-foreground"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            {source}
          </span>
        ))}
      </div>
    </div>
  );
}
