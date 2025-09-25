// app/country/Denmark/components/TopBrandsSection.jsx
"use client";

import COUNTRY from "../country";
import TopBrandsBar from "./TopBrandsBar";
import { useTopBrands } from "../hooks/useTopBrands";
import { FLOW, SECTION, HEADINGS, TEXT, CARD, UI, COLORS } from "@/app/theme";

export default function TopBrandsSection({
  country = COUNTRY,
  limit = 10,
  height = 280,
  title, // optional; will fallback below
}) {
  const {
    rows: brandRows = [],
    loading = true,
    error = null,
  } = useTopBrands(country, limit) ?? {};

  const heading = title ?? `${country} · Top brands`;

  return (
    <section style={FLOW.section}>
      {/* header */}
      <div style={SECTION.header(TEXT)}>
        <h3 style={HEADINGS.h3}>{heading}</h3>
      </div>

      {/* body */}
      {loading ? (
        <div
          style={{
            width: "100%",
            height,
            border: CARD.border,
            borderRadius: CARD.radius,
            display: "grid",
            placeItems: "center",
            background: UI.surface.subtle,
            color: UI.text.primary,
            fontFamily: TEXT.family,
            fontSize: TEXT.size,
            fontWeight: 500,
          }}
        >
          Loading…
        </div>
      ) : error ? (
        <div
          style={{
            border: CARD.border,
            borderRadius: CARD.radius,
            padding: CARD.padding,
            color: COLORS.quaternary,
            fontFamily: TEXT.family,
            fontSize: TEXT.size,
            fontWeight: UI.text.weightSemibold,
          }}
        >
          {String(error)}
        </div>
      ) : (
        <TopBrandsBar rows={brandRows} height={height} />
      )}
    </section>
  );
}
