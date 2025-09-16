"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { COLORS, CHART } from "../../theme";

export default function Denmark() {
  // State for current mode: "customers" or "revenue"
  const [mode, setMode] = useState("customers");
  // State for top 10 cities by unique customers: [{ city, unique_customers }]
  const [rowsCustomers, setRowsCustomers] = useState([]);
  // State for top 10 cities by revenue: [{ city, ksek }]
  const [rowsRevenue, setRowsRevenue] = useState([]);
  // API base URL, fallback to localhost for local dev
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Fetch top 10 cities by unique customers for Denmark (country_id=58) on mount or when base changes
  useEffect(() => {
    fetch(`${base}/api/country/58/top-cities?limit=10`)
      .then(r => r.json())
      .then(j => {
        // Expecting j.top_cities to be an array of { city, unique_customers }
        setRowsCustomers(Array.isArray(j.top_cities) ? j.top_cities : []);
      })
      .catch(e => {
        // Log fetch or parse errors for debugging
        console.error("Error fetching Denmark top cities by customers:", e);
      });
  }, [base]);

  // Fetch top 10 cities by revenue for Denmark only when switching to "revenue" mode and not already loaded
  useEffect(() => {
    if (mode !== "revenue" || rowsRevenue.length) return;
    fetch(`${base}/api/cities_by_revenue`)
      .then(r => r.json())
      .then(j => {
        // j.top_cities_by_revenue_ksek is expected to be an object with country names as keys
        const map = j?.top_cities_by_revenue_ksek || {};
        // Denmark's data: array of { city, ksek }
        const denmark = Array.isArray(map?.["Denmark"]) ? map["Denmark"] : [];
        setRowsRevenue(denmark);
      })
      .catch(e => {
        // Log fetch or parse errors for debugging
        console.error("Error fetching Denmark top cities by revenue:", e);
      });
  }, [mode, rowsRevenue.length, base]);

  // Memoized data for the chart, depending on mode
  const data = useMemo(
    () => (mode === "customers" ? rowsCustomers : rowsRevenue),
    [mode, rowsCustomers, rowsRevenue]
  );

  // Key for BarChart: "unique_customers" or "ksek"
  const dataKey =
    mode === "customers" ? "unique_customers" :
    "ksek";

  // Format numbers with Swedish locale (space as thousands separator)
  const fmtInt = (v) => Number(v).toLocaleString("sv-SE");
  const yTickFormatter = fmtInt;

  // Suffix for chart title depending on mode
  const titleSuffix =
    mode === "customers" ? "unique customers" :
    "revenue (KSEK)";

  // Tooltip formatter: show "Customers" or "KSEK" label as appropriate
  const tooltipFormatter = (v, name, props) => {
    if (mode === "customers") {
      return [fmtInt(v), "Customers"];
    } else {
      return [`${fmtInt(v)} KSEK`];
    }
  };

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
              formatter={tooltipFormatter}
              cursor={false}
            />
            <Bar dataKey={dataKey} fill={COLORS.primary} radius={CHART.barRadius} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
