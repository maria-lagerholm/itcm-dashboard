// app/country/Denmark/components/AgeDistributionSection.jsx
"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CHART, AGE_COLORS } from "../../../theme";
import useAgeDistribution from "../hooks/useAgeDistribution";

function Chart({ country, agesSorted, byCountry, genderMode, loading, height = 340 }) {
  const both = genderMode === "Both";
  const barSize = both ? 8 : 6;                 // thicker when Both, thinner otherwise
  const catGap  = both ? "8%" : "1%";
  const barGap  = both ? 1 : 1;

  const data = useMemo(() => {
    const c = byCountry?.[country] || {};
    return agesSorted.map((age) => {
      const f = c?.Female?.[age] ?? 0, m = c?.Male?.[age] ?? 0;
      return { age, Female: f, Male: m, Both: f + m };
    });
  }, [agesSorted, byCountry, country]);

  return (
    <div style={{ width: "100%", height }}>
      {loading ? (
        <div style={{ textAlign: "center", color: "#000", fontSize: 14, marginTop: 80 }}>Loading age distribution…</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART.margin} barCategoryGap={catGap} barGap={barGap}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.035)", radius: 6 }}
              wrapperStyle={{ fontSize: 14, zIndex: 10, pointerEvents: "none" }}
              contentStyle={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, boxShadow: "0 4px 10px rgba(0,0,0,.05)", color: "#000" }}
              labelStyle={{ color: "#000" }}
              itemStyle={{ color: "#000" }}
              formatter={(v, n) => [v, n]}
              labelFormatter={(l) => `Age ${l}`}
            />
            {genderMode !== "Male"  && <Bar dataKey="Female" fill={AGE_COLORS.Female} radius={CHART.barRadius} name="Female" barSize={barSize} />}
            {genderMode !== "Female" && <Bar dataKey="Male"   fill={AGE_COLORS.Male}   radius={CHART.barRadius} name="Male"   barSize={barSize} />}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function AgeDistributionSection({ country = "Denmark" }) {
  const { agesSorted, byCountry, loading } = useAgeDistribution();
  const [genderMode, setGenderMode] = useState("Female"); // "Female" | "Male" | "Both"

  return (
    <section style={{ width: "100%", boxSizing: "border-box", margin: "32px 0" }}>
      {/* Title + toggles outside the chart box (match TopCities) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, fontSize: 14 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#000" }}>{country} · Age distribution by gender</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["Female", "Male", "Both"].map((g) => (
            <button
              key={g}
              onClick={() => setGenderMode(g)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: genderMode === g ? "#f1f5f9" : "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                color: "#000",
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Chart box */}
      <div style={{ width: "100%", height: 320, border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff", fontSize: 14 }}>
        <Chart country={country} agesSorted={agesSorted} byCountry={byCountry} genderMode={genderMode} loading={loading} />
      </div>
    </section>
  );
}
