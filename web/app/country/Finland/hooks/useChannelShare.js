"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRY } from "../country";
import { apiBase } from "@/app/lib/apiBase";

export default function useChannelShare(country = COUNTRY) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = apiBase();

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    setLoading(true);
    setError(null);

    fetch(`${base}/countries_by_channel`, { cache: "no-store", signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
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

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [country]);

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.customers_count) || 0), 0),
    [rows]
  );

  const data = useMemo(() => {
    if (!total) return [{ _label: "" }];
    const o = { _label: "" };
    rows.forEach((r) => {
      o[r.channel] = (Number(r.customers_count) || 0) / total;
    });
    return [o];
  }, [rows, total]);

  return { rows, data, total, loading, error };
}
