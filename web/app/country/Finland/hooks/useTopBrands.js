"use client";

import { useEffect, useState } from "react";
import { COUNTRY } from "../country";
import { apiBase } from "@/app/lib/apiBase";

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
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    const base = (apiBase() || "/api").replace(/\/+$/, "");
    const url = `${base}/top_brands_by_country/?country=${encodeURIComponent(country)}&limit=${limit}`;

    fetch(url, { cache: "no-store", signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const arr = Array.isArray(json?.data) ? json.data : [];
        setRows(
          arr.map((r) => ({
            brand: r.brand,
            count: Number(r.count) || 0,
            rank: Number(r.rank) || 0,
          }))
        );
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Failed to load top brands");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [country, limit]);

  return { rows, loading, error };
}

export default useTopBrands;