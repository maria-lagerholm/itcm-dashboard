// components/Basket_cf_Table.jsx
import { COLORS, TEXT, TREEMAP } from "@/app/theme";

const COLS = [
  { key: "productId", width: 180 },
  ...Array.from({ length: 10 }, (_, i) => ({ key: `top${i + 1}`, width: 140 })),
];

const baseCell = {
  padding: "12px 14px",
  borderBottom: `1px solid ${TREEMAP.containerBorder}`,
  background: "#fff",
};
const thSticky = {
  ...baseCell,
  textAlign: "left",
  fontWeight: 600,
  position: "sticky",
  top: 0,
  zIndex: 1,
};
const tdMono = {
  ...baseCell,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default function Basket_cf_Table({ rows = [] }) {
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
      <div style={{ maxHeight: 360, overflow: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 1580,
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            {COLS.map(col => <col key={col.key} style={{ width: col.width }} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={thSticky}>Product ID</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} style={thSticky}>{`Top ${i + 1}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 && rows.map(row => (
              <tr key={row.productId}>
                <td style={tdMono} title={row.productId}>{row.productId}</td>
                {(row.tops || []).map((v, i) => (
                  <td key={i} style={tdMono} title={v || ""}>
                    {v || <span style={{ opacity: 0.5 }}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} style={{ ...baseCell, textAlign: "center", color: COLORS.text }}>
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
