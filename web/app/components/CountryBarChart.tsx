"use client";

import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { formatNumberWithSpace } from "../lib/number";
import { COLORS, CHART } from "../theme";


type Props = {
  data: Array<{ country: string; [key: string]: number }>;
  dataKey: string; // "count" | "ksek"
};

export default function CountryBarChart({ data, dataKey }: Props) {
  const router = useRouter();

  const handleBarClick = (entry: any) => {
    const country = entry?.payload?.country;
    if (country) router.push(`/country/${encodeURIComponent(country)}`);
  };

  return (
    <div style={{ width: "100%", height: 420, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="country"
            tick={{ fontSize: CHART.tickFont }}
            tickLine={false}
            axisLine={false}
            angle={0}
            dy={5}
          />
          <YAxis
            tick={{ fontSize: CHART.tickFont }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatNumberWithSpace(v)}
          />
          <Tooltip formatter={(v: number) => formatNumberWithSpace(v)} cursor={false} />
          <Bar
            dataKey={dataKey}
            fill={COLORS.primary}
            radius={CHART.barRadius}
            onClick={handleBarClick}
            style={{ cursor: "pointer" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
