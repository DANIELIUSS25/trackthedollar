"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { formatCompact } from "@/lib/utils/formatters";
import type { TimeSeriesPoint } from "@/types/dollar";

interface SeriesOption {
  id: string;
  label: string;
  color: string;
}

interface InteractiveChartProps {
  seriesOptions: SeriesOption[];
  getSeriesData: (seriesId: string) => TimeSeriesPoint[];
  timeframes?: Array<{ value: string; label: string }>;
  defaultSeries?: string;
  height?: number;
  className?: string;
}

export function InteractiveChart({
  seriesOptions,
  getSeriesData,
  timeframes,
  defaultSeries,
  height = 360,
  className,
}: InteractiveChartProps) {
  const [activeSeries, setActiveSeries] = useState(defaultSeries ?? seriesOptions[0]?.id ?? "");
  const [activeTimeframe, setActiveTimeframe] = useState("1Y");

  const activeOption = seriesOptions.find((s) => s.id === activeSeries) ?? seriesOptions[0];
  const color = activeOption?.color ?? "#f0b429";

  const rawData = useMemo(() => getSeriesData(activeSeries), [activeSeries, getSeriesData]);

  // Filter by timeframe
  const data = useMemo(() => {
    if (!timeframes) return rawData;
    const now = new Date();
    const cutoffMap: Record<string, number> = {
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
      "5Y": 1825,
    };
    const days = cutoffMap[activeTimeframe] ?? 365;
    const cutoff = new Date(now.getTime() - days * 86400000);
    return rawData.filter((p) => new Date(p.date) >= cutoff);
  }, [rawData, activeTimeframe, timeframes]);

  const firstVal = data[0]?.value ?? 0;
  const lastVal = data[data.length - 1]?.value ?? 0;
  const change = lastVal - firstVal;
  const changePct = firstVal !== 0 ? (change / firstVal) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className={cn("panel", className)}>
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{activeOption?.label}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-data text-data-xl font-bold text-foreground">
              {formatCompact(lastVal)}
            </span>
            <span
              className={cn(
                "font-data text-xs font-medium",
                isPositive ? "text-positive" : "text-negative"
              )}
            >
              {isPositive ? "+" : ""}
              {changePct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Timeframe buttons */}
        {timeframes && (
          <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setActiveTimeframe(tf.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-2xs font-medium transition-all",
                  activeTimeframe === tf.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Series selector */}
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-border px-4 py-2">
        {seriesOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveSeries(opt.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-medium transition-all",
              activeSeries === opt.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: opt.color }}
            />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`interactive-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 20%, 12%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#6b7a99" }}
              tickFormatter={(d: string) => {
                const date = new Date(d);
                return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
              }}
              minTickGap={60}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#6b7a99" }}
              tickFormatter={(v: number) => formatCompact(v)}
              width={60}
              domain={[
                (dataMin: number) => dataMin * 0.997,
                (dataMax: number) => dataMax * 1.003,
              ]}
            />
            <ReferenceLine
              y={firstVal}
              stroke="#6b7a99"
              strokeDasharray="4 4"
              strokeOpacity={0.3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f1520",
                border: "1px solid #1c2535",
                borderRadius: "8px",
                fontSize: 12,
                color: "#c8d0dc",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
              labelFormatter={(d: string) =>
                new Date(d).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }
              formatter={(value: number) => [formatCompact(value), activeOption?.label ?? "Value"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#interactive-${color.replace("#", "")})`}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
