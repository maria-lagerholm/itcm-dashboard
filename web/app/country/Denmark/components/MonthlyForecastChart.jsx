// app/country/Denmark/components/MonthlyForecastChart.jsx
"use client";

import COUNTRY from "../country";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Scatter,
} from "recharts";
import {
  COLORS, CARD, TEXT, CHART, TOOLTIP, LAYOUT, SECTION, UI,
} from "../../../theme";
import { fmtInt } from "../utils/formatters";

// ---- helpers ----
function addMonths(ym, n) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + n);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}
const prevYearYM = (ym) => addMonths(ym, -12);

function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// tiny horizontal marker = previous year's value
function PrevYearTick({ cx, cy }) {
  if (cx == null || cy == null) return null;
  return (
    <line
      x1={cx - 12} y1={cy} x2={cx + 12} y2={cy}
      stroke={TEXT.color} strokeWidth={2}
    />
  );
}

// themed tooltip (no month label)
function CurrentYearTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const byKey = Object.fromEntries(payload.map(p => [p.dataKey, p]));
  const curr = byKey.ksek?.value ?? null;
  const prev = byKey.prev_ksek?.value ?? null;

  return (
    <div
      style={{
        background: TOOLTIP.base.background,
        border:     TOOLTIP.base.border,
        borderRadius: TOOLTIP.base.borderRadius,
        padding:    TOOLTIP.base.padding,
        boxShadow:  TOOLTIP.base.boxShadow,
        fontSize:   TEXT.size,
        color:      TEXT.color,
        fontFamily: TEXT.family,
      }}
    >
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
  const startYM = useMemo(() => addMonths(anchorEndYM, 1), [anchorEndYM]);
  const endYM   = useMemo(() => addMonths(startYM, months - 1), [startYM, months]);

  const [rows, setRows] = useState([]); // [{ month, ksek, prev_ksek }]
  const [loading, setLoading] = useState(true);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const currUrl = `${base}/api/sales_month?start_month=${startYM}`;
    const prevUrl = `${base}/api/sales_month?start_month=${prevYearYM(startYM)}`;

    Promise.all([
      fetch(currUrl).then(r => r.json()).catch(() => null),
      fetch(prevUrl).then(r => r.json()).catch(() => null),
    ]).then(([currJson, prevJson]) => {
      if (cancelled) return;

      const currArr = Array.isArray(currJson?.sales_month_ksek?.[country])
        ? currJson.sales_month_ksek[country] : [];
      const prevArr = Array.isArray(prevJson?.sales_month_ksek?.[country])
        ? prevJson.sales_month_ksek[country] : [];

      const byMonthCurr = new Map(currArr.map(r => [r.month, Number(r.ksek) || 0]));
      const byMonthPrev = new Map(prevArr.map(r => [r.month, Number(r.ksek) || 0]));

      const out = Array.from({ length: months }, (_, i) => {
        const ym = addMonths(startYM, i);
        return {
          month: ym,
          ksek: byMonthCurr.get(ym) ?? 0,
          prev_ksek: byMonthPrev.get(prevYearYM(ym)) ?? null,
        };
      });

      setRows(out);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      const out = Array.from({ length: months }, (_, i) => ({
        month: addMonths(startYM, i), ksek: 0, prev_ksek: null,
      }));
      setRows(out);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [base, country, startYM, months]);

  return (
    <section style={SECTION.container(LAYOUT)}>
      {/* Subtitle/header */}
      <div style={SECTION.header(TEXT)}>
        <div style={{ fontFamily: TEXT.family, color: TEXT.color, opacity: 0.7, fontSize: TEXT.size }}>
          {monthLabel(startYM)} – {monthLabel(endYM)} (Current year)
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%", height: 320,
          border: CARD.border, borderRadius: CARD.radius, background: CARD.bg,
          padding: CARD.padding, boxSizing: "border-box", fontFamily: TEXT.family, position: "relative",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: TEXT.color, opacity: 0.75, fontSize: TEXT.size, marginTop: 80 }}>
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
                  border:     TOOLTIP.base.border,
                  borderRadius: TOOLTIP.base.borderRadius,
                  padding:    TOOLTIP.base.padding,
                  boxShadow:  TOOLTIP.base.boxShadow,
                  fontSize:   TEXT.size,
                  color:      TEXT.color,
                }}
              />
              {/* bars: current year */}
              <Bar
                dataKey="ksek"
                fill={COLORS.series?.revenue || COLORS.primary}
                radius={CHART.barRadius}
                name="ksek"
              />
              {/* overlay: previous-year marker */}
              <Scatter dataKey="prev_ksek" shape={<PrevYearTick />} name="prev_ksek" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
