"use client";

import { useEffect, useMemo, useState } from "react";

type RowCustomers = { country: string; count: number };
type RowRevenue = { country: string; ksek: number };

export function useCountryDatasets() {
  const [mode, setMode] = useState<"customers" | "revenue">("customers");
  const [customers, setCustomers] = useState<RowCustomers[]>([]);
  const [revenue, setRevenue] = useState<RowRevenue[]>([]);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Load customers on mount
  useEffect(() => {
    fetch(`${base}/`)
      .then((r) => r.json())
      .then((json) => {
        const map = json?.customers_by_country || {};
        const rows = Object.entries(map).map(([country, count]) => ({
          country,
          count: Number(count),
        }));
        setCustomers(rows);
      })
      .catch(console.error);
  }, [base]);

  // Lazy-load revenue on first switch to revenue
  useEffect(() => {
    if (mode !== "revenue" || revenue.length) return;
    fetch(`${base}/api/countries_by_revenue`)
      .then((r) => r.json())
      .then((json) => {
        const map = json?.revenue_by_country_ksek || {};
        const rows = Object.entries(map).map(([country, ksek]) => ({
          country,
          ksek: Number(ksek),
        }));
        setRevenue(rows);
      })
      .catch(console.error);
  }, [mode, revenue.length, base]);

  const data = useMemo(
    () => (mode === "customers" ? customers : revenue),
    [mode, customers, revenue]
  );

  const dataKey = mode === "customers" ? "count" : "ksek";

  const totalRevenueKSEK = useMemo(
    () => (revenue.length ? revenue.reduce((s, r) => s + (r.ksek || 0), 0) : 0),
    [revenue]
  );

  return {
    mode,
    setMode,
    data,
    dataKey,
    customers,
    revenue,
    totalRevenueKSEK,
  };
}
