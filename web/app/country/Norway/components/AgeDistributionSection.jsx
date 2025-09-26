"use client";

import COUNTRY from "../country";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  CARD, TEXT, CHART, TOOLTIP, AGE_COLORS, LAYOUT, BUTTON, UI, HEADINGS, SECTION,
} from "../../../theme";
import useAgeDistribution from "../hooks/useAgeDistribution";

/**
 * Renders a bar chart for age distribution by gender.
 */
function AgeChart({ country, agesSorted, byCountry, mode, loading, height = 320 }) {
  const both = mode === "Both";
  const barSize = both ? 8 : 6;

  // Prepare chart data for the selected country and mode
  const data = useMemo(() => {
    const c = byCountry?.[country] || {};
    return agesSorted.map((age) => {
      const f = Number(c?.Female?.[age] ?? 0);
      const m = Number(c?.Male?.[age] ?? 0);
      return { age, Female: f, Male: m, Both: f + m };
    });
  }, [agesSorted, byCountry, country]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height,
          border: CARD.border,
          borderRadius: CARD.radius,
          background: CARD.bg,
          padding: CARD.padding,
          boxSizing: "border-box",
          display: "grid",
          placeItems: "center",
          fontFamily: TEXT.family,
          color: TEXT.color,
          position: "relative",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height,
        border: CARD.border,
        borderRadius: CARD.radius,
        background: CARD.bg,
        padding: CARD.padding,
        boxSizing: "border-box",
        fontFamily: TEXT.family,
        position: "relative",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={both ? "8%" : "1%"} barGap={1}>
          <CartesianGrid strokeDasharray={UI.grid.strokeDasharray} />
          <XAxis dataKey="age" tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
            wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
            contentStyle={{
              background: TOOLTIP.base.background,
              border: TOOLTIP.base.border,
              borderRadius: TOOLTIP.base.borderRadius,
              padding: TOOLTIP.base.padding,
              boxShadow: TOOLTIP.base.boxShadow,
              fontSize: TEXT.size,
              color: TEXT.color,
            }}
            labelStyle={{ color: TEXT.color, fontSize: TEXT.size }}
            itemStyle={{ color: TEXT.color, fontSize: TEXT.size }}
            formatter={(v, n) => [v, n]}
            labelFormatter={l => `Age ${l}`}
          />
          {mode !== "Male" && (
            <Bar dataKey="Female" fill={AGE_COLORS.Female} radius={CHART.barRadius} barSize={barSize} />
          )}
          {mode !== "Female" && (
            <Bar dataKey="Male" fill={AGE_COLORS.Male} radius={CHART.barRadius} barSize={barSize} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Section displaying age distribution by gender for a country.
 */
export default function AgeDistributionSection({ country = COUNTRY }) {
  const { agesSorted, byCountry, loading } = useAgeDistribution();
  const [mode, setMode] = useState("Female"); // "Female" | "Male" | "Both"

  // Button style helper
  const btn = active => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
    fontFamily: TEXT.family,
    color: TEXT.color,
  });

  return (
    <section style={SECTION.container(LAYOUT)}>
      <div style={SECTION.header(TEXT)}>
        <h3 style={{ ...HEADINGS.h3, fontFamily: TEXT.family, color: TEXT.color }}>
          {country} · Age distribution by gender
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["Female", "Male", "Both"].map(g => (
            <button key={g} onClick={() => setMode(g)} style={btn(mode === g)}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <AgeChart
        country={country}
        agesSorted={agesSorted}
        byCountry={byCountry}
        mode={mode}
        loading={loading}
        height={320}
      />
    </section>
  );
}
