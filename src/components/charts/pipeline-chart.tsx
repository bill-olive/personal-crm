"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PIPELINE_DATA = [
  { stage: "Discovery", value: 380000, fill: "hsl(var(--chart-1))" },
  { stage: "Demo", value: 650000, fill: "hsl(var(--chart-2))" },
  { stage: "POC", value: 1190000, fill: "hsl(var(--chart-3))" },
  { stage: "Proposal", value: 1200000, fill: "hsl(var(--chart-4))" },
  { stage: "Negotiation", value: 420000, fill: "hsl(var(--chart-5))" },
];

const STAGE_COLORS = [
  "hsl(215 16% 47%)", // slate-500
  "hsl(217 91% 60%)", // blue-500
  "hsl(239 84% 67%)", // indigo-500
  "hsl(263 70% 50%)", // purple-500
  "hsl(38 92% 50%)",  // amber-500
];

const dataWithColors = PIPELINE_DATA.map((d, i) => ({
  ...d,
  fill: STAGE_COLORS[i],
}));

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function PipelineChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={dataWithColors}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted"
          vertical={false}
        />
        <XAxis
          dataKey="stage"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={false}
          tickLine={{ stroke: "hsl(var(--border))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value) => [formatCurrency(Number(value)), "Value"]}
          labelFormatter={(label) => label}
        />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
