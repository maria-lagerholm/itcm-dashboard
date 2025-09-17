"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";

// --- helpers ---
const fiInt = (v) => Number(v).toLocaleString("fi-FI");

// ---------------- Top cities ----------------
export function TopCitiesChart({ data, mode, CHART, color }) {
  const dataKey = mode === "customers" ? "unique_customers" : "ksek";
  const tooltipFormatter = (v, name) =>
    mode === "customers" ? [fiInt(v), "Customers"] : [`${fiInt(v)} KSEK`];

  return (
    <div style={{ width: "100%", height: 420 }}>
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
            tickFormatter={fiInt}
          />
          <Tooltip formatter={tooltipFormatter} cursor={false} />
          <Bar dataKey={dataKey} fill={color} radius={CHART.barRadius} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --------------- Age distribution ---------------
export function AgeDistributionChart({
  agesSorted,
  ageByCountry,
  genderMode,
  loading,
  CHART,
  femaleColor,   // "#efcfe3"
  maleColor,     // "#b3dee2"
}) {
  if (loading) {
    return (
      <div style={{ height: 420, display: "grid", placeItems: "center", color: "#475569" }}>
        Loading age distribution…
      </div>
    );
  }

  // Build data rows
  const fi = ageByCountry?.["Finland"] || {};
  const female = fi["Female"] || {};
  const male = fi["Male"] || {};

  let data = [];
  if (genderMode === "Both") {
    data = agesSorted.map((age) => ({
      age,
      Female: Number(female[age] ?? 0),
      Male:   Number(male[age] ?? 0),
    }));
  } else {
    const map = genderMode === "Female" ? female : male;
    data = agesSorted.map((age) => ({ age, count: Number(map[age] ?? 0) }));
  }

  return (
    <div style={{ width: "100%", height: 420 }}>
      <ResponsiveContainer>
        {genderMode === "Both" ? (
          <BarChart data={data} margin={CHART.margin} barCategoryGap="20%" barGap={6}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
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
              tickFormatter={fiInt}
            />
            <Tooltip formatter={(v, name) => [fiInt(v), name]} cursor={false} />
            <Bar dataKey="Female" barSize={26} radius={[8, 8, 0, 0]} fill={femaleColor} />
            <Bar dataKey="Male"   barSize={26} radius={[8, 8, 0, 0]} fill={maleColor} />
            <Legend />
          </BarChart>
        ) : (
          <BarChart data={data} margin={CHART.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
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
              tickFormatter={fiInt}
            />
            <Tooltip formatter={(v, name) => [fiInt(v), name]} cursor={false} />
            <Bar
              dataKey="count"
              radius={CHART.barRadius}
              fill={genderMode === "Female" ? femaleColor : maleColor}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}