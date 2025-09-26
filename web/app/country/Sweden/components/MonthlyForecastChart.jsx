"use client";

import COUNTRY from "../country";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Scatter,
} from "recharts";
import { COLORS, CARD, TEXT, CHART, TOOLTIP, LAYOUT, SECTION, UI } from "../../../theme";
import { fmtInt } from "../utils/formatters";
import { useMonthlyForecast } from "../hooks/useMonthlyForecast";

// Prev-year tick mark
function PrevYearTick({ cx, cy }) {
  if (cx == null || cy == null) return null;
  return <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke={TEXT.color} strokeWidth={2} />;
}

// Tooltip
function CurrentYearTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const byKey = Object.fromEntries(payload.map((p) => [p.dataKey, p]));
  const curr = byKey.ksek?.value;
  const prev = byKey.prev_ksek?.value;
  return (
    <div style={{
      background: TOOLTIP.base.background,
      border: TOOLTIP.base.border,
      borderRadius: TOOLTIP.base.borderRadius,
      padding: TOOLTIP.base.padding,
      boxShadow: TOOLTIP.base.boxShadow,
      fontSize: TEXT.size,
      color: TEXT.color,
      fontFamily: TEXT.family,
    }}>
      {curr != null && <div>Current year: {fmtInt(curr)} KSEK</div>}
      {prev != null && <div>Prev year: {fmtInt(prev)} KSEK</div>}
    </div>
  );
}

export default function MonthlyForecastChart({
  country = COUNTRY,
  anchorEndYM = "2025-05",
  months = 12,
}) {
  const { rows, loading, startYM, endYM, subtitle, monthLabel } =
    useMonthlyForecast({ country, anchorEndYM, months });

  return (
    <section style={SECTION.container(LAYOUT)}>
      <div style={SECTION.header(TEXT)}>
        <div style={{ fontFamily: TEXT.family, color: TEXT.color, opacity: 0.7, fontSize: TEXT.size }}>
          {subtitle}
        </div>
      </div>

      <div style={{
        width: "100%", height: 320,
        border: CARD.border, borderRadius: CARD.radius, background: CARD.bg,
        padding: CARD.padding, boxSizing: "border-box", fontFamily: TEXT.family, position: "relative",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", color: TEXT.color, opacity: 0.75, fontSize: TEXT.size }}>
            Loading current year…
          </div>
        ) : (
          <ResponsiveContainer>
            <ComposedChart data={rows} margin={CHART.margin}>
              <CartesianGrid strokeDasharray={UI.grid.strokeDasharray} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: CHART.tickFont }}
                tickLine={false}
                axisLine={false}
                angle={-15}
                dy={10}
                tickFormatter={monthLabel}
              />
              <YAxis
                tick={{ fontSize: CHART.tickFont }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtInt}
              />
              <Tooltip
                content={<CurrentYearTooltip />}
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
                wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                contentStyle={{
                  background: TOOLTIP.base.background,
                  border: TOOLTIP.base.border,
                  borderRadius: TOOLTIP.base.borderRadius,
                  padding: TOOLTIP.base.padding,
                  boxShadow: TOOLTIP.base.boxShadow,
                  fontSize: TEXT.size,
                  color: TEXT.color,
                }}
              />
              <Bar dataKey="ksek" fill={COLORS.series.revenue} radius={CHART.barRadius} name="ksek" />
              <Scatter dataKey="prev_ksek" shape={<PrevYearTick />} name="prev_ksek" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}