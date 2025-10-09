// TopRepurchaseTable.jsx
"use client";

import { fmtInt } from "../utils/formatters";
import { COLORS, TEXT, TREEMAP } from "@/app/theme";
import PdpPreviewLink from "@/app/components/ui/PdpPreviewLink";

export default function TopRepurchaseTable({ rows = [], maxHeight = 360 }) {
  return (
    <div
      style={{
        border: `1px solid ${TREEMAP.containerBorder}`,
        borderRadius: TREEMAP.containerRadius,
        overflow: "hidden",
        fontFamily: TEXT.family,
        color: TEXT.color,
        fontSize: TEXT.size,
        background: "#fff",
      }}
    >
      <div style={{ maxHeight, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={thSticky}>#</th>
              <th style={thSticky}>Product</th>
              <th style={thSticky}>Brand</th>
              <th style={thSticky}>Article</th>
              <th style={thRightSticky}>Customers</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => {
                const id = r.product_id ?? r.value;
                return (
                  <tr key={`${id}-${r.rank}`}>
                    <td style={td}>{r.rank}</td>
                    <td style={td}>{r.product}</td>
                    <td style={td}>{r.brand ?? "—"}</td>
                    <td style={tdMono} title={id}>
                      {id ? <PdpPreviewLink id={id}>{id}</PdpPreviewLink> : "—"}
                    </td>
                    <td style={tdRight}>{fmtInt(r.repurchasers)}</td>
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
    </div>
  );
}

// Styles
const cellBase = { padding: "12px 14px", borderBottom: `1px solid ${TREEMAP.containerBorder}` };
const th = { ...cellBase, textAlign: "left", fontWeight: 600, background: "#fff" };
const thRight = { ...th, textAlign: "right" };
const sticky = { position: "sticky", top: 0, zIndex: 1 };

const thSticky = { ...th, ...sticky };
const thRightSticky = { ...thRight, ...sticky };

const td = { ...cellBase, background: "#fff" };
const tdRight = { ...td, textAlign: "right" };
const tdMono = {
  ...td,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
