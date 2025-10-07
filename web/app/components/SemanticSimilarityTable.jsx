// components/SemanticSimilarityTable.jsx
import { COLORS, TEXT, TREEMAP } from "@/app/theme";

const COLS = [{ key: "productId", width: 180 }, ...Array.from({ length: 10 }, (_, i) => ({
  key: `top${i + 1}`,
  width: 140,
}))];

export default function SemanticSimilarityTable({ rows = [] }) {
  return (
    <div style={{
      border: `1px solid ${TREEMAP.containerBorder}`,
      borderRadius: TREEMAP.containerRadius,
      overflow: "hidden",
      fontFamily: TEXT.family,
      color: TEXT.color,
      fontSize: TEXT.size,
    }}>
      <div style={{ maxHeight: 360, overflowY: "auto", overflowX: "auto" }}>
        <table style={{
          width: "100%",
          minWidth: 180 + 10 * 140,
          borderCollapse: "separate",
          borderSpacing: 0,
          tableLayout: "fixed",
        }}>
          <colgroup>
            {COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}
          </colgroup>

          <thead style={{ background: "#fff" }}>
            <tr>
              <th style={thSticky}>Product ID</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={`h${i}`} style={thSticky}>{`Top ${i + 1}`}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.productId}>
                  <td style={tdMonoNowrap} title={r.productId}>{r.productId}</td>
                  {(r.tops || []).map((v, i) => (
                    <td key={`${r.productId}-t${i}`} style={tdMonoNowrap} title={v || ""}>
                      {v || <span style={{ opacity: 0.5 }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} style={{ ...td, textAlign: "center", color: COLORS.text }}>
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
