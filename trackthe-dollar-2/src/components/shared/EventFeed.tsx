"use client";

import { cn } from "@/lib/utils/cn";

export interface FeedEvent {
  id: string;
  date: string;
  title: string;
  detail?: string;
  type: "auction" | "data_release" | "policy" | "fiscal" | "market";
}

interface EventFeedProps {
  events: FeedEvent[];
  title?: string;
  className?: string;
}

const TYPE_COLORS: Record<FeedEvent["type"], string> = {
  auction: "bg-gold-400",
  data_release: "bg-info",
  policy: "bg-purple-500",
  fiscal: "bg-positive",
  market: "bg-muted-foreground",
};

export function EventFeed({ events, title = "Event Feed", className }: EventFeedProps) {
  return (
    <div className={cn("panel p-4", className)}>
      <h2 className="label-lg mb-3 text-muted-foreground">{title}</h2>
      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

        {events.map((event) => (
          <div
            key={event.id}
            className="relative flex items-start gap-3 py-2 pl-1"
          >
            {/* Timeline dot */}
            <div
              className={cn(
                "relative z-10 mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full border-2 border-background",
                TYPE_COLORS[event.type]
              )}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-data text-2xs text-muted-foreground">
                  {formatEventDate(event.date)}
                </span>
              </div>
              <p className="text-sm text-foreground">{event.title}</p>
              {event.detail && (
                <p className="text-xs text-muted-foreground">{event.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
