"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { COLORS, CHART } from "../../theme";

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

// "YYYY-MM" -> English locale label (e.g., "June 2024")
function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  // Use English locale
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const fmt = (n) => Number(n ?? 0).toLocaleString("en-US");

/**
 * Monthly revenue (KSEK) chart for Finland and month span.
 * Props:
 *  - country: "Finland"
 *  - startYM: "YYYY-MM"
 *  - endYM:   "YYYY-MM"
 */
export default function MonthlySalesChart({
  country = "Finland",
  startYM = "2024-06",
  endYM = "2025-05",
  title = `${"Finland"} · Monthly Revenue (KSEK)`,
  subtitle, // optional custom subtitle
}) {
  const monthsWanted = useMemo(() => buildMonthRange(startYM, endYM), [startYM, endYM]);

  const [rows, setRows] = useState([]); // [{ month, ksek, label }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`${base}/api/sales_month?start_month=${startYM}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const map = json?.sales_month_ksek || {};
        // Use Finland
        const arr = Array.isArray(map?.["Finland"]) ? map["Finland"] : [];

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
  }, [base, startYM, endYM, monthsWanted]);

  const sub = subtitle ?? `${monthLabel(startYM)} – ${monthLabel(endYM)}`;

  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ color: "#64748b", fontSize: 13 }}>{sub}</div>
      </div>

      {loading ? (
        <div style={{
          width: "100%", height: 360, border: "1px solid #eee",
          borderRadius: 8, display: "grid", placeItems: "center", background: "#fafafa"
        }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>Loading monthly sales…</div>
        </div>
      ) : error ? (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>
      ) : (
        <div style={{ width: "100%", height: 360, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
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
        </div>
      )}
    </section>
  );
}
