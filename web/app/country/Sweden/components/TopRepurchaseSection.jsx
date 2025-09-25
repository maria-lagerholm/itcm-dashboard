// app/country/Denmark/components/TopRepurchaseSection.jsx
"use client";

import COUNTRY from "../country";
import useTopRepurchase from "../hooks/useTopRepurchase";
import TopRepurchaseTable from "./TopRepurchaseTable";
import { TEXT, LAYOUT, SECTION, HEADINGS, UI, COLORS } from "@/app/theme";

export default function TopRepurchaseSection({
  country = COUNTRY,
  limit = 10,
  title = COUNTRY + " · Products customers buy again (Top pick)",
}) {
  const { rows, loading, error } = useTopRepurchase(country, limit);

  return (
    <section
      style={{
        display: "grid",
        gap: LAYOUT.sectionGap,
        position: "relative",
        isolation: "isolate",
      }}
    >
      <div style={SECTION.header(TEXT)}>
        <h3>{title}</h3>
      </div>

      {loading ? (
        <div style={{ fontFamily: TEXT.family, color: UI.text.primary }}>Loading…</div>
      ) : error ? (
        <div style={{ fontFamily: TEXT.family, color: COLORS.quaternary, fontWeight: UI.text.weightSemibold }}>
          {String(error)}
        </div>
      ) : (
        <TopRepurchaseTable rows={rows} />
      )}
    </section>
  );
}
