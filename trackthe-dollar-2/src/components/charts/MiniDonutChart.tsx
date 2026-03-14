"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCompact } from "@/lib/utils/formatters";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  pctOfTotal: number;
}

interface MiniDonutChartProps {
  data: DonutSegment[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

export function MiniDonutChart({
  data,
  title,
  centerLabel,
  centerValue,
  height = 200,
}: MiniDonutChartProps) {
  return (
    <div className="panel p-4">
      {title && <h3 className="mb-2 text-sm font-medium text-foreground">{title}</h3>}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f1520",
                border: "1px solid #1c2535",
                borderRadius: "6px",
                fontSize: 12,
                color: "#c8d0dc",
              }}
              formatter={(value: number, name: string) => [
                formatCompact(value),
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xs text-muted-foreground">{centerLabel}</span>
            {centerValue && (
              <span className="font-data text-sm font-semibold text-foreground">
                {centerValue}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {data.slice(0, 6).map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate text-2xs text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-data text-2xs text-foreground">
              {d.pctOfTotal.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
