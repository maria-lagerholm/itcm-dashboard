// app/country/Denmark/components/TopCategoriesSection.jsx
"use client";

import TopCategoriesTreemap from "./TopCategoriesTreemap";
import { useTopCategories } from "../hooks/useTopCategories";
import { TEXT, TREEMAP, LAYOUT } from "@/app/theme";

export default function TopCategoriesSection({
  country = "Denmark",
  limit = 12,
  height = 300,
  title = "Denmark · Top categories",
}) {
  const {
    rows,
    loading,
    error,
    years,
    seasonsForSelectedYear,
    year, setYear,
    season, setSeason,
  } = useTopCategories(country, limit);

  return (
    <section
      style={{
        display: "grid",
        gap: LAYOUT.sectionGap,
        marginTop: LAYOUT.sectionMarginY,
        marginBottom: LAYOUT.sectionMarginY,
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* Header + toggles (match TopProductsSection) */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          fontFamily: TEXT.family,
          fontSize: TEXT.size,
          color: TEXT.color,
        }}
      >
        <h3>{title}</h3>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {/* Year selector */}
          <select
            value={year ?? ""}
            onChange={(e) => setYear(Number(e.target.value))}
            style={select}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Season selector */}
          <select
            value={season ?? ""}
            onChange={(e) => setSeason(e.target.value)}
            style={select}
          >
            {seasonsForSelectedYear.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={loadingBox(height)}>Loading…</div>
      ) : error ? (
        <div style={{ color: "crimson", fontFamily: TEXT.family }}>{String(error)}</div>
      ) : (
        <TopCategoriesTreemap rows={rows} height={height} />
      )}
    </section>
  );
}

const select = {
  padding: "8px 10px",
  border: `1px solid ${TREEMAP.containerBorder}`,
  borderRadius: 8,
  background: "#fff",
};

const loadingBox = (h) => ({
  width: "100%",
  height: h,
  border: `1px solid ${TREEMAP.containerBorder}`,
  borderRadius: TREEMAP.containerRadius,
  display: "grid",
  placeItems: "center",
  background: TREEMAP.emptyBg,
  color: "#64748b",
  fontWeight: 500,
});
