"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { formatCompact } from "@/lib/utils/formatters";

interface BarBreakdownChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  formatValue?: (value: number) => string;
  title?: string;
}

const DEFAULT_COLORS = [
  "#f0b429",
  "#16c784",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#84cc16",
  "#ef4444",
  "#6366f1",
];

export function BarBreakdownChart({
  data,
  height = 300,
  formatValue = formatCompact,
  title,
}: BarBreakdownChartProps) {
  return (
    <div className="panel p-4">
      {title && (
        <h3 className="mb-4 text-sm font-medium text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(220, 20%, 16%)"
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7a99" }}
            tickFormatter={(v: number) => formatValue(Math.abs(v))}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7a99" }}
            width={140}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1520",
              border: "1px solid #1c2535",
              borderRadius: "6px",
              fontSize: 12,
              color: "#c8d0dc",
            }}
            formatter={(value: number) => [formatValue(Math.abs(value)), "Amount"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
