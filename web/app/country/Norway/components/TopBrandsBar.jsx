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
import { COLORS, CARD, CHART, TEXT, TOOLTIP, UI } from "../../../theme";

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div
      style={{
        ...TOOLTIP.base,
        color: TEXT.color,
        fontSize: TEXT.size,
        borderRadius: TOOLTIP.cursorRadius,
      }}
    >
      <div><strong>Transactions:</strong> {fmtInt(p.count)}</div>
      <div><strong>Share:</strong> {p.share.toFixed(1)}%</div>
    </div>
  );
}

/** rows: [{ brand, count, rank }] */
export default function TopBrandsBar({
    rows = [],
    height = 280,
    barColor = COLORS.series.brand,
    // new optional overrides just for this chart:
    containerPadding = { top: 12, right: 40, bottom: 8, left: 8 },
    chartMargin = { top: 8, right: 8, bottom: 6, left: 4 },
  }) {
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
              border: CARD.border,
              borderRadius: CARD.radius,
              display: "grid",
              placeItems: "center",
              background: UI.surface.subtle,
              color: TEXT.color,
              fontSize: TEXT.size,
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
            border: CARD.border,
            borderRadius: CARD.radius,
            // ↓ reduce left & bottom padding only here
            padding: `${containerPadding.top}px ${containerPadding.right}px ${containerPadding.bottom}px ${containerPadding.left}px`,
            boxSizing: "border-box",
            color: TEXT.color,
            fontSize: TEXT.size,
            background: CARD.bg,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              barCategoryGap="18%"
            >
              <CartesianGrid
                strokeDasharray={UI.grid.strokeDasharray}
                horizontal
                vertical={false}
                stroke={COLORS.grid}
              />
              <XAxis
                type="number"
                domain={[0, "dataMax"]}
                allowDecimals={false}
                tick={{ fontSize: TEXT.size, fill: TEXT.color, textAnchor: "end" }} // ← left-anchored
                axisLine={{ stroke: COLORS.grid }}
                tickFormatter={fmtInt}
                tickMargin={2}
              />
              <YAxis
                type="category"
                dataKey="brand"
                // ↓ slightly narrower to save left space
                width={140}
                tick={{ fontSize: TEXT.size, fill: TEXT.color }}
                axisLine={{ stroke: COLORS.grid }}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                content={<Tip />}
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
              />
              <Bar dataKey="count" fill={barColor} radius={[6, 6, 6, 6]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
