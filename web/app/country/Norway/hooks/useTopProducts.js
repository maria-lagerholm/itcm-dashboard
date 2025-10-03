// useTopProducts.js (for deployment)
"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRY } from "../country";
import { apiBase } from "@/app/lib/apiBase";

// Order of seasons for sorting
const SEASON_ORDER = ["Winter", "Spring", "Summer", "Autumn"];

const parseYear = (sl) => {
  const m = String(sl || "").match(/(\d{4})$/);
  return m ? Number(m[1]) : null;
};
const parseSeason = (sl) => String(sl || "").replace(/\s+\d{4}$/, "");

/**
 * Hook to fetch top products by season for a country.
 * Returns: { rows, loading, error, years, seasonsForSelectedYear, year, setYear, season, setSeason }
 */
export default function useTopProducts(country = COUNTRY, limit = 100) {
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [availableByYear, setAvailableByYear] = useState({});
  const [years, setYears] = useState([]);
  const [year, setYear] = useState(null);
  const [season, setSeason] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [rowsError, setRowsError] = useState(null);

  // Fetch available seasons per year
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setLoadingMeta(true);
      setMetaError(null);
      try {
        const base = (apiBase() || "/api").replace(/\/+$/, "");
        const url = `${base}/top_products_by_season/?country=${encodeURIComponent(country)}`;

        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        if (cancelled) return;

        const byYear = {};
        (data || []).forEach((r) => {
          const y = parseYear(r.season_label);
          const s = parseSeason(r.season_label);
          if (y && s) {
            byYear[y] = byYear[y] || new Set();
            byYear[y].add(s);
          }
        });

        const yearsSorted = Object.keys(byYear).map(Number).sort((a, b) => b - a);
        const normalized = Object.fromEntries(
          yearsSorted.map((y) => [
            y,
            Array.from(byYear[y]).sort((a, b) => SEASON_ORDER.indexOf(a) - SEASON_ORDER.indexOf(b)),
          ])
        );

        setAvailableByYear(normalized);
        setYears(yearsSorted);

        // Set defaults: latest year and first available season
        const defaultYear = yearsSorted[0] ?? null;
        const firstSeason = defaultYear ? normalized[defaultYear]?.[0] ?? null : null;
        setYear(defaultYear);
        setSeason(firstSeason);
      } catch (e) {
        if (!cancelled) setMetaError(e?.message || "Failed to load seasons");
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [country]);

  // Ensure selected season is valid for the selected year
  useEffect(() => {
    if (!year || !availableByYear[year]) return;
    const list = availableByYear[year] || [];
    if (!season || !list.includes(season)) setSeason(list[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, availableByYear]);

  // Fetch top products for the selected season
  useEffect(() => {
    if (!year || !season) return;
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setLoadingRows(true);
      setRowsError(null);
      try {
        const base = (apiBase() || "/api").replace(/\/+$/, "");
        const sl = `${season} ${year}`;
        const url = `${base}/top_products_by_season/?country=${encodeURIComponent(
          country
        )}&season_label=${encodeURIComponent(sl)}&limit=${limit}`;

        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (cancelled) return;

        if (res.status === 404) {
          setRows([]);
          setLoadingRows(false);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { data } = await res.json();
        setRows(
          (data || []).map((r) => ({
            product: r.product ?? r.name,
            product_id: r.product_id ?? r.value,
            brand: r.brand ?? null,
            count: Number(r.count) || 0,
            rank: Number(r.rank) || 0,
          }))
        );
      } catch (e) {
        if (!cancelled) setRowsError(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoadingRows(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [country, year, season, limit]);

  const seasonsForSelectedYear = useMemo(
    () => (year && availableByYear[year] ? availableByYear[year] : []),
    [availableByYear, year]
  );

  return {
    rows,
    loading: loadingMeta || loadingRows,
    error: metaError || rowsError,
    years,
    seasonsForSelectedYear,
    year,
    setYear,
    season,
    setSeason,
  };
}
