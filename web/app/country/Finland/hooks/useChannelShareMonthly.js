"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRY } from "../country";
import { apiBase } from "@/app/lib/apiBase";

export default function useChannelShareMonthly(country = COUNTRY) {
  const [rows, setRows] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${apiBase()}/countries_by_channel_by_month`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (cancelled) return;

        const perCountry = data?.countries_by_channel_by_month?.[country] ?? {};
        const channelNames = Object.keys(perCountry).sort();

        const monthsSet = new Set();
        for (const ch of channelNames) {
          const arr = perCountry[ch] || [];
          for (let i = 0; i < arr.length; i++) monthsSet.add(String(arr[i].year_month));
        }
        const months = Array.from(monthsSet).sort();

        const channelMonthMaps = {};
        for (const ch of channelNames) {
          const map = new Map();
          for (const r of perCountry[ch] || []) {
            map.set(String(r.year_month), Number(r.customers_count) || 0);
          }
          channelMonthMaps[ch] = map;
        }

        const table = months.map((ym) => {
          const row = { year_month: ym };
          for (const ch of channelNames) {
            row[ch] = channelMonthMaps[ch].get(ym) || 0;
          }
          return row;
        });

        setChannels(channelNames);
        setRows(table);
      } catch (e) {
        if (!cancelled) setError("Failed to load monthly channels");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [country]);

  const totalsByMonth = useMemo(() => {
    if (!rows.length) return [];
    return rows.map((r) => {
      let total = 0;
      for (const [k, v] of Object.entries(r)) {
        if (k !== "year_month") total += Number(v) || 0;
      }
      return { year_month: r.year_month, total };
    });
  }, [rows]);

  return { rows, channels, totalsByMonth, loading, error };
}
