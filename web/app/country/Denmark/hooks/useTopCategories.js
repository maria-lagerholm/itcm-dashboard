"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRY } from "../country";
import { apiBase } from "@/app/lib/apiBase";

const SEASON_ORDER = ["Winter", "Spring", "Summer", "Autumn"];

const parseYear = (sl) => {
  const m = String(sl || "").match(/(\d{4})$/);
  return m ? Number(m[1]) : null;
};
const parseSeason = (sl) => String(sl || "").replace(/\s+\d{4}$/, "");

/**
 * Fetches available seasons per year and top categories for selected season.
 * Ensures valid season selection for the chosen year.
 */
export function useTopCategories(country = COUNTRY, limit = 12) {
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [availableByYear, setAvailableByYear] = useState({});
  const [years, setYears] = useState([]);
  const [year, setYear] = useState(null);
  const [season, setSeason] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [rowsError, setRowsError] = useState(null);

  // Load all available season labels for the country
  useEffect(() => {
    let abort = false;
    const ctrl = new AbortController();

    (async () => {
      setLoadingMeta(true);
      setMetaError(null);
      try {
        const base = (apiBase() || "/api").replace(/\/+$/, "");
        const url = `${base}/top_categories_by_season/?country=${encodeURIComponent(country)}`;

        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (abort) return;

        const byYear = {};
        (json.data || []).forEach((r) => {
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

        // Defaults: latest year and its first available season
        const defaultYear = yearsSorted[0] ?? null;
        const firstSeason = defaultYear ? normalized[defaultYear]?.[0] ?? null : null;
        setYear(defaultYear);
        setSeason(firstSeason);
      } catch (e) {
        if (!abort) setMetaError(e?.message || "Failed to load seasons");
      } finally {
        if (!abort) setLoadingMeta(false);
      }
    })();

    return () => {
      abort = true;
      ctrl.abort();
    };
  }, [country]);

  // Ensure selected season is valid for the selected year
  useEffect(() => {
    if (!year || !availableByYear[year]) return;
    const seasons = availableByYear[year];
    if (!season || !seasons.includes(season)) setSeason(seasons[0] ?? null);
    // don't depend on `season` to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, availableByYear]);

  // Fetch top categories for selected season and year
  useEffect(() => {
    if (!year || !season) return;
    let abort = false;
    const ctrl = new AbortController();

    (async () => {
      setLoadingRows(true);
      setRowsError(null);
      try {
        const base = (apiBase() || "/api").replace(/\/+$/, "");
        const sl = `${season} ${year}`;
        const url = `${base}/top_categories_by_season/?country=${encodeURIComponent(
          country
        )}&season_label=${encodeURIComponent(sl)}&limit=${limit}`;

        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (abort) return;

        if (res.status === 404) {
          setRows([]);
          setLoadingRows(false);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setRows(
          (json.data || []).map((r) => ({
            category: r.category,
            count: Number(r.count) || 0,
            rank: Number(r.rank) || 0,
          }))
        );
      } catch (e) {
        if (!abort) setRowsError(e?.message || "Failed to load categories");
      } finally {
        if (!abort) setLoadingRows(false);
      }
    })();

    return () => {
      abort = true;
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