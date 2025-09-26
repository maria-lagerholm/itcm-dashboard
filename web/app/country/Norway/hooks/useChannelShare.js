"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRY } from "../country";

/**
 * Fetches and computes channel share data for a given country.
 * Returns: rows (raw), data (percentage shares), total, loading, error.
 */
export default function useChannelShare(country = COUNTRY) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL, fallback to localhost for development
  const base = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    []
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${base}/api/countries_by_channel`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        const arr = j?.countries_by_channel?.[country];
        setRows(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load channels");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [base, country]);

  // Total customers for the country
  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.customers_count) || 0), 0),
    [rows]
  );

  // Single row: { channel: share, ... } for stacked chart
  const data = useMemo(() => {
    if (!total) return [{ _label: "" }];
    const o = { _label: "" };
    rows.forEach(r => {
      o[r.channel] = (Number(r.customers_count) || 0) / total;
    });
    return [o];
  }, [rows, total]);

  return { rows, data, total, loading, error };
}
