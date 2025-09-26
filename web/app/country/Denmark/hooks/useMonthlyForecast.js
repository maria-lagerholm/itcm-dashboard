"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBase } from "@/app/lib/apiBase";

// Add n months to YYYY-MM
function addMonths(ym, n) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + n);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
const prevYearYM = (ym) => addMonths(ym, -12);

// "Month YYYY"
function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function useMonthlyForecast({ country, anchorEndYM = "2025-05", months = 12 }) {
  const startYM = useMemo(() => addMonths(anchorEndYM, 1), [anchorEndYM]);
  const endYM   = useMemo(() => addMonths(startYM, months - 1), [startYM, months]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const subtitle = `${monthLabel(startYM)} – ${monthLabel(endYM)} (Current year)`;

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    setLoading(true);

    const base = (apiBase() || "/api").replace(/\/+$/, "");
    const currUrl = `${base}/sales_month?start_month=${encodeURIComponent(startYM)}`;
    const prevUrl = `${base}/sales_month?start_month=${encodeURIComponent(prevYearYM(startYM))}`;

    Promise.all([
      fetch(currUrl, { cache: "no-store", signal: ctrl.signal }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(prevUrl, { cache: "no-store", signal: ctrl.signal }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([currJson, prevJson]) => {
        if (cancelled) return;

        const currArr = Array.isArray(currJson?.sales_month_ksek?.[country])
          ? currJson.sales_month_ksek[country]
          : [];
        const prevArr = Array.isArray(prevJson?.sales_month_ksek?.[country])
          ? prevJson.sales_month_ksek[country]
          : [];

        const byMonthCurr = new Map(currArr.map((r) => [r.month, Number(r.ksek) || 0]));
        const byMonthPrev = new Map(prevArr.map((r) => [r.month, Number(r.ksek) || 0]));

        const nextRows = Array.from({ length: months }, (_, i) => {
          const ym = addMonths(startYM, i);
          return {
            month: ym,
            ksek: byMonthCurr.get(ym) ?? 0,
            prev_ksek: byMonthPrev.get(prevYearYM(ym)) ?? null,
          };
        });

        setRows(nextRows);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRows(Array.from({ length: months }, (_, i) => ({
          month: addMonths(startYM, i), ksek: 0, prev_ksek: null,
        })));
        setLoading(false);
      });

    return () => { cancelled = true; ctrl.abort(); };
  }, [country, startYM, months]);

  return { rows, loading, startYM, endYM, subtitle, monthLabel };
}