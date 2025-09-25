"use client";
import { useEffect, useMemo, useState } from "react";

type RowCustomers = { country: string; count: number };
type RowRevenue = { country: string; ksek: number; aov_sek?: number; orders?: number };
type RowSegments = { country: string; New: number; Repeat: number; Loyal: number; total: number };

type Jsonish = Record<string, unknown>;

/* ---------- URL helpers ---------- */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
const api = (path: string) =>
  `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

/* ---------- Fetch helpers (flexible & noisy in dev) ---------- */
async function fetchJsonFlexible(url: string, signal?: AbortSignal): Promise<Jsonish> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal });
  } catch (e: any) {
    // Network error, mixed content, CORS, DNS, etc.
    throw new Error(`Network error fetching ${url}: ${e?.message || e}`);
  }

  if (!res.ok) {
    const preview = await res.text().catch(() => "");
    // Do NOT crash app up the stack; let caller decide. Provide very clear message.
    throw new Error(`HTTP ${res.status} ${res.statusText || ""} at ${url} · ${preview.slice(0, 160)}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (/\bapplication\/json\b/i.test(ct)) {
    return res.json() as Promise<Jsonish>;
  }

  // Some backends forget proper content-type; try parsing anyway.
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error(`Expected JSON from ${url} but got '${ct || "unknown"}'. First 160 chars: ${txt.slice(0, 160)}`);
  }
}

/** Try a list of paths until one returns good JSON; throws the last error if all fail. */
async function tryFetchChain(paths: string[], signal?: AbortSignal): Promise<Jsonish> {
  let lastErr: unknown;
  for (const p of paths) {
    const url = api(p);
    try {
      return await fetchJsonFlexible(url, signal);
    } catch (e) {
      lastErr = e;
      // Helpful breadcrumb in the console during dev
      // eslint-disable-next-line no-console
      console.warn(`[tryFetchChain] failed ${url}:`, e);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/* ======================= HOOK ======================= */
export function useCountryDatasets() {
  const [mode, setMode] = useState<"customers" | "revenue">("customers");

  // Customers
  const [customers, setCustomers] = useState<RowCustomers[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  // Revenue
  const [revenue, setRevenue] = useState<RowRevenue[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // Segments
  const [segmentsRows, setSegmentsRows] = useState<RowSegments[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentsError, setSegmentsError] = useState<string | null>(null);

  /* ---- Customers (load once). Fallbacks: /api/customers-by-country -> / ---- */
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setCustomersLoading(true);
      setCustomersError(null);
      try {
        const json = await tryFetchChain(
          ["/api/customers-by-country", "/"], // <- adjust if needed
          ctrl.signal
        );

        // Accept several shapes; map to {country, count}
        const map1 = (json as any)?.customers_by_country as Record<string, unknown> | undefined;
        const map: Record<string, unknown> =
          map1 ??
          (json as any)?.data?.customers_by_country ??
          (json as any)?.countries?.customers ??
          {};

        const rows = Object.entries(map).map(([country, count]) => ({
          country,
          count: Number(count as any) || 0,
        }));
        rows.sort((a, b) => b.count - a.count);

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

  /* ---- Revenue (lazy when switched). Fallbacks: /api/countries_by_revenue -> / ---- */
  useEffect(() => {
    if (mode !== "revenue" || revenue.length) return;

    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setRevenueLoading(true);
      setRevenueError(null);
      try {
        const json = await tryFetchChain(
          ["/api/countries_by_revenue", "/"],
          ctrl.signal
        );

        const revMap = ((json as any)?.revenue_by_country_ksek ??
          (json as any)?.data?.revenue_by_country_ksek ??
          {}) as Record<string, unknown>;

        const aovMap = ((json as any)?.avg_order_value_by_country_sek ??
          (json as any)?.data?.avg_order_value_by_country_sek ??
          {}) as Record<string, unknown>;

        const ordMap = ((json as any)?.orders_count_by_country ??
          (json as any)?.data?.orders_count_by_country ??
          {}) as Record<string, unknown>;

        const rows: RowRevenue[] = Object.entries(revMap).map(([country, ksek]) => ({
          country,
          ksek: Number(ksek as any) || 0,
          aov_sek: Number(aovMap?.[country] as any) || 0,
          orders: Number(ordMap?.[country] as any) || 0,
        }));

        rows.sort((a, b) => (b.ksek ?? 0) - (a.ksek ?? 0));
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

  /* ---- Segments (load once). Fallbacks: /api/countries/segments -> / ---- */
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setSegmentsLoading(true);
      setSegmentsError(null);
      try {
        const json = await tryFetchChain(
          ["/api/countries/segments", "/"],
          ctrl.signal
        );

        const map =
          ((json as any)?.segments_by_country ??
            (json as any)?.data?.segments_by_country ??
            {}) as Record<string, { segments?: Record<string, { count?: number }> }>;

        const rows: RowSegments[] = [];
        for (const [country, obj] of Object.entries(map)) {
          const seg = obj?.segments ?? {};
          const New = Number(seg?.New?.count ?? 0);
          const Repeat = Number(seg?.Repeat?.count ?? 0);
          const Loyal = Number(seg?.Loyal?.count ?? 0);
          const total = New + Repeat + Loyal;
          rows.push({ country, New, Repeat, Loyal, total });
        }

        rows.sort((a, b) => b.total - a.total);
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

  /* ---- Derived values for the main chart ---- */
  const data = useMemo(() => (mode === "customers" ? (customers as any[]) : (revenue as any[])), [mode, customers, revenue]);
  const dataKey: "count" | "ksek" = mode === "customers" ? "count" : "ksek";

  const totalRevenueKSEK = useMemo(
    () => revenue.reduce((s, r) => s + (r.ksek || 0), 0),
    [revenue]
  );

  return {
    mode,
    setMode,

    // main chart
    data,
    dataKey,

    // raw datasets
    customers,
    revenue,

    // totals / status
    totalRevenueKSEK,

    // loading/errors
    customersLoading,
    customersError,
    revenueLoading,
    revenueError,
    segmentsRows,
    segmentsLoading,
    segmentsError,
  };
}
