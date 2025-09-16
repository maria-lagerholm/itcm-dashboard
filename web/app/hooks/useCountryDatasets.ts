"use client";
import { useEffect, useMemo, useState } from "react";

type RowCustomers = { country: string; count: number };
type RowRevenue = { country: string; ksek: number; aov_sek?: number; orders?: number };

export function useCountryDatasets() {
  const [mode, setMode] = useState<"customers" | "revenue">("customers");
  const [customers, setCustomers] = useState<RowCustomers[]>([]);
  const [revenue, setRevenue] = useState<RowRevenue[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);     // <- NEW
  const [revenueError, setRevenueError] = useState<string | null>(null); // <- optional

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${base}/`)
      .then(r => r.json())
      .then(json => {
        const map = json?.customers_by_country || {};
        const rows = Object.entries(map).map(([country, count]) => ({ country, count: Number(count) }));
        setCustomers(rows);
      })
      .catch(console.error);
  }, [base]);

  useEffect(() => {
    if (mode !== "revenue" || revenue.length) return;
    setRevenueLoading(true);                 // <- start
    setRevenueError(null);
    fetch(`${base}/api/countries_by_revenue`)
      .then(r => r.json())
      .then(json => {
        const revMap = json?.revenue_by_country_ksek || {};
        const aovMap = json?.avg_order_value_by_country_sek || {};
        const ordMap = json?.orders_count_by_country || {};
        const rows = Object.entries(revMap).map(([country, ksek]) => ({
          country,
          ksek: Number(ksek),
          aov_sek: Number(aovMap?.[country] ?? 0),
          orders: Number(ordMap?.[country] ?? 0),
        }));
        rows.sort((a, b) => (b.ksek ?? 0) - (a.ksek ?? 0));
        setRevenue(rows);
      })
      .catch(err => {
        console.error(err);
        setRevenueError("Failed to load revenue");
      })
      .finally(() => setRevenueLoading(false));   // <- done
  }, [mode, revenue.length, base]);

  const data = useMemo(() => (mode === "customers" ? customers : revenue), [mode, customers, revenue]);
  const dataKey = mode === "customers" ? "count" : "ksek";
  const totalRevenueKSEK = useMemo(
    () => (revenue.length ? revenue.reduce((s, r) => s + (r.ksek || 0), 0) : 0),
    [revenue]
  );

  return { mode, setMode, data, dataKey, customers, revenue, totalRevenueKSEK, revenueLoading, revenueError };
}
