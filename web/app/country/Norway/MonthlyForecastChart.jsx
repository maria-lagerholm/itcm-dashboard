"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { COLORS, CHART } from "../../theme";

// Add N months to a YYYY-MM
function addMonths(ym, n) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + n);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function buildMonthRange(startYM, months) {
  const out = [];
  for (let i = 0; i < months; i++) out.push(addMonths(startYM, i));
  return out;
}

function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  // Use English locale everywhere
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const fmt = (n) => Number(n ?? 0).toLocaleString("en-US");

/**
 * Next-12-months placeholder chart.
 * Props:
 *  - country: "Finland"
 *  - anchorEndYM: last month shown in the previous chart (e.g., "2025-05")
 * This chart starts at anchorEndYM + 1 month and shows 12 months ahead.
 */
export default function MonthlyForecastChart({
  country = "Finland",
  anchorEndYM = "2025-05",
  months = 12,
  title = `${"Finland"} · Monthly Revenue (KSEK)`,
}) {
  const startYM = useMemo(() => addMonths(anchorEndYM, 1), [anchorEndYM]);
  const monthsWanted = useMemo(() => buildMonthRange(startYM, months), [startYM, months]);
  const endYM = useMemo(() => addMonths(startYM, months - 1), [startYM, months]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Try to fetch in case any future months already exist in data
    fetch(`${base}/api/sales_month?start_month=${startYM}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const map = json?.sales_month_ksek || {};
        const arr = Array.isArray(map?.[country]) ? map[country] : [];

        const byMonth = new Map(arr.map((r) => [r.month, Number(r.ksek) || 0]));
        const series = monthsWanted.map((ym) => ({
          month: ym,
          ksek: byMonth.get(ym) ?? 0, // default 0 for placeholders
          label: monthLabel(ym),
        }));

        setRows(series);
        setLoading(false);
      })
      .catch(() => {
        // On error, still show placeholders (all zeros)
        const series = monthsWanted.map((ym) => ({
          month: ym,
          ksek: 0,
          label: monthLabel(ym),
        }));
        setRows(series);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [base, country, monthsWanted, startYM]);

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ color: "#64748b", fontSize: 13 }}>
          {monthLabel(startYM)} – {monthLabel(endYM)}
        </div>
      </div>

      <div style={{ width: "100%", height: 320, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginTop: 80 }}>
            Loading forecast…
          </div>
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
                tickFormatter={fmt}
              />
              <Tooltip
                formatter={(v) => [`${fmt(v)} KSEK`]}
                labelFormatter={(l) => l}
                cursor={false}
              />
              <Bar
                dataKey="ksek"
                fill={COLORS.series?.revenue || COLORS.primary}
                radius={CHART.barRadius}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
