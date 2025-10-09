// components/ComplementsTable.jsx
"use client";

import { COLORS, TEXT, TREEMAP } from "@/app/theme";
import PdpPreviewLink from "./ui/PdpPreviewLink";

const COLS = [
  { key: "rank", width: 56 },
  { key: "aName", width: "auto" },
  { key: "aId", width: 180 },
  { key: "bName", width: "auto" },
  { key: "bId", width: 180 },
];

function ComplementsTable({ rows = [] }) {
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
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            {COLS.map(c => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>

          <thead style={{ background: "#fff" }}>
            <tr>
              <th style={thSticky}>#</th>
              <th style={thSticky}>Product A Name</th>
              <th style={thSticky}>Product A ID</th>
              <th style={thSticky}>Product B Name</th>
              <th style={thSticky}>Product B ID</th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map(r => (
                <tr key={`${r.aId}-${r.bId}-${r.rank}`}>
                  <td style={td}>{r.rank}</td>
                  {/* Names: plain text */}
                  <td style={td}>{r.aName || r.aId}</td>
                  {/* IDs: clickable with preview */}
                  <td style={tdMonoNowrap} title={r.aId}>
                    <PdpPreviewLink id={r.aId}>{r.aId}</PdpPreviewLink>
                  </td>
                  <td style={td}>{r.bName || r.bId}</td>
                  <td style={tdMonoNowrap} title={r.bId}>
                    <PdpPreviewLink id={r.bId}>{r.bId}</PdpPreviewLink>
                  </td>
                </tr>
              ))
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

// styles
const cellBase = { padding: "12px 14px", borderBottom: `1px solid ${TREEMAP.containerBorder}` };
const stickyBase = { position: "sticky", top: 0, background: "#fff", zIndex: 1 };
const th = { ...cellBase, textAlign: "left", fontWeight: 600 };
const thSticky = { ...th, ...stickyBase };
const td = { ...cellBase, background: "#fff" };
const tdMonoNowrap = {
  ...td,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default ComplementsTable;
