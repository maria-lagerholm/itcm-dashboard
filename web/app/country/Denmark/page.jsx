"use client";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { COLORS, CHART } from "../../theme";

export default function Denmark() {
  // Only "customers" and "revenue" modes, no avg basket value
  const [mode, setMode] = useState("customers");
  const [rowsCustomers, setRowsCustomers] = useState([]); // [{ city, unique_customers }]
  const [rowsRevenue, setRowsRevenue] = useState([]);     // [{ city, ksek }]
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // customers
  useEffect(() => {
    fetch(`${base}/api/country/58/top-cities?limit=10`)
      .then(r => r.json())
      .then(j => setRowsCustomers(Array.isArray(j.top_cities) ? j.top_cities : []))
      .catch(console.error);
  }, [base]);

  // revenue (load once when switching to revenue)
  useEffect(() => {
    if (mode !== "revenue" || rowsRevenue.length) return;
    fetch(`${base}/api/cities_by_revenue`)
      .then(r => r.json())
      .then(j => {
        const map = j?.top_cities_by_revenue_ksek || {};
        const denmark = Array.isArray(map?.["Denmark"]) ? map["Denmark"] : [];
        setRowsRevenue(denmark);
      })
      .catch(console.error);
  }, [mode, rowsRevenue.length, base]);

  const data = useMemo(
    () => (mode === "customers" ? rowsCustomers : rowsRevenue),
    [mode, rowsCustomers, rowsRevenue]
  );

  const dataKey =
    mode === "customers" ? "unique_customers" :
    "ksek";

  const fmtInt = (v) => Number(v).toLocaleString("sv-SE");
  const yTickFormatter = fmtInt;

  const titleSuffix =
    mode === "customers" ? "unique customers" :
    "revenue (KSEK)";

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2>Denmark · Top 10 cities by {titleSuffix}</h2>
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
              tickFormatter={yTickFormatter}
            />
            <Tooltip
              formatter={(v) =>
                mode === "customers" ? fmtInt(v) :
                `${fmtInt(v)} KSEK`
              }
              cursor={false}
            />
            <Bar dataKey={dataKey} fill={COLORS.primary} radius={CHART.barRadius} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
