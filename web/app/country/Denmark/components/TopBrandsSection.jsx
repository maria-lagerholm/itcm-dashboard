// app/country/Denmark/components/TopBrandsSection.jsx
"use client";

import COUNTRY from "../country";
import TopBrandsBar from "./TopBrandsBar";
import { useTopBrands } from "../hooks/useTopBrands";

export default function TopBrandsSection({
  country = COUNTRY,
  limit = 10,
  height = 280,
  title = `${COUNTRY} · Top brands`,
}) {
  const {
    rows: brandRows = [],
    loading = true,
    error = null,
  } = useTopBrands(country, limit) ?? {};

  return (
    <section>
      <h3>{title}</h3>

      {loading ? (
        <div
          style={{
            width: "100%",
            height,
            border: "1px solid #eee",
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            background: "#fafafa",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Loading…
        </div>
      ) : error ? (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>
          Failed to load top brands: {error}
        </div>
      ) : (
        <TopBrandsBar rows={brandRows} height={height} />
      )}
    </section>
  );
}
