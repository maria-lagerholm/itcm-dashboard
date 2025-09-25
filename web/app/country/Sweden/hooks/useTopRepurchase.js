"use client";

import { useEffect, useState } from "react";
import { COUNTRY } from "../country";

export default function useTopRepurchase(country = COUNTRY, limit = 10) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const url = `${base}/api/top_repurchase_by_country/?country=${encodeURIComponent(country)}&limit=${limit}`;
        const res = await fetch(url, { cache: "no-store" });
        if (abort) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        const mapped = (data || []).map((r) => ({
          product: r.product ?? r.name,
          product_id: r.product_id ?? r.value,
          brand: r.brand ?? null,
          repurchasers: Number(r.repurchasers) || 0,
          rank: Number(r.rank) || 0,
        }));
        setRows(mapped);
      } catch (e) {
        if (!abort) setErr(e.message || "Failed to load repurchase");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [country, limit]);

  return { rows, loading, error };
}