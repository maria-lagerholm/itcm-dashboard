// app/country/Denmark/hooks/useTopCities.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { sortByMonthJanToDec } from "../utils/formatters";

export default function useTopCities({ country, countryId, limit = 10 }) {
  const [mode, setMode] = useState("customers"); // "customers" | "revenue"
  const [rows, setRows] = useState([]);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    let alive = true;

    // Prefer new country-name route; fallback to legacy id route if not provided
    const key = country ?? countryId ?? "";
    const url =
      country != null
        ? `${base}/api/country/${encodeURIComponent(country)}/top-cities?limit=${limit}`
        : `${base}/api/country/${encodeURIComponent(countryId ?? "")}/top-cities?limit=${limit}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((json) => {
        if (!alive) return;
        const list = Array.isArray(json?.top_cities) ? json.top_cities : [];

        // Normalize to the OLD names the chart expects:
        //  - unique_customers (from customers_count)
        //  - ksek (from total_revenue_sek / 1000)
        const mapped = list.map((r) => ({
          city: String(r.city ?? ""),
          unique_customers: Number(r.customers_count ?? r.unique_customers ?? 0),
          ksek: Math.round(Number(r.total_revenue_sek ?? 0) / 1000),
          avg_order_value_sek: Number(r.avg_order_value_sek ?? 0),
          month: r.month, // keep if present (for the Jan→Dec sort)
        }));

        setRows(mapped);
      })
      .catch(() => alive && setRows([]));

    return () => {
      alive = false;
    };
  }, [base, country, countryId, limit]);

  const dataKey = mode === "revenue" ? "ksek" : "unique_customers";
  const titleSuffix = mode === "revenue" ? "revenue (KSEK)" : "unique customers";

  const data = useMemo(() => {
    const d = rows || [];
    if (d.length && d[0]?.month) return sortByMonthJanToDec(d);
    // nice ordering by active metric
    return d.slice().sort((a, b) => (b[dataKey] ?? 0) - (a[dataKey] ?? 0));
  }, [rows, dataKey]);

  return { mode, setMode, data, dataKey, titleSuffix };
}
