"use client";

import { useEffect, useState } from "react";
import { apiBase } from "../../../lib/apiBase";

export default function useAgeDistribution() {
  const [agesSorted, setAgesSorted] = useState([]);
  const [byCountry, setByCountry] = useState({});
  const [loading, setLoading] = useState(false);
  const base = apiBase(); // will be "/api" in the browser

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`${base}/customers_age_gender`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => {
        if (!isMounted) return;
        setAgesSorted(Array.isArray(json.ages_sorted) ? json.ages_sorted : []);
        setByCountry(json.by_country || {});
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [base]);

  return { agesSorted, byCountry, loading };
}
