"use client";
import { useEffect, useMemo, useState } from "react";

type RowCustomers = { country: string; count: number };
type RowRevenue = { country: string; ksek: number; aov_sek?: number; orders?: number };
type RowSegments = { country: string; New: number; Repeat: number; Loyal: number; total: number };

type Jsonish = Record<string, unknown>;

// API base URL helper
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
const api = (path: string) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

// Fetch JSON with error handling
async function fetchJsonFlexible(url: string, signal?: AbortSignal): Promise<Jsonish> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal });
  } catch (e: any) {
    throw new Error(`Network error fetching ${url}: ${e?.message || e}`);
  }
  if (!res.ok) {
    const preview = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText || ""} at ${url} · ${preview.slice(0, 160)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (/\bapplication\/json\b/i.test(ct)) return res.json() as Promise<Jsonish>;
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error(`Expected JSON from ${url} but got '${ct || "unknown"}'. First 160 chars: ${txt.slice(0, 160)}`);
  }
}

// Main hook for country datasets
export function useCountryDatasets() {
  const [mode, setMode] = useState<"customers" | "revenue">("customers");

  const [customers, setCustomers] = useState<RowCustomers[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [revenue, setRevenue] = useState<RowRevenue[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  const [segmentsRows, setSegmentsRows] = useState<RowSegments[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentsError, setSegmentsError] = useState<string | null>(null);

  // Fetch customers by country (runs once)
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      setCustomersLoading(true);
      setCustomersError(null);
      try {
        const json = await fetchJsonFlexible(api("/api/customers-by-country"), ctrl.signal);
        const map =
          (json as any)?.customers_by_country ??
          (json as any)?.data?.customers_by_country ??
          (json as any)?.countries?.customers ??
          {};
        const rows = Object.entries(map).map(([country, count]) => ({
          country,
          count: Number(count) || 0,
        })).sort((a, b) => b.count - a.count);
        if (!cancelled) setCustomers(rows);
      } catch (e: any) {
        if (!cancelled) setCustomersError(e?.message || "Failed to load customers");
      } finally {
        if (!cancelled) setCustomersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  // Fetch revenue by country (lazy, only when mode is 'revenue')
  useEffect(() => {
    if (mode !== "revenue" || revenue.length) return;
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      setRevenueLoading(true);
      setRevenueError(null);
      try {
        const json = await fetchJsonFlexible(api("/api/countries_by_revenue"), ctrl.signal);
        const revMap = (json as any)?.revenue_by_country_ksek ?? (json as any)?.data?.revenue_by_country_ksek ?? {};
        const aovMap = (json as any)?.avg_order_value_by_country_sek ?? (json as any)?.data?.avg_order_value_by_country_sek ?? {};
        const ordMap = (json as any)?.orders_count_by_country ?? (json as any)?.data?.orders_count_by_country ?? {};
        const rows: RowRevenue[] = Object.entries(revMap).map(([country, ksek]) => ({
          country,
          ksek: Number(ksek) || 0,
          aov_sek: Number(aovMap?.[country]) || 0,
          orders: Number(ordMap?.[country]) || 0,
        })).sort((a, b) => (b.ksek ?? 0) - (a.ksek ?? 0));
        if (!cancelled) setRevenue(rows);
      } catch (e: any) {
        if (!cancelled) setRevenueError(e?.message || "Failed to load revenue");
      } finally {
        if (!cancelled) setRevenueLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [mode, revenue.length]);

  // Fetch segments by country (runs once)
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      setSegmentsLoading(true);
      setSegmentsError(null);
      try {
        const json = await fetchJsonFlexible(api("/api/countries/segments"), ctrl.signal);
        const map = (json as any)?.segments_by_country ?? (json as any)?.data?.segments_by_country ?? {};
        const rows: RowSegments[] = Object.entries(map).map(([country, obj]: [string, any]) => {
          const seg = obj?.segments ?? {};
          const New = Number(seg?.New?.count ?? 0);
          const Repeat = Number(seg?.Repeat?.count ?? 0);
          const Loyal = Number(seg?.Loyal?.count ?? 0);
          const total = New + Repeat + Loyal;
          return { country, New, Repeat, Loyal, total };
        }).sort((a, b) => b.total - a.total);
        if (!cancelled) setSegmentsRows(rows);
      } catch (e: any) {
        if (!cancelled) setSegmentsError(e?.message || "Failed to load segments");
      } finally {
        if (!cancelled) setSegmentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  // Derived chart data
  const data = useMemo(() => (mode === "customers" ? customers : revenue), [mode, customers, revenue]);
  const dataKey: "count" | "ksek" = mode === "customers" ? "count" : "ksek";
  const totalRevenueKSEK = useMemo(() => revenue.reduce((s, r) => s + (r.ksek || 0), 0), [revenue]);

  return {
    mode,
    setMode,
    data,
    dataKey,
    customers,
    revenue,
    totalRevenueKSEK,
    customersLoading,
    customersError,
    revenueLoading,
    revenueError,
    segmentsRows,
    segmentsLoading,
    segmentsError,
  };
}
