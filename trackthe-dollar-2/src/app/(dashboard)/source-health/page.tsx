"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";

export default function SourceHealthPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["source-health"],
    queryFn: () => fetch("/api/v1/source-health").then((r) => r.json()),
    refetchInterval: 60000, // auto-refresh every minute
  });

  const d = data?.data;

  return (
    <main className="md:ml-sidebar space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Source Health</h1>
        <p className="text-sm text-muted-foreground">
          Real-time status of all government data sources
        </p>
      </div>

      {d?.summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="panel p-4">
            <span className="label-md text-muted-foreground">Total Sources</span>
            <p className="mt-1 font-data text-2xl font-bold">{d.summary.total}</p>
          </div>
          <div className="panel p-4">
            <span className="label-md text-muted-foreground">Healthy</span>
            <p className="mt-1 font-data text-2xl font-bold text-positive">{d.summary.healthy}</p>
          </div>
          <div className="panel p-4">
            <span className="label-md text-muted-foreground">Degraded / Down</span>
            <p className="mt-1 font-data text-2xl font-bold text-negative">{d.summary.degraded}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="panel h-16 animate-pulse bg-surface-1" />
          ))}
        </div>
      )}

      {error && (
        <div className="panel border-negative/30 p-4">
          <p className="text-sm text-negative">Failed to check source health</p>
        </div>
      )}

      {d?.sources && (
        <div className="space-y-2">
          {d.sources.map((source: {
            source: string;
            status: "healthy" | "degraded" | "down";
            lastCheck: string;
            latencyMs: number;
          }) => (
            <div
              key={source.source}
              className="panel flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    source.status === "healthy" && "bg-positive",
                    source.status === "degraded" && "bg-warning",
                    source.status === "down" && "bg-negative"
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{source.source}</p>
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(source.lastCheck).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-data text-sm text-muted-foreground">
                  {source.latencyMs}ms
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    source.status === "healthy" && "bg-positive/10 text-positive",
                    source.status === "degraded" && "bg-warning/10 text-warning",
                    source.status === "down" && "bg-negative/10 text-negative"
                  )}
                >
                  {source.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel p-4">
        <h3 className="mb-2 text-sm font-medium text-foreground">About Source Health</h3>
        <p className="text-sm text-muted-foreground">
          TrackTheDollar pulls data exclusively from primary official U.S. government sources.
          This page monitors each source&apos;s availability and response time in real-time.
          Auto-refreshes every 60 seconds.
        </p>
      </div>
    </main>
  );
}
