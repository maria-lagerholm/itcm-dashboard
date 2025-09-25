"use client";

import { useEffect, useState } from "react";
import { COUNTRY } from "../country";

/** Fetches /api/top_brands_by_country?country=Denmark&limit=10 */
export function useTopBrands(country = COUNTRY, limit = 10) {
  const [rows, setRows] = useState([]);   // [{brand, count, rank}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let abort = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const url = `${base}/api/top_brands_by_country/?country=${encodeURIComponent(country)}&limit=${limit}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (abort) return;

        const list = (json.data || []).map(r => ({
          brand: r.brand,
          count: Number(r.count) || 0,
          rank: Number(r.rank) || 0,
        }));
        setRows(list);
      } catch (e) {
        if (!abort) setError(e?.message || "Failed to load top brands");
      } finally {
        if (!abort) setLoading(false);
      }
    }

    run();
    return () => { abort = true; };
  }, [country, limit]);

  return { rows, loading, error };
}

// Optional default export so either import style works
export default useTopBrands;
