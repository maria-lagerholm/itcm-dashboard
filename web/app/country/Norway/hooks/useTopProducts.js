"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRY } from "../country";

const SEASON_ORDER = ["Winter", "Spring", "Summer", "Autumn"];
const parseYear = (sl) => (String(sl || "").match(/(\d{4})$/)?.[1] ? Number(RegExp.$1) : null);
const parseSeason = (sl) => String(sl || "").replace(/\s+\d{4}$/, "");

export default function useTopProducts(country = COUNTRY, limit = 10) {
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [availableByYear, setAvailableByYear] = useState({});
  const [years, setYears] = useState([]);
  const [year, setYear] = useState(null);
  const [season, setSeason] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [rowsError, setRowsError] = useState(null);

  // 1) seasons
  useEffect(() => {
    let abort = false;
    (async () => {
      setLoadingMeta(true);
      setMetaError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/top_products_by_season/?country=${encodeURIComponent(country)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        if (abort) return;

        const labels = (data || []).map((r) => r.season_label).filter(Boolean);
        const byYear = {};
        for (const sl of labels) {
          const y = parseYear(sl), s = parseSeason(sl);
          if (!y || !s) continue;
          (byYear[y] ||= new Set()).add(s);
        }
        const yearsSorted = Object.keys(byYear).map(Number).sort((a,b)=>b-a);
        const normalized = Object.fromEntries(
          yearsSorted.map((y) => [y, Array.from(byYear[y]).sort((a,b)=>SEASON_ORDER.indexOf(a)-SEASON_ORDER.indexOf(b))])
        );

        setAvailableByYear(normalized);
        setYears(yearsSorted);
        const y0 = yearsSorted[0] ?? null;
        setYear(y0);
        setSeason(y0 ? normalized[y0]?.[0] ?? null : null);
      } catch (e) {
        if (!abort) setMetaError(e.message || "Failed to load seasons");
      } finally {
        if (!abort) setLoadingMeta(false);
      }
    })();
    return () => { abort = true; };
  }, [country]);

  // 2) fix season when year changes
  useEffect(() => {
    if (!year || !availableByYear[year]) return;
    const list = availableByYear[year] || [];
    if (!season || !list.includes(season)) setSeason(list[0] ?? null);
  }, [year, availableByYear]); // no season dep to avoid loop

  // 3) rows
  useEffect(() => {
    if (!year || !season) return;
    let abort = false;
    (async () => {
      setLoadingRows(true);
      setRowsError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const sl = `${season} ${year}`;
        const res = await fetch(
          `${base}/api/top_products_by_season/?country=${encodeURIComponent(country)}&season_label=${encodeURIComponent(sl)}&limit=${limit}`,
          { cache: "no-store" }
        );
        if (abort) return;
        if (res.status === 404) { setRows([]); setLoadingRows(false); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        const list = (data || []).map((r) => ({
          product: r.product ?? r.name,
          product_id: r.product_id ?? r.value,
          brand: r.brand ?? null,
          count: Number(r.count) || 0,
          rank: Number(r.rank) || 0,
        }));
        setRows(list);
      } catch (e) {
        if (!abort) setRowsError(e.message || "Failed to load products");
      } finally {
        if (!abort) setLoadingRows(false);
      }
    })();
    return () => { abort = true; };
  }, [country, year, season, limit]);

  const seasonsForSelectedYear = useMemo(() => (year && availableByYear[year] ? availableByYear[year] : []), [availableByYear, year]);

  return { rows, loading: loadingMeta || loadingRows, error: metaError || rowsError, years, seasonsForSelectedYear, year, setYear, season, setSeason };
}
