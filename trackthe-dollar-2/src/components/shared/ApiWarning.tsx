"use client";

import { AlertTriangle } from "lucide-react";

interface ApiWarningProps {
  warnings: string[];
  className?: string;
}

export function ApiWarning({ warnings, className }: ApiWarningProps) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className={`rounded-lg border border-warning/30 bg-warning/5 p-4 ${className ?? ""}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium text-warning">Data Availability Notice</p>
          <ul className="mt-1 space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-xs text-muted-foreground">{w}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function NoDataState({ message, requiresFredKey }: { message: string; requiresFredKey?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-8 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
      <p className="mt-3 text-sm font-medium text-foreground">{message}</p>
      {requiresFredKey && (
        <div className="mx-auto mt-4 max-w-md rounded-md bg-surface-2 p-3 text-left">
          <p className="text-xs font-medium text-muted-foreground">To enable this data:</p>
          <ol className="mt-1 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
            <li>Get a free API key from <span className="font-data text-primary">fred.stlouisfed.org/docs/api/api_key.html</span></li>
            <li>Add <span className="font-data text-primary">FRED_API_KEY=your_key</span> to Netlify environment variables</li>
            <li>Redeploy the site</li>
          </ol>
        </div>
      )}
    </div>
  );
}
