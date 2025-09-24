"use client";

import useTopRepurchase from "../hooks/useTopRepurchase";
import TopRepurchaseTable from "./TopRepurchaseTable";
import { TEXT, LAYOUT } from "@/app/theme";

export default function TopRepurchaseSection({ country = "Denmark", limit = 10, title = "Denmark ·Products customers buy again (Top pick)" }) {
  const { rows, loading, error } = useTopRepurchase(country, limit);

  return (
    <section
      style={{
        display: "grid",
        gap: LAYOUT.sectionGap,
        margin: 0,                 // spacing is provided by parent page grid gap
        position: "relative",
        isolation: "isolate",      // prevent any overlap from neighbors
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
          color: TEXT.color,
        }}
      >
        <h3>{title}</h3>
      </div>

      {loading ? (
        <div style={{ fontFamily: TEXT.family }}>Loading…</div>
      ) : error ? (
        <div style={{ color: "crimson", fontFamily: TEXT.family }}>{String(error)}</div>
      ) : (
        <TopRepurchaseTable rows={rows} />
      )}
    </section>
  );
}