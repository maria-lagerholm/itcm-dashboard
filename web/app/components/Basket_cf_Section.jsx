// components/Basket_cf_Section.jsx
"use client";

import useBasket_cf from "../hooks/useBasket_cf";
import Table from "./Table";
import { TEXT, LAYOUT, SECTION, HEADINGS, UI } from "@/app/theme";
import { useState, useMemo } from "react";

export default function Basket_cf_Section({ title = "People who bought this product A also bought product B (AI - machine learning assisted collaborative filtering)" }) {
  const { rows } = useBasket_cf();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => String(r.productId).toLowerCase().includes(s));
  }, [rows, q]);

  return (
    <section style={{ ...SECTION.container(LAYOUT), position: "relative", isolation: "isolate" }}>
      <div style={SECTION.header(TEXT)}>
        <h3 style={HEADINGS.h3}>{title}</h3>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by Product ID…"
          style={{
            fontFamily: TEXT.family,
            fontSize: TEXT.size,
            padding: "8px 10px",
            border: `1px solid ${UI.surface.border || "#e5e7eb"}`,
            borderRadius: 8,
            width: 240,
          }}
          aria-label="Filter by Product ID"
        />
      </div>
      <Table rows={filtered} />
    </section>
  );
}