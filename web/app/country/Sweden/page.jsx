"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { COLORS, CHART } from "../../theme";

export default function Sweden() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${base}/api/country/205/top-cities?limit=10`)
      .then(r => r.json())
      .then(j => setRows(j.top_cities || []));
  }, []);
  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>Sweden · Top 10 cities by unique customers</h2>
      <div style={{ width: "100%", height: 420, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        <ResponsiveContainer>
          <BarChart
            data={rows}
            margin={CHART.margin}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="city"
              tick={{ fontSize: CHART.tickFont }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: CHART.tickFont }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toLocaleString()}
            />
            <Tooltip formatter={(v) => v.toLocaleString()} cursor={false} />
            <Bar
              dataKey="unique_customers"
              fill={COLORS.primary}
              radius={CHART.barRadius}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}