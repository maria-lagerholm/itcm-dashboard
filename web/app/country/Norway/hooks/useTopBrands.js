"use client";

import { useEffect, useState } from "react";
import { COUNTRY } from "../country";

/**
 * Fetches top brands for a country.
 * Returns: { rows, loading, error }
 */
export function useTopBrands(country = COUNTRY, limit = 10) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const url = `${base}/api/top_brands_by_country/?country=${encodeURIComponent(country)}&limit=${limit}`;

    fetch(url, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (cancelled) return;
        setRows(
          Array.isArray(json?.data)
            ? json.data.map(r => ({
                brand: r.brand,
                count: Number(r.count) || 0,
                rank: Number(r.rank) || 0,
              }))
            : []
        );
      })
      .catch(e => {
        if (!cancelled) setError(e?.message || "Failed to load top brands");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [country, limit]);

  return { rows, loading, error };
}

export default useTopBrands;
