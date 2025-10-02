// components/CooccurrenceSection.jsx
"use client";

import useCooccurrence from "../hooks/useCooccurrence";
import CooccurrenceTable from "./CooccurrenceTable";
import { TEXT, LAYOUT, SECTION, HEADINGS, UI } from "@/app/theme";

export default function CooccurrenceSection({
  title = "Frequently Bought Together (pairs, sorted by affinity strength)",
}) {
  const { rows, loading, error } = useCooccurrence();

  return (
    <section style={{ ...SECTION.container(LAYOUT), position: "relative", isolation: "isolate" }}>
      <div style={SECTION.header(TEXT)}>
        <h3 style={HEADINGS.h3}>{title}</h3>
        {/* no controls */}
      </div>

      {loading ? (
        <div style={{ fontFamily: TEXT.family, color: UI.text.primary }}>Loading…</div>
      ) : error ? (
        <div style={{ fontFamily: TEXT.family, color: "#dc2626", fontWeight: 600 }}>
          {String(error)}
        </div>
      ) : (
        <CooccurrenceTable rows={rows} />
      )}
    </section>
  );
}