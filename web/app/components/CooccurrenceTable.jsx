// components/CooccurrenceTable.jsx
import { COLORS, TEXT, TREEMAP } from "@/app/theme";

export default function CooccurrenceTable({ rows = [] }) {
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
            <col style={{ width: 56 }} />       {/* # */}
            <col style={{ width: "auto" }} />   {/* Product A name */}
            <col style={{ width: 180 }} />      {/* Product A ID */}
            <col style={{ width: "auto" }} />   {/* Product B name */}
            <col style={{ width: 180 }} />      {/* Product B ID */}
          </colgroup>

          <thead style={{ background: "#fff" }}>
            <tr>
              <th style={thSticky}>#</th>
              <th style={thSticky}>Product A</th>
              <th style={thSticky}>Product A ID</th>
              <th style={thSticky}>Product B</th>
              <th style={thSticky}>Product B ID</th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={`${r.aId}-${r.bId}-${r.rank}`}>
                  <td style={td}>{r.rank}</td>
                  <td style={td}>{r.aName}</td>
                  <td style={tdMonoNowrap} title={r.aId}>{r.aId}</td>
                  <td style={td}>{r.bName}</td>
                  <td style={tdMonoNowrap} title={r.bId}>{r.bId}</td>
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

// Table cell styles
const cellBase = { padding: "12px 14px", borderBottom: `1px solid ${TREEMAP.containerBorder}` };
const stickyBase = { position: "sticky", top: 0, background: "#fff", zIndex: 1 };

const th = { ...cellBase, textAlign: "left", fontWeight: 600 };
const thSticky = { ...th, ...stickyBase };

const td = { ...cellBase, background: "#fff" };

// ID cells: one line with ellipsis
const tdMonoNowrap = {
  ...td,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
