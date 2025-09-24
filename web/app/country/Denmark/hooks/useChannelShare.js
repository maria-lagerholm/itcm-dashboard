"use client";

import { useEffect, useMemo, useState } from "react";

export default function useChannelShare(country = "Denmark") {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  const base = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    []
  );

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const r = await fetch(`${base}/api/countries_by_channel`, { cache: "no-store" });
        const j = await r.json();
        if (!off) setRows(Array.isArray(j?.countries_by_channel?.[country]) ? j.countries_by_channel[country] : []);
      } catch (e) {
        if (!off) setErr("Failed to load channels");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [base, country]);

  const total = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.customers_count) || 0), 0),
    [rows]
  );

  // single stacked row with percentage shares
  const data = useMemo(() => {
    const o = { _label: "" };
    if (total) for (const r of rows) o[r.channel] = (Number(r.customers_count) || 0) / total;
    return [o];
  }, [rows, total]);

  return { rows, data, total, loading, error };
}
