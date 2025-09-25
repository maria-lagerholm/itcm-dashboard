"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRY } from "../country";

const SEASON_ORDER = ["Winter", "Spring", "Summer", "Autumn"]; // UI order

function parseYear(sl) {
  const m = String(sl || "").match(/(\d{4})$/);
  return m ? Number(m[1]) : null;
}
function parseSeason(sl) {
  return String(sl || "").replace(/\s+\d{4}$/, "");
}

/**
 * Loads available seasons per year for a country, and rows for the selected season_label.
 * Auto-corrects season when switching year to avoid 404s (pick first available for that year).
 */
export function useTopCategories(country = COUNTRY, limit = 12) {
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [availableByYear, setAvailableByYear] = useState({}); // {2024: ["Summer","Autumn"], 2025: ["Spring","Summer","Autumn","Winter"], ...}
  const [years, setYears] = useState([]);

  const [year, setYear] = useState(null);
  const [season, setSeason] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [rowsError, setRowsError] = useState(null);

  // 1) Load all season_labels once for the country
  useEffect(() => {
    let abort = false;
    async function run() {
      setLoadingMeta(true);
      setMetaError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const url = `${base}/api/top_categories_by_season/?country=${encodeURIComponent(country)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (abort) return;

        const labels = (json.data || []).map(r => r.season_label).filter(Boolean);
        const byYear = {};
        for (const sl of labels) {
          const y = parseYear(sl);
          const s = parseSeason(sl);
          if (!y || !s) continue;
          if (!byYear[y]) byYear[y] = new Set();
          byYear[y].add(s);
        }

        const yearsSorted = Object.keys(byYear).map(Number).sort((a, b) => b - a);
        const normalized = Object.fromEntries(
          yearsSorted.map(y => [
            y,
            Array.from(byYear[y]).sort((a, b) => SEASON_ORDER.indexOf(a) - SEASON_ORDER.indexOf(b)),
          ])
        );

        setAvailableByYear(normalized);
        setYears(yearsSorted);

        // Initial defaults: latest year + first available season in our order
        const defaultYear = yearsSorted[0] ?? null;
        const firstSeason = defaultYear ? normalized[defaultYear]?.[0] ?? null : null;
        setYear(defaultYear);
        setSeason(firstSeason);
      } catch (e) {
        if (!abort) setMetaError(e?.message || "Failed to load seasons");
      } finally {
        if (!abort) setLoadingMeta(false);
      }
    }
    run();
    return () => {
      abort = true;
    };
  }, [country]);

  // 2) When year changes, ensure season is valid for that year
  useEffect(() => {
    if (!year || !availableByYear[year]) return;
    const seasonsForYear = availableByYear[year] || [];
    if (!season || !seasonsForYear.includes(season)) {
      // Pick first available season for this year (e.g., 2024 → Summer)
      setSeason(seasonsForYear[0] ?? null);
    }
  }, [year, availableByYear]); // intentionally not depending on `season` to avoid loops

  // 3) Fetch rows for the selected season_label
  useEffect(() => {
    if (!year || !season) return;
    let abort = false;
    async function run() {
      setLoadingRows(true);
      setRowsError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const sl = `${season} ${year}`;
        const url = `${base}/api/top_categories_by_season/?country=${encodeURIComponent(country)}&season_label=${encodeURIComponent(
          sl
        )}&limit=${limit}`;
        const res = await fetch(url, { cache: "no-store" });

        if (abort) return;

        if (res.status === 404) {
          // Treat 404 as "no data" for that combination (don't surface as error)
          setRows([]);
          setLoadingRows(false);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const list = (json.data || []).map(r => ({
          category: r.category,
          count: Number(r.count) || 0,
          rank: Number(r.rank) || 0,
        }));
        setRows(list);
      } catch (e) {
        if (!abort) setRowsError(e?.message || "Failed to load categories");
      } finally {
        if (!abort) setLoadingRows(false);
      }
    }
    run();
    return () => {
      abort = true;
    };
  }, [country, year, season, limit]);

  const seasonsForSelectedYear = useMemo(() => {
    return year && availableByYear[year] ? availableByYear[year] : [];
  }, [availableByYear, year]);

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
