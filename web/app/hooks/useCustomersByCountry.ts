"use client";

import { useEffect, useState } from "react";
import { apiBase } from "@/app/lib/apiBase";

export type RowSegments = { country: string; New: number; Returning: number; Loyal: number; total: number };

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

export function useCustomersByCountry() {
  const [rows, setRows] = useState<RowSegments[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchJsonFlexible(api("countries/segments"), ctrl.signal);
        const map = (json as any)?.segments_by_country ?? {};
        const grandTotal = Number(
          (json as any)?.total_customers ??
          (json as any)?.data?.total_customers ??
          0
        );

        const out: RowSegments[] = Object.entries(map)
          .map(([country, entry]: [string, any]) => {
            const New = Number(entry?.segments?.New?.count ?? 0);
            const Returning = Number(entry?.segments?.Returning?.count ?? 0);
            const Loyal = Number(entry?.segments?.Loyal?.count ?? 0);
            const total =
              Number(entry?.total_customers_with_orders) || (New + Returning + Loyal);
            return { country, New, Returning, Loyal, total };
          })
          .sort((a, b) => b.total - a.total); // highest → lowest by total customers

        if (!cancelled) {
          setRows(out);
          setTotalCustomers(Number.isFinite(grandTotal) ? grandTotal : null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load customer segments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; ctrl.abort(); };
  }, []);

  return { rows, totalCustomers, loading, error };
}