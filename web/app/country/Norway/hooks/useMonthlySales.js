"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBase } from "@/app/lib/apiBase";

/** Returns an array of "YYYY-MM" strings from startYM to endYM (inclusive) */
function buildMonthRange(startYM, endYM) {
  const [sy, sm] = startYM.split("-").map(Number);
  const [ey, em] = endYM.split("-").map(Number);
  const months = [];
  let y = sy, m = sm;
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

/** Formats "YYYY-MM" as "Month YYYY" */
function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function useMonthlySales({ country, startYM, endYM }) {
  const months = useMemo(() => buildMonthRange(startYM, endYM), [startYM, endYM]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subtitle = `${monthLabel(startYM)} – ${monthLabel(endYM)}`;

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    const base = (apiBase() || "/api").replace(/\/+$/, "");
    const url = `${base}/sales_month?start_month=${encodeURIComponent(startYM)}`;

    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("useMonthlySales →", { url, country });
    }

    fetch(url, { cache: "no-store", signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} @ ${url}${text ? ` · ${text.slice(0,160)}` : ""}`);
        }
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        const bag = json?.sales_month_ksek ?? {};
        const arr = Array.isArray(bag?.[country]) ? bag[country] : [];
        const byMonth = new Map(arr.map((r) => [r.month, Number(r.ksek) || 0]));
        setRows(
          months.map((ym) => ({
            month: ym,
            ksek: byMonth.get(ym) ?? 0,
            label: monthLabel(ym),
          }))
        );
      })
      .catch((e) => { if (!cancelled) setError(e?.message || "Failed to load monthly sales"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; ctrl.abort(); };
  }, [country, startYM, endYM, months]);

  return { rows, loading, error, subtitle };
}
