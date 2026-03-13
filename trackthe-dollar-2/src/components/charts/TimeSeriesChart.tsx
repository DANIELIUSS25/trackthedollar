"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TimeSeriesPoint } from "@/types/dollar";
import { formatCompact, formatDate } from "@/lib/utils/formatters";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  color?: string;
  label?: string;
  height?: number;
  formatValue?: (value: number) => string;
  showGrid?: boolean;
}

export function TimeSeriesChart({
  data,
  color = "#f0b429",
  label,
  height = 300,
  formatValue = formatCompact,
  showGrid = true,
}: TimeSeriesChartProps) {
  return (
    <div className="panel p-4">
      {label && (
        <h3 className="mb-4 text-sm font-medium text-foreground">{label}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`area-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 20%, 16%)"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7a99" }}
            tickFormatter={(d: string) => {
              const date = new Date(d);
              return date.toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              });
            }}
            minTickGap={40}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7a99" }}
            tickFormatter={(v: number) => formatValue(v)}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1520",
              border: "1px solid #1c2535",
              borderRadius: "6px",
              fontSize: 12,
              color: "#c8d0dc",
            }}
            labelFormatter={(d: string) => formatDate(d)}
            formatter={(value: number) => [formatValue(value), label ?? "Value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#area-${color.replace("#", "")})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
