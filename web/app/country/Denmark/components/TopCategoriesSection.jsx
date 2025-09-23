// app/country/Denmark/components/TopCategoriesSection.jsx
"use client";

import TopCategoriesTreemap from "./TopCategoriesTreemap";
import { useTopCategories } from "../hooks/useTopCategories";

const BTN = (active) => ({
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: active ? "#f1f5f9" : "#fff",
  cursor: "pointer",
  fontWeight: 600,
});

export default function TopCategoriesSection({
  country = "Denmark",
  limit = 12,
  height = 300,
  title = "Denmark · Top Categories (Treemap)",
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
    <section style={{ marginTop: 28 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 10 }}>{title}</h3>

      {/* Toolbar: Season buttons + Year select */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {seasonsForSelectedYear.map((s) => (
            <button key={s} style={BTN(season === s)} onClick={() => setSeason(s)}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 14 }}>Year</label>
          <select
            value={year ?? ""}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{
          width: "100%", height, border: "1px solid #eee", borderRadius: 8,
          display: "grid", placeItems: "center", background: "#fafafa",
          color: "#64748b", fontWeight: 500,
        }}>
          Loading…
        </div>
      ) : error ? (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>
          Failed to load categories: {error}
        </div>
      ) : (
        <TopCategoriesTreemap rows={rows} height={height} />
      )}
    </section>
  );
}
