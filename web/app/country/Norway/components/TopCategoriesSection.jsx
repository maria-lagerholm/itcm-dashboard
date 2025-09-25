// app/country/Denmark/components/TopCategoriesSection.jsx
"use client";

import COUNTRY from "../country";
import TopCategoriesTreemap from "./TopCategoriesTreemap";
import { useTopCategories } from "../hooks/useTopCategories";
import {
  TEXT, TREEMAP, LAYOUT, UI, CARD, HEADINGS, SECTION, BUTTON,
} from "@/app/theme";

export default function TopCategoriesSection({
  country = COUNTRY,
  limit = 12,
  height = 300,
  title = `${COUNTRY} · Top categories`,
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
        ...SECTION.container(LAYOUT),
        marginBottom: LAYOUT.sectionMarginY,
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* Header + controls */}
      <div style={SECTION.header(TEXT)}>
        <h3>{title}</h3>

        <div style={{ marginLeft: "auto", display: "flex", gap: LAYOUT.sectionGap }}>
          {/* Year */}
          <label style={visuallyHidden} htmlFor="topcat-year">Year</label>
          <select
            id="topcat-year"
            aria-label="Year"
            disabled={loading}
            value={year ?? ""}
            onChange={(e) => setYear(Number(e.target.value))}
            style={selectStyle}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Season */}
          <label style={visuallyHidden} htmlFor="topcat-season">Season</label>
          <select
            id="topcat-season"
            aria-label="Season"
            disabled={loading}
            value={season ?? ""}
            onChange={(e) => setSeason(e.target.value)}
            style={selectStyle}
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
        <div style={{ fontFamily: TEXT.family, color: "#dc2626", fontWeight: 600 }}>
          {String(error)}
        </div>
      ) : (
        <TopCategoriesTreemap rows={rows} height={height} />
      )}
    </section>
  );
}

/* ——— styles via theme ——— */

const selectStyle = {
  ...BUTTON.base,
  padding: UI.button.padding,               // from theme
  border: `1px solid ${UI.button.border}`,
  borderRadius: UI.button.radius,
  background: "#fff",
  fontFamily: TEXT.family,
  fontSize: TEXT.size,
  color: TEXT.color,
};

const loadingBox = (h) => ({
  width: "100%",
  height: h,
  border: CARD.border ?? `1px solid ${TREEMAP.containerBorder}`,
  borderRadius: TREEMAP.containerRadius,
  display: "grid",
  placeItems: "center",
  background: TREEMAP.emptyBg,
  color: UI.text?.muted ?? "#64748b",
  fontWeight: UI.text?.weightSemibold ?? 600,
  fontFamily: TEXT.family,
});

/* Accessibility helper for hidden labels (keeps them for screen readers) */
const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};
