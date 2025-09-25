// app/country/Denmark/components/MonthlySalesChart.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import COUNTRY from "../country";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  COLORS, CARD, TEXT, CHART, TOOLTIP, LAYOUT, SECTION,
} from "../../../theme"; // adjust path if needed
import { fmtInt } from "../utils/formatters";

// Inclusive month range: "YYYY-MM" -> "YYYY-MM"
function buildMonthRange(startYM, endYM) {
  const [sy, sm] = startYM.split("-").map(Number);
  const [ey, em] = endYM.split("-").map(Number);
  const out = [];
  let y = sy, m = sm;
  while (y < ey || (y === ey && m <= em)) {
    const mm = String(m).padStart(2, "0");
    out.push(`${y}-${mm}`);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

// "YYYY-MM" -> "June 2024"
function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function MonthlySalesChart({
  country = COUNTRY,
  startYM = "2024-06",
  endYM   = "2025-05",
  title = `${country} · Monthly revenue (KSEK)`,
  subtitle,           // optional
  showTitle = true,   // default true
}) {
  const monthsWanted = useMemo(() => buildMonthRange(startYM, endYM), [startYM, endYM]);

  const [rows, setRows] = useState([]); // [{ month, ksek, label }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const sub = subtitle ?? `${monthLabel(startYM)} – ${monthLabel(endYM)}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`${base}/api/sales_month?start_month=${startYM}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const map = json?.sales_month_ksek || {};
        const arr = Array.isArray(map?.[country]) ? map[country] : [];

        const byMonth = new Map(arr.map((r) => [r.month, Number(r.ksek) || 0]));
        const series = monthsWanted.map((ym) => ({
          month: ym,
          ksek: byMonth.get(ym) ?? 0,
          label: monthLabel(ym),
        }));
        setRows(series);
      })
      .catch(() => setError("Failed to load monthly sales"))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [base, startYM, endYM, monthsWanted, country]);

  return (
    <section style={SECTION.container(LAYOUT)}>
      {/* Header (subtitle only, like your original) */}
      <div style={SECTION.header(TEXT)}>
        <div style={{ fontFamily: TEXT.family, color: TEXT.color, opacity: 0.7, fontSize: TEXT.size }}>
          {sub}
        </div>
      </div>

      {/* Card container */}
      <div
        style={{
          width: "100%", height: 320,
          border: CARD.border, borderRadius: CARD.radius, background: CARD.bg,
          padding: CARD.padding, boxSizing: "border-box", fontFamily: TEXT.family, position: "relative",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: TEXT.color, opacity: 0.75, fontSize: TEXT.size}}>
            Loading monthly sales…
          </div>
        ) : error ? (
          <div style={{ color: "crimson", fontFamily: TEXT.family }}>{error}</div>
        ) : (
          <ResponsiveContainer>
            <BarChart data={rows} margin={CHART.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: CHART.tickFont }}
                tickLine={false}
                axisLine={false}
                angle={-15}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: CHART.tickFont }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtInt}
              />
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
                  color: TEXT.color,
                }}
                formatter={(v) => [`${fmtInt(v)} KSEK`, "Revenue"]}
              />
              <Bar
                dataKey="ksek"
                fill={COLORS.series.revenue}
                radius={CHART.barRadius}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
