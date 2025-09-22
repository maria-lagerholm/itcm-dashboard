"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Scatter
} from "recharts";
import { COLORS, CHART } from "../../theme";
import { fmtInt } from "./utils/formatters"; // sv-SE style: 1 000

// --- local helpers (minimal) ---
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

// Tiny horizontal line centered on the bar = previous year's value
function PrevYearTick({ cx, cy }) {
  if (cx == null || cy == null) return null;
  return <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke="#111827" strokeWidth={2} />;
}

// --- custom tooltip: no month label ---
function CurrentYearTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const byKey = Object.fromEntries(payload.map(p => [p.dataKey, p]));
  const curr = byKey.ksek?.value ?? null;
  const prev = byKey.prev_ksek?.value ?? null;

  return (
    <div style={{
      background: "white",
      border: "1px solid #eee",
      borderRadius: 8,
      padding: "8px 10px",
      fontSize: 13,
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>
      {curr != null && <div>Current year: {fmtInt(curr)} KSEK</div>}
      {prev != null && <div>Prev year: {fmtInt(prev)} KSEK</div>}
    </div>
  );
}

export default function MonthlyForecastChart({
  country = "Denmark",
  anchorEndYM = "2025-05",
  months = 12,
}) {
  const startYM = useMemo(() => addMonths(anchorEndYM, 1), [anchorEndYM]); // first month shown
  const endYM   = useMemo(() => addMonths(startYM, months - 1), [startYM, months]);

  const [rows, setRows] = useState([]); // [{ month, ksek, prev_ksek }]
  const [loading, setLoading] = useState(true);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const currUrl = `${base}/api/sales_month?start_month=${startYM}`;          // current year months (may be zeros)
    const prevUrl = `${base}/api/sales_month?start_month=${prevYearYM(startYM)}`; // previous year months

    Promise.all([
      fetch(currUrl).then(r => r.json()).catch(() => null),
      fetch(prevUrl).then(r => r.json()).catch(() => null),
    ])
      .then(([currJson, prevJson]) => {
        if (cancelled) return;

        const currArr = Array.isArray(currJson?.sales_month_ksek?.[country])
          ? currJson.sales_month_ksek[country] : [];
        const prevArr = Array.isArray(prevJson?.sales_month_ksek?.[country])
          ? prevJson.sales_month_ksek[country] : [];

        const byMonthCurr = new Map(currArr.map(r => [r.month, Number(r.ksek) || 0]));
        const byMonthPrev = new Map(prevArr.map(r => [r.month, Number(r.ksek) || 0]));

        // Build only the requested window; no label field needed
        const out = [];
        for (let i = 0; i < months; i++) {
          const ym = addMonths(startYM, i);
          out.push({
            month: ym,
            ksek: byMonthCurr.get(ym) ?? 0,
            prev_ksek: byMonthPrev.get(prevYearYM(ym)) ?? null,
          });
        }

        setRows(out);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        const out = [];
        for (let i = 0; i < months; i++) {
          const ym = addMonths(startYM, i);
          out.push({ month: ym, ksek: 0, prev_ksek: null });
        }
        setRows(out);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [base, country, startYM, months]);

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div style={{ color: "#64748b", fontSize: 13 }}>
          {monthLabel(startYM)} – {monthLabel(endYM)} (Current year)
        </div>
      </div>

      <div style={{ width: "100%", height: 320, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginTop: 80 }}>
            Loading current year…
          </div>
        ) : (
          <ResponsiveContainer>
            <ComposedChart data={rows} margin={CHART.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: CHART.tickFont }}
                tickLine={false}
                axisLine={false}
                angle={-15}
                dy={10}
                tickFormatter={monthLabel}       // show "June 2025" etc.
              />
              <YAxis
                tick={{ fontSize: CHART.tickFont }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtInt}           // 1 000 style
              />
              <Tooltip
                content={<CurrentYearTooltip />}
                cursor={false}
                wrapperStyle={{ fontSize: 13 }}
              />
              {/* Bars = current year */}
              <Bar
                dataKey="ksek"
                fill={COLORS.series?.revenue || COLORS.primary}
                radius={CHART.barRadius}
                name="ksek"
              />
              {/* Overlay: previous-year marker line */}
              <Scatter dataKey="prev_ksek" shape={<PrevYearTick />} name="prev_ksek" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
