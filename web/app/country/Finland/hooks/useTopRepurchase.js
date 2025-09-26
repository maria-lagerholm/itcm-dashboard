"use client";

import { useEffect, useState } from "react";
import { COUNTRY } from "../country";
import { apiBase } from "@/app/lib/apiBase";

/**
 * Fetches top repurchased products for a country.
 * Returns: { rows, loading, error }
 */
export default function useTopRepurchase(country = COUNTRY, limit = 10) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const base = apiBase();
    const url = `${base}/api/top_repurchase_by_country/?country=${encodeURIComponent(country)}&limit=${limit}`;

    fetch(url, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ data }) => {
        if (cancelled) return;
        setRows(
          Array.isArray(data)
            ? data.map(r => ({
                product: r.product ?? r.name,
                product_id: r.product_id ?? r.value,
                brand: r.brand ?? null,
                repurchasers: Number(r.repurchasers) || 0,
                rank: Number(r.rank) || 0,
              }))
            : []
        );
      })
      .catch(e => {
        if (!cancelled) setError(e.message || "Failed to load repurchase data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [country, limit]);

  return { rows, loading, error };
}