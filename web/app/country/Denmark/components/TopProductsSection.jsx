// app/country/Denmark/components/TopProductsSection.jsx
"use client";

import useTopProducts from "../hooks/useTopProducts";
import TopProductsTable from "./TopProductsTable";
import { TEXT, TREEMAP, LAYOUT } from "@/app/theme";

export default function TopProductsSection({ country = "Denmark", limit = 10 }) {
  const { rows, loading, error, years, seasonsForSelectedYear, year, setYear, season, setSeason } =
    useTopProducts(country, limit);

  return (
    <section
      style={{
        display: "grid",
        gap: LAYOUT.sectionGap,
        // Key bits to stop visual overlap from charts above/below:
        marginTop: LAYOUT.sectionMarginY,
        marginBottom: LAYOUT.sectionMarginY,
        position: "relative",
        isolation: "isolate",   // creates a new stacking context
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          fontFamily: TEXT.family,
          fontSize: TEXT.size,
        }}
      >
        <h3>Denmark · Top products by season/year</h3>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <select value={year ?? ""} onChange={(e) => setYear(Number(e.target.value))} style={select}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={season ?? ""} onChange={(e) => setSeason(e.target.value)} style={select}>
            {seasonsForSelectedYear.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ fontFamily: TEXT.family }}>Loading…</div>
      ) : error ? (
        <div style={{ color: "crimson", fontFamily: TEXT.family }}>{String(error)}</div>
      ) : (
        <TopProductsTable rows={rows} />
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
