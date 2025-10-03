"use client";

import { useEffect, useState, useMemo } from "react";
import { apiBase } from "@/app/lib/apiBase";

export type RowRevenue = { country: string; ksek: number; aov_sek?: number; orders?: number };

type Jsonish = Record<string, unknown>;

function api(path: string) {
  const b = (apiBase() || "/api").replace(/\/+$/, "");
  const p = String(path ?? "").replace(/^\/+/, "");
  return `${b}/${p}`;
}

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
  try { return JSON.parse(txt); }
  catch { throw new Error(`Expected JSON from ${url} but got '${ct || "unknown"}'. First 160 chars: ${txt.slice(0, 160)}`); }
}

export function useRevenueByCountry() {
  const [rows, setRows] = useState<RowRevenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchJsonFlexible(api("countries_by_revenue"), ctrl.signal);

        const revMap = (json as any)?.revenue_by_country_ksek ?? (json as any)?.data?.revenue_by_country_ksek ?? {};
        const aovMap = (json as any)?.avg_order_value_by_country_sek ?? (json as any)?.data?.avg_order_value_by_country_sek ?? {};
        const ordMap = (json as any)?.orders_count_by_country ?? (json as any)?.data?.orders_count_by_country ?? {};

        const out: RowRevenue[] = Object.entries(revMap)
          .map(([country, ksek]) => ({
            country,
            ksek: Number(ksek) || 0,
            aov_sek: Number(aovMap?.[country]) || 0,
            orders: Number(ordMap?.[country]) || 0,
          }))
          .sort((a, b) => (b.ksek ?? 0) - (a.ksek ?? 0) || a.country.localeCompare(b.country)); // highest → lowest

        if (!cancelled) setRows(out);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load revenue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; ctrl.abort(); };
  }, []);

  const totalRevenueKSEK = useMemo(
    () => rows.reduce((s, r) => s + (r.ksek || 0), 0),
    [rows]
  );

  const totalOrders = useMemo(
    () => rows.reduce((s, r) => s + (r.orders || 0), 0),
    [rows]
  );

  return { rows, totalRevenueKSEK, totalOrders, loading, error };
}