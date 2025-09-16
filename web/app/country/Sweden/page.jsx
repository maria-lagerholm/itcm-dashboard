"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { COLORS, CHART } from "../../theme";

export default function Sweden() {
  const [mode, setMode] = useState("customers"); // "customers" | "revenue"
  const [rowsCustomers, setRowsCustomers] = useState([]); // [{ city, unique_customers }]
  const [rowsRevenue, setRowsRevenue] = useState([]);     // [{ city, ksek }]
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Load top cities by unique customers (existing)
  useEffect(() => {
    fetch(`${base}/api/country/205/top-cities?limit=10`)
      .then(r => r.json())
      .then(j => setRowsCustomers(j.top_cities || []))
      .catch(console.error);
  }, [base]);

  // Lazy-load revenue: hit /api/cities_by_revenue and take Sweden slice
  useEffect(() => {
    if (mode !== "revenue" || rowsRevenue.length) return;
    fetch(`${base}/api/cities_by_revenue`)
      .then(r => r.json())
      .then(j => {
        const map = j?.top_cities_by_revenue_ksek || {};
        const sweden = map["Sweden"] || [];
        setRowsRevenue(sweden);
      })
      .catch(console.error);
  }, [mode, rowsRevenue.length, base]);

  const data = useMemo(
    () => (mode === "customers" ? rowsCustomers : rowsRevenue),
    [mode, rowsCustomers, rowsRevenue]
  );
  const dataKey = mode === "customers" ? "unique_customers" : "ksek";
  const formatNum = (v) => Number(v).toLocaleString("sv-SE");

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2>
          Sweden · Top 10 cities by {mode === "customers" ? "unique customers" : "revenue (KSEK)"}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setMode("customers")}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: mode === "customers" ? "#f1f5f9" : "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Customers
          </button>
          <button
            onClick={() => setMode("revenue")}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: mode === "revenue" ? "#f1f5f9" : "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Total Revenue (KSEK)
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 420, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={CHART.margin}>
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
              tickFormatter={formatNum}
            />
            <Tooltip
              formatter={(v) =>
                mode === "customers" ? formatNum(v) : `${formatNum(v)} KSEK`
              }
              cursor={false}
            />
            <Bar
              dataKey={dataKey}
              fill={COLORS.primary}
              radius={CHART.barRadius}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
