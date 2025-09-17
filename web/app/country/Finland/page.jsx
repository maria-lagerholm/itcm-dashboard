"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { COLORS, CHART } from "../../theme";

import MonthlySalesChart from "./MonthlySalesChart";
import MonthlyForecastChart from "./MonthlyForecastChart";

// --- Age Distribution Chart for Finland (adapted from Sweden/Norway) ---
function AgeDistributionChart({
  agesSorted,
  ageByCountry,
  genderMode,
  loading,
  CHART,
  femaleColor,
  maleColor,
}) {
  // Prepare data for Finland
  const country = "Finland";
  const byCountry = ageByCountry?.[country] || {};
  const data = agesSorted.map((age) => {
    const female = byCountry?.Female?.[age] ?? 0;
    const male = byCountry?.Male?.[age] ?? 0;
    return {
      age,
      Female: female,
      Male: male,
      Both: female + male,
    };
  });

  let bars = [];
  if (genderMode === "Female") {
    bars = [
      <Bar key="Female" dataKey="Female" fill={femaleColor} radius={CHART.barRadius} name="Female" />
    ];
  } else if (genderMode === "Male") {
    bars = [
      <Bar key="Male" dataKey="Male" fill={maleColor} radius={CHART.barRadius} name="Male" />
    ];
  } else {
    bars = [
      <Bar key="Female" dataKey="Female" fill={femaleColor} radius={CHART.barRadius} name="Female" />,
      <Bar key="Male" dataKey="Male" fill={maleColor} radius={CHART.barRadius} name="Male" />
    ];
  }

  return (
    <div style={{ width: "100%", height: 340, border: "1px solid #eee", borderRadius: 8, padding: 12, background: "#fafafa" }}>
      {loading ? (
        <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginTop: 80 }}>Loading age distribution…</div>
      ) : (
        <ResponsiveContainer>
          <BarChart data={data} margin={CHART.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" tick={{ fontSize: 13 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 13 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v, n) => [v, n]}
              labelFormatter={(l) => `Age ${l}`}
              cursor={false}
              wrapperStyle={{ fontSize: 13 }}
            />
            {bars}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// Helper: sort array of objects with .month ("YYYY-MM") by calendar order Jan-Dec
function sortByMonthJanToDec(arr) {
  if (!Array.isArray(arr) || !arr.length || !arr[0].month) return arr;
  return [...arr].sort((a, b) => {
    const ma = parseInt(a.month.split("-")[1], 10);
    const mb = parseInt(b.month.split("-")[1], 10);
    if (ma === mb) {
      const ya = parseInt(a.month.split("-")[0], 10);
      const yb = parseInt(b.month.split("-")[0], 10);
      return ya - yb;
    }
    return ma - mb;
  });
}

const AGE_COLORS = {
  female: "#ad92b2",
  male:   "#6081a4",
};

export default function Finland() {
  // --- State for top cities (customers / revenue) ---
  const [mode, setMode] = useState("customers"); // "customers" | "revenue"
  const [rowsCustomers, setRowsCustomers] = useState([]);
  const [rowsRevenue, setRowsRevenue] = useState([]);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // --- State for age distribution ---
  const [genderMode, setGenderMode] = useState("Female"); // "Female" | "Male" | "Both"
  const [agesSorted, setAgesSorted] = useState([]);
  const [ageByCountry, setAgeByCountry] = useState(null);
  const [ageLoading, setAgeLoading] = useState(false);

  // Top cities by unique customers (Finland: country id 72)
  useEffect(() => {
    fetch(`${base}/api/country/72/top-cities?limit=10`)
      .then(r => r.json())
      .then(j => setRowsCustomers(Array.isArray(j.top_cities) ? j.top_cities : []))
      .catch(console.error);
  }, [base]);

  // Top cities by revenue (lazy fetch)
  useEffect(() => {
    if (mode !== "revenue" || rowsRevenue.length) return;
    fetch(`${base}/api/cities_by_revenue`)
      .then(r => r.json())
      .then(j => {
        const map = j?.top_cities_by_revenue_ksek || {};
        const finland = Array.isArray(map?.["Finland"]) ? map["Finland"] : [];
        setRowsRevenue(finland);
      })
      .catch(console.error);
  }, [mode, rowsRevenue.length, base]);

  // Fetch age distribution (shared endpoint)
  useEffect(() => {
    setAgeLoading(true);
    fetch(`${base}/api/customers_age_gender`)
      .then((r) => r.json())
      .then((json) => {
        setAgesSorted(Array.isArray(json.ages_sorted) ? json.ages_sorted : []);
        setAgeByCountry(json.by_country || {});
      })
      .catch((e) => console.error("Error fetching customers_age_gender:", e))
      .finally(() => setAgeLoading(false));
  }, [base]);

  // If the data is monthly (has .month), sort by Jan-Dec
  const data = useMemo(() => {
    const d = mode === "customers" ? rowsCustomers : rowsRevenue;
    if (d.length && d[0].month) return sortByMonthJanToDec(d);
    return d;
  }, [mode, rowsCustomers, rowsRevenue]);

  const dataKey = mode === "customers" ? "unique_customers" : "ksek";
  const fmtInt = (v) => Number(v).toLocaleString("sv-SE");

  const titleSuffix = mode === "customers" ? "unique customers" : "revenue (KSEK)";
  const tooltipFormatter = (v) =>
    mode === "customers" ? [fmtInt(v), "Customers"] : [`${fmtInt(v)} KSEK`, "Revenue"];

  // ---- constants for the monthly charts ----
  const HIST_START = "2024-06";
  const HIST_END   = "2025-05";     // 12 months window
  const FORECAST_ANCHOR_END = HIST_END;

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto", fontSize: 14 }}>
      {/* Header & mode buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, fontSize: 14 }}>
        <h2 style={{ fontSize: 18 }}>Finland · Top 10 cities by {titleSuffix}</h2>
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
              fontSize: 14,
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
              fontSize: 14,
            }}
          >
            Total Revenue (KSEK)
          </button>
        </div>
      </div>

      {/* Top cities chart */}
      <div style={{ width: "100%", height: 420, border: "1px solid #eee", borderRadius: 8, padding: 12, fontSize: 14 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={CHART.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="city"
              tick={{ fontSize: 14 }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 14 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtInt}
            />
            <Tooltip formatter={tooltipFormatter} cursor={false} wrapperStyle={{ fontSize: 14 }} />
            <Bar dataKey={dataKey} fill={COLORS.primary} radius={CHART.barRadius} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- Age distribution for Finland --- */}
      <section style={{ marginTop: 32, marginBottom: 32, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(30,41,59,0.04)", padding: 20 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Finland · Age distribution by gender</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setGenderMode("Female")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: genderMode === "Female" ? "#f1f5f9" : "white",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              Female
            </button>
            <button
              onClick={() => setGenderMode("Male")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: genderMode === "Male" ? "#f1f5f9" : "white",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              Male
            </button>
            <button
              onClick={() => setGenderMode("Both")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: genderMode === "Both" ? "#f1f5f9" : "white",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              Both
            </button>
          </div>
        </header>
        <AgeDistributionChart
          agesSorted={agesSorted}
          ageByCountry={ageByCountry}
          genderMode={genderMode}
          loading={ageLoading}
          CHART={CHART}
          femaleColor={AGE_COLORS.female}
          maleColor={AGE_COLORS.male}
        />
      </section>

      {/* Historical 12 months (June 2024 – May 2025) */}
      <div style={{ fontSize: 14 }}>
        <MonthlySalesChart
          country="Finland"
          startYM={HIST_START}
          endYM={HIST_END}
          title="Finland · Monthly Revenue (KSEK)"
        />
      </div>

      {/* Next 12 months placeholders (June 2025 – May 2026) */}
      <div style={{ fontSize: 14 }}>
        <MonthlyForecastChart
          country="Finland"
          anchorEndYM={FORECAST_ANCHOR_END}
          title="Finland · Monthly Revenue (KSEK)"
        />
      </div>
    </main>
  );
}
