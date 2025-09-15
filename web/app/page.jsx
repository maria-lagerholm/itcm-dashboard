"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { COLORS, CHART } from "./theme";

export default function Home() {
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${base}/`)
      .then((r) => r.json())
      .then((json) => {
        const map = json?.customers_by_country || {};
        const rows = Object.entries(map).map(([country, count]) => ({ country, count }));
        setData(rows);
      })
      .catch(console.error);
  }, []);

  // Custom click handler for bars
  const handleBarClick = (entry) => {
    const country = entry?.payload?.country;
    if (country) router.push(`/country/${encodeURIComponent(country)}`);
  };

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Customers by Country</h2>
      <div style={{ width: "100%", height: 420, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            //margin={CHART.margin}
            //barSize={28}
            //barCategoryGap={18}
          >
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
              tickFormatter={(v) => v.toLocaleString()}
            />
            <Tooltip formatter={(v) => v.toLocaleString()} cursor={false} />
            <Bar
              dataKey="count"
              fill={COLORS.primary}
              radius={CHART.barRadius}
              onClick={handleBarClick}
              style={{ cursor: "pointer" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
