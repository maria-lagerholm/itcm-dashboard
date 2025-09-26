"use client";

import { useEffect, useMemo, useState } from "react";
import { sortByMonthJanToDec } from "../utils/formatters";
import { apiBase } from "@/app/lib/apiBase";

/**
 * Fetches and formats top cities by customers or revenue for a country.
 * Returns: { mode, setMode, data, dataKey, titleSuffix }
 */
export default function useTopCities({ country, countryId, limit = 10 }) {
  const [mode, setMode] = useState("customers"); // "customers" or "revenue"
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();

    const base = (apiBase() || "/api").replace(/\/+$/, "");
    const url = country
      ? `${base}/country/${encodeURIComponent(country)}/top-cities?limit=${limit}`
      : `${base}/country/${encodeURIComponent(countryId ?? "")}/top-cities?limit=${limit}`;

    fetch(url, { cache: "no-store", signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        if (!active) return;
        const list = Array.isArray(json?.top_cities) ? json.top_cities : [];
        setRows(
          list.map((r) => ({
            city: String(r.city ?? ""),
            unique_customers: Number(r.customers_count ?? r.unique_customers ?? 0),
            ksek: Math.round(Number(r.total_revenue_sek ?? 0) / 1000),
            avg_order_value_sek: Number(r.avg_order_value_sek ?? 0),
            month: r.month,
          }))
        );
      })
      .catch(() => {
        if (active) setRows([]);
      });

    return () => {
      active = false;
      ctrl.abort();
    };
    // base is effectively constant in the browser
  }, [country, countryId, limit]);

  const dataKey = mode === "revenue" ? "ksek" : "unique_customers";
  const titleSuffix = mode === "revenue" ? "revenue (KSEK)" : "unique customers";

  const data = useMemo(() => {
    if (rows.length && rows[0]?.month) return sortByMonthJanToDec(rows);
    return rows.slice().sort((a, b) => (b[dataKey] ?? 0) - (a[dataKey] ?? 0));
  }, [rows, dataKey]);

  return { mode, setMode, data, dataKey, titleSuffix };
}
