// app/components/ReturningPatterns.tsx
"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useMemo } from "react";
import { formatNumberWithSpace } from "@/app/lib/number";
import { COLORS, CHART, CARD, TEXT, UI, TOOLTIP } from "@/app/theme";

type Props = {
  data: Array<Record<string, unknown>>;
  categoryKey?: string;   // default "country"
  valueKey?: string;      // default "count"
  height?: number;
  legend?: boolean;
  compact?: boolean;
};


const numberTick = (n: number | string) => {
  const v = Number(n ?? 0);
  return v >= 10_000 ? `${Math.round(v / 1000)}k` : formatNumberWithSpace(v);
};

// Convert vertical radius to horizontal (right side rounded only)
const horizRadius = (r: number | number[]): [number, number, number, number] => {
  const rad = Array.isArray(r)
    ? Math.max(...(r as number[]).map(x => x || 0), 8)
    : r || 8;
  return [0, rad, rad, 0];
};

export default function ReturningPatterns({
  data,
  categoryKey = "country",
  valueKey = "count",
  height = 420,
  legend = false,
  compact = false,
}: Props) {
  const rows = Array.isArray(data) ? data : [];

  const total = useMemo(
    () => rows.reduce((s, r) => s + Number(r?.[valueKey] ?? 0), 0),
    [rows, valueKey]
  );

  return (
    <div
      style={{
        width: "100%",
        height,
        border: CARD.border,
        borderRadius: CARD.radius,
        padding: compact ? Math.max(6, (CARD.padding as number) - 6) : CARD.padding,
        background: CARD.bg,
        boxSizing: "border-box",
        fontFamily: TEXT.family,
        fontSize: TEXT.size,
        color: TEXT.color,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={rows}
          margin={CHART.margin}
          barSize={14}             // thinner bars
          barCategoryGap={12}      // a bit more air between bars
        >
          <CartesianGrid
            strokeDasharray={UI.grid.strokeDasharray}
            horizontal
            vertical={false}
            stroke={COLORS.grid}
          />
          <XAxis
            type="number"
            domain={[0, "dataMax"]}
            tickFormatter={numberTick}
            tick={{ fontSize: CHART.tickFont, fill: TEXT.color }}
            axisLine={{ stroke: COLORS.grid }}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            width={140}
            tick={{ fontSize: CHART.tickFont, fill: TEXT.color }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            itemStyle={{ color: TEXT.color }}
            labelStyle={{ color: TEXT.color }}
            cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
            wrapperStyle={{ fontSize: TEXT.size, color: TEXT.color, fontFamily: TEXT.family }}
            contentStyle={{ ...TOOLTIP.base }}
            labelStyle={{ fontWeight: 700, marginBottom: 6 }}
            formatter={(value: number, name: string) => {
              const count = Number(value) || 0;
              const pct = total ? (count / total) * 100 : 0;
              return [`${formatNumberWithSpace(count)} (${pct.toFixed(1)}%)`, name];
            }}
          />

          {legend && (
            <Legend
              wrapperStyle={{ paddingTop: 8, color: TEXT.color, fontFamily: TEXT.family, fontSize: TEXT.size }}
            />
          )}
          <Bar
            dataKey={valueKey}
            name="Customers"
            fill={COLORS.series.returning}
            radius={horizRadius(CHART.barRadius)}  // rounded RIGHT side only
            stroke="none"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
