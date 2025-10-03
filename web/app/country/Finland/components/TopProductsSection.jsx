"use client";

import COUNTRY from "../country";
import useTopProducts from "../hooks/useTopProducts";
import TopProductsTable from "./TopProductsTable";
import { TEXT, LAYOUT, SECTION, HEADINGS, UI, BUTTON } from "@/app/theme";

/**
 * TopProductsSection displays a table of top products with year and season selectors.
 */
export default function TopProductsSection({
  country = COUNTRY,
  limit = 100,
  title = `${COUNTRY} · Top products by season/year`,
}) {
  const {
    rows, loading, error,
    years, seasonsForSelectedYear,
    year, setYear, season, setSeason,
  } = useTopProducts(country, limit);

  return (
    <section style={{ ...SECTION.container(LAYOUT), position: "relative", isolation: "isolate" }}>
      <div style={SECTION.header(TEXT)}>
        <h3 style={HEADINGS.h3}>{title}</h3>
        <div style={{ display: "flex", gap: LAYOUT.sectionGap }}>
          <select
            aria-label="Year"
            value={year ?? ""}
            onChange={e => setYear(Number(e.target.value))}
            style={selectStyle}
            disabled={loading}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            aria-label="Season"
            value={season ?? ""}
            onChange={e => setSeason(e.target.value)}
            style={selectStyle}
            disabled={loading}
          >
            {seasonsForSelectedYear.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div style={{ fontFamily: TEXT.family, color: UI.text.primary }}>Loading…</div>
      ) : error ? (
        <div style={{ fontFamily: TEXT.family, color: "#dc2626", fontWeight: 600 }}>
          {String(error)}
        </div>
      ) : (
        <TopProductsTable rows={rows} />
      )}
    </section>
  );
}

// Theme-based select style
const selectStyle = {
  ...BUTTON.base,
  padding: UI.button.padding,
  border: `1px solid ${UI.button.border}`,
  borderRadius: UI.button.radius,
  background: UI.surface.bg,
  fontFamily: TEXT.family,
  fontSize: TEXT.size,
  color: TEXT.color,
};
