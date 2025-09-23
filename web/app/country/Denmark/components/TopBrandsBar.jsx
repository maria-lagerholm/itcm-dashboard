// app/country/Denmark/components/TopBrandsBar.jsx
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { fmtInt } from "../utils/formatters";

const BAR_COLOR = "#2a9d92";
const TEXT = "#000";
const GRID = "#e5e7eb";
const FONT_SIZE = 14;

function Tip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${GRID}`,
        borderRadius: 8,                  // ← rounded corners
        padding: "8px 10px",
        fontSize: FONT_SIZE,
        color: TEXT,
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.brand}</div>
      <div><strong>Transactions:</strong> {fmtInt(p.count)}</div>
      <div><strong>Share:</strong> {p.share.toFixed(1)}%</div>
    </div>
  );
}

/** rows: [{ brand, count, rank }] */
export default function TopBrandsBar({ rows = [], height = 280 }) {
  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
  const data = [...rows]
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .map((r) => ({
      brand: r.brand,
      count: Number(r.count) || 0,
      share: total ? (Number(r.count) / total) * 100 : 0,
    }));

  if (!data.length) {
    return (
      <div
        style={{
          width: "100%",
          height,
          border: `1px solid ${GRID}`,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          background: "#fafafa",
          color: TEXT,
          fontSize: FONT_SIZE,
        }}
      >
        No data
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height,
        border: `1px solid ${GRID}`,
        borderRadius: 8,
        padding: 12,
        boxSizing: "border-box",
        color: TEXT,
        fontSize: FONT_SIZE,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          barCategoryGap="18%"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke={GRID} />
          <XAxis
            type="number"
            domain={[0, "dataMax"]}
            allowDecimals={false}
            tick={{ fontSize: FONT_SIZE, fill: TEXT }}
            axisLine={{ stroke: GRID }}
            tickFormatter={fmtInt}
          />
          <YAxis
            type="category"
            dataKey="brand"
            width={160}
            tick={{ fontSize: FONT_SIZE, fill: TEXT }}
            axisLine={{ stroke: GRID }}
            tickLine={false}
            interval={0}
          />
          <Tooltip content={<Tip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />

          {/* Bars only — no inline labels; all details via tooltip */}
          <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 6, 6]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
