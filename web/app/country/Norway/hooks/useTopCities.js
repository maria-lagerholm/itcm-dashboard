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
  const base = apiBase();

  useEffect(() => {
    let active = true;
    // Use country name route if available, else fallback to legacy id
    const url = country
      ? `${base}/api/country/${encodeURIComponent(country)}/top-cities?limit=${limit}`
      : `${base}/api/country/${encodeURIComponent(countryId ?? "")}/top-cities?limit=${limit}`;

    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(json => {
        if (!active) return;
        const list = Array.isArray(json?.top_cities) ? json.top_cities : [];
        setRows(
          list.map(r => ({
            city: String(r.city ?? ""),
            unique_customers: Number(r.customers_count ?? r.unique_customers ?? 0),
            ksek: Math.round(Number(r.total_revenue_sek ?? 0) / 1000),
            avg_order_value_sek: Number(r.avg_order_value_sek ?? 0),
            month: r.month,
          }))
        );
      })
      .catch(() => { if (active) setRows([]); });

    return () => { active = false; };
  }, [base, country, countryId, limit]);

  const dataKey = mode === "revenue" ? "ksek" : "unique_customers";
  const titleSuffix = mode === "revenue" ? "revenue (KSEK)" : "unique customers";

  const data = useMemo(() => {
    if (rows.length && rows[0]?.month) return sortByMonthJanToDec(rows);
    return rows.slice().sort((a, b) => (b[dataKey] ?? 0) - (a[dataKey] ?? 0));
  }, [rows, dataKey]);

  return { mode, setMode, data, dataKey, titleSuffix };
}
