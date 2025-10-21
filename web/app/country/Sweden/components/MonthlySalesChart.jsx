"use client";

import COUNTRY from "../country";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { COLORS, CARD, TEXT, CHART, TOOLTIP, LAYOUT, SECTION } from "../../../theme";
import { fmtInt } from "../utils/formatters";
import { useMonthlySales } from "../hooks/useMonthlySales";

export default function MonthlySalesChart({
  country = COUNTRY,
  startYM = "2024-06",
  endYM = "2025-05",
  subtitle,          
}) {
  const { rows, loading, error, subtitle: defaultSub } = useMonthlySales({ country, startYM, endYM });
  const sub = subtitle ?? defaultSub;

  return (
    <section style={SECTION.container(LAYOUT)}>
      <div>
       
        <div style={{ fontFamily: TEXT.family, color: TEXT.color, opacity: 0.7, fontSize: TEXT.size }}>
          {sub}
        </div>
      </div>

      <div style={{
        width: "100%", height: 320, border: CARD.border, borderRadius: CARD.radius,
        background: CARD.bg, padding: CARD.padding, boxSizing: "border-box",
        fontFamily: TEXT.family, position: "relative",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", color: TEXT.color, opacity: 0.75, fontSize: TEXT.size }}>
            Loading monthly sales…
          </div>
        ) : error ? (
          <div style={{ color: "crimson", fontFamily: TEXT.family, whiteSpace: "pre-wrap" }}>{error}</div>
        ) : (
          <ResponsiveContainer>
            <BarChart data={rows} margin={CHART.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} angle={-15} dy={10} />
              <YAxis tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} tickFormatter={fmtInt} />
              <Tooltip
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
                wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                contentStyle={{
                  background: TOOLTIP.base.background,
                  border: TOOLTIP.base.border,
                  borderRadius: TOOLTIP.base.borderRadius,
                  padding: TOOLTIP.base.padding,
                  boxShadow: TOOLTIP.base.boxShadow,
                  fontSize: TEXT.size,
                }}
                itemStyle={{ color: TEXT.color }}
                labelStyle={{ color: TEXT.color }}
                formatter={(v) => [`${fmtInt(v)} KSEK`, "Revenue"]}
              />

              <Bar dataKey="ksek" fill={COLORS.series.revenue} radius={CHART.barRadius} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
