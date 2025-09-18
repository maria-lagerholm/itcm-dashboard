"use client";
import { useEffect, useMemo, useState } from "react";

type RowCustomers = { country: string; count: number };
type RowRevenue = { country: string; ksek: number; aov_sek?: number; orders?: number };
type RowSegments = { country: string; New: number; Repeat: number; Loyal: number; total: number };

export function useCountryDatasets() {
  const [mode, setMode] = useState<"customers" | "revenue">("customers");
  const [customers, setCustomers] = useState<RowCustomers[]>([]);
  const [revenue, setRevenue] = useState<RowRevenue[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // NEW: segments state
  const [segmentsRows, setSegmentsRows] = useState<RowSegments[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentsError, setSegmentsError] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Customers (existing)
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

  // Revenue (existing)
  useEffect(() => {
    if (mode !== "revenue" || revenue.length) return;
    setRevenueLoading(true);
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
      .catch(() => setRevenueError("Failed to load revenue"))
      .finally(() => setRevenueLoading(false));
  }, [mode, revenue.length, base]);

  // NEW: Segments (New / Repeat / Loyal) – load once
  useEffect(() => {
    setSegmentsLoading(true);
    setSegmentsError(null);
    fetch(`${base}/api/countries/segments`)
      .then(r => r.json())
      .then(json => {
        const map = json?.segments_by_country || {};
        const rows: RowSegments[] = [];
        for (const [country, obj] of Object.entries<any>(map)) {
          const seg = obj?.segments || {};
          const New = Number(seg?.New?.count ?? 0);
          const Repeat = Number(seg?.Repeat?.count ?? 0);
          const Loyal = Number(seg?.Loyal?.count ?? 0);
          const total = New + Repeat + Loyal;
          rows.push({ country, New, Repeat, Loyal, total });
        }
        // sort by total desc
        rows.sort((a, b) => b.total - a.total);
        setSegmentsRows(rows);
      })
      .catch(() => setSegmentsError("Failed to load segments"))
      .finally(() => setSegmentsLoading(false));
  }, [base]);

  // Your main chart still uses `mode` to switch dataset
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
    mode, setMode,
    data, dataKey,
    customers, revenue,
    totalRevenueKSEK,
    revenueLoading, revenueError,

    // expose segments for the stacked chart on customers view
    segmentsRows, segmentsLoading, segmentsError,
  };
}