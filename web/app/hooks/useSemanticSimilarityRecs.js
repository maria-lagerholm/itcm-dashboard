// hooks/useSemanticSimilarityRecs.js
"use client";

import { useEffect, useState } from "react";
import { apiBase } from "@/app/lib/apiBase";

export default function useSemanticSimilarityRecs() {
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
        const url = `${base}/semantic_similarity_recs`;
        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (cancelled) return;

        const mapped = (data || []).map((r) => ({
          productId: String(r["Product ID"] ?? ""),
          tops: Array.from({ length: 10 }, (_, i) => {
            const v = r[`Top ${i + 1}`];
            return v == null ? "" : String(v);
          }),
        }));

        mapped.sort((a, b) => {
          const na = Number(a.productId);
          const nb = Number(b.productId);
          if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
          return a.productId.localeCompare(b.productId);
        });

        setRows(mapped);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load semantic similarity");
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