// app/hooks/useReturningBuckets.ts
"use client";

import { useEffect, useState } from "react";

type ReturningRow = { bucket: string; customers: number };
type ApiResp = { data: ReturningRow[]; meta: { total_customers: number; etag?: string } };

export function useReturningBuckets() {
  const [rows, setRows] = useState<{ country: string; count: number }[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etag, setEtag] = useState<string | undefined>(undefined);

  useEffect(() => {
    let abort = false;

    async function fetchJSON(url: string) {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
      return res.json() as Promise<ApiResp>;
    }

    async function run() {
      setLoading(true);
      setError(null);
      try {
        // Try your current origin first (works if rewrites/proxy handle it),
        // then fall back to common FastAPI dev URLs.
        const candidates = [
          "/api/returning/",
          "/api/returning",
          "http://localhost:8000/api/returning/",
          "http://127.0.0.1:8000/api/returning/",
        ];

        let json: ApiResp | null = null;
        let hit = "";

        for (const u of candidates) {
          try {
            json = await fetchJSON(u);
            hit = u;
            break;
          } catch {
            // try next
          }
        }

        if (!json) throw new Error(`All returning URLs failed: ${candidates.join(", ")}`);
        if (abort) return;

        const mapped =
          (json.data ?? []).map((r) => ({
            country: r.bucket,                 // reuse CountryBarChart
            count: Number(r.customers) || 0,
          })) ?? [];

        setRows(mapped);
        setTotal(Number(json.meta?.total_customers) || 0);
        setEtag(json.meta?.etag);

        if (process.env.NODE_ENV === "development") {
          console.log("Returning OK:", { hit, rows: mapped.length, etag: json.meta?.etag });
        }
      } catch (e: any) {
        const msg = e?.message ?? "Failed to load returning data";
        if (!abort) setError(msg);
        if (process.env.NODE_ENV === "development") {
          console.error("Returning ERR:", msg);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }

    run();
    return () => { abort = true; };
  }, []);

  return { rows, total, loading, error, etag };
}
