"use client";

import { fmtInt } from "../utils/formatters";
import { COLORS, TEXT, TREEMAP } from "@/app/theme";

/**
 * Renders a table of top products.
 * @param {Array} rows - Array of product data objects.
 */
export default function TopProductsTable({ rows = [] }) {
  return (
    <div
      style={{
        border: `1px solid ${TREEMAP.containerBorder}`,
        borderRadius: TREEMAP.containerRadius,
        overflow: "hidden",
        fontFamily: TEXT.family,
        color: TEXT.color,
        fontSize: TEXT.size,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead style={{ background: "#fff" }}>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Product</th>
            <th style={th}>Brand</th>
            <th style={th}>Article</th>
            <th style={thRight}>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map(r => {
              const id = r.product_id ?? r.value;
              return (
                <tr key={`${id}-${r.rank}`}>
                  <td style={td}>{r.rank}</td>
                  <td style={td}>{r.product}</td>
                  <td style={td}>{r.brand ?? "—"}</td>
                  <td style={td}>{id}</td>
                  <td style={tdRight}>{fmtInt(r.count)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} style={{ ...td, textAlign: "center", color: COLORS.text }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Table cell styles
const cellBase = { padding: "12px 14px", borderBottom: `1px solid ${TREEMAP.containerBorder}` };
const th = { ...cellBase, textAlign: "left", fontWeight: 600 };
const thRight = { ...th, textAlign: "right" };
const td = { ...cellBase, background: "#fff" };
const tdRight = { ...td, textAlign: "right" };
