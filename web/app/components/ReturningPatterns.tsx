// app/components/ReturningPatterns.tsx
"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { formatNumberWithSpace } from "@/app/lib/number";
import { COLORS, CHART } from "@/app/theme";

type Props = {
  data: Array<Record<string, any>>;
  /** Y-axis category (labels) */
  categoryKey?: string;      // default "country"
  /** X-axis numeric value */
  valueKey?: string;         // required
  height?: number;
  legend?: boolean;
};

function numberTick(n: any) {
  const v = Number(n ?? 0);
  if (v >= 10_000) return `${Math.round(v / 1000)}k`;
  return formatNumberWithSpace(v);
}

function SimpleTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{
      background: "#fff", border: `1px solid ${COLORS.grid}`, borderRadius: 8,
      padding: 8, fontSize: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.06)", color: COLORS.text
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div><strong>{p.dataKey}:</strong> {formatNumberWithSpace(p.value)}</div>
    </div>
  );
}

export default function ReturningPatterns({
  data,
  categoryKey = "country",
  valueKey = "count",
  height = 420,
  legend = false,
}: Props) {
  const rows = Array.isArray(data) ? data : [];

  return (
    <div style={{ width: "100%", height, border: `1px solid ${COLORS.grid}`, borderRadius: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* HORIZONTAL bars: layout="vertical" + XAxis number + YAxis category */}
        <BarChart layout="vertical" data={rows} margin={CHART.margin}>
          <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke={COLORS.grid} />
          <XAxis
            type="number"
            tickFormatter={numberTick}
            tick={{ fontSize: CHART.tickFont, fill: COLORS.text }}
            axisLine={{ stroke: COLORS.grid }}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            width={140}
            tick={{ fontSize: CHART.tickFont, fill: COLORS.text }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            interval={0}
          />
          <Tooltip content={<SimpleTooltip />} />
          {legend && <Legend wrapperStyle={{ paddingTop: 8, color: COLORS.text }} />}
          <Bar
            dataKey={valueKey}
            name="Customers"
            radius={[4, 4, 4, 4]}
            fill={COLORS.series.revenue}
            maxBarSize={26}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
