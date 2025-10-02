// hooks/useCooccurrence.js
"use client";

import { useEffect, useState } from "react";
import { apiBase } from "@/app/lib/apiBase";

export default function useCooccurrence() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const base = (apiBase() || "/api").replace(/\/+$/, "");
        const url = `${base}/cooccurrence`; // no limit/offset
        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // backend returns array of records

        if (cancelled) return;

        // Normalize for the table component
        const mapped = (data || []).map((r) => ({
          rank: Number(r["Rank by Affinity Strength"]) || 0,
          aId: String(r["Product A ID"] ?? ""),
          aName: r["Product A"] ?? "",
          bId: String(r["Product B ID"] ?? ""),
          bName: r["Product B"] ?? "",
        }));

        // If backend isn't sorted, sort by rank ascending
        mapped.sort((x, y) => (x.rank || 0) - (y.rank || 0));

        setRows(mapped);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load cooccurrence");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  return { rows, loading, error };
}
