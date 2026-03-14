"use client";

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

interface YieldCurvePoint {
  label: string;
  value: number;
}

interface YieldCurveChartProps {
  data: YieldCurvePoint[];
  height?: number;
  title?: string;
}

export function YieldCurveChart({ data, height = 240, title }: YieldCurveChartProps) {
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const spread = data[data.length - 1]?.value - data[4]?.value; // 30Y - 2Y approx
  const isInverted = spread < 0;

  return (
    <div className="panel p-4">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-2xs font-medium ${
              isInverted
                ? "bg-negative-subtle text-negative"
                : "bg-positive-subtle text-positive"
            }`}
          >
            {isInverted ? "Inverted" : "Normal"}
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="yieldCurveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0b429" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f0b429" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(220, 20%, 16%)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7a99" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7a99" }}
            domain={[Math.floor(min * 10) / 10 - 0.1, Math.ceil(max * 10) / 10 + 0.1]}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            width={48}
          />
          <ReferenceLine
            y={data[0]?.value}
            stroke="#6b7a99"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1520",
              border: "1px solid #1c2535",
              borderRadius: "6px",
              fontSize: 12,
              color: "#c8d0dc",
            }}
            formatter={(value: number) => [`${value.toFixed(3)}%`, "Yield"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f0b429"
            strokeWidth={2}
            fill="url(#yieldCurveGrad)"
            dot={{ fill: "#f0b429", stroke: "#0a0e14", strokeWidth: 2, r: 3 }}
            activeDot={{ fill: "#f0b429", stroke: "#f0b429", strokeWidth: 1, r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
