// app/country/Denmark/hooks/useAgeDistribution.js
"use client";

import { useEffect, useState } from "react";
import { apiBase } from "../../../lib/apiBase";

export default function useAgeDistribution() {
  const [agesSorted, setAgesSorted] = useState([]);
  const [byCountry, setByCountry] = useState({});
  const [loading, setLoading] = useState(false);
  const base = apiBase(); // "/api" in browser

  useEffect(() => {
    let isMounted = true;
    const ctrl = new AbortController();

    setLoading(true);
    fetch(`${base}/customers_age_gender`, { cache: "no-store", signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!isMounted) return;
        setAgesSorted(Array.isArray(json.ages_sorted) ? json.ages_sorted : []);
        setByCountry(json.by_country || {});
      })
      .catch(() => {
        /* optional: report error */
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      ctrl.abort();
    };
  }, []); 

  return { agesSorted, byCountry, loading };
}
