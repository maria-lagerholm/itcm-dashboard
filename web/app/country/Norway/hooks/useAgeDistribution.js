"use client";

import { useEffect, useState } from "react";

/**
 * Fetches age distribution by gender for all countries.
 * Returns sorted age groups, data by country, and loading state.
 */
export default function useAgeDistribution() {
  const [agesSorted, setAgesSorted] = useState([]);
  const [byCountry, setByCountry] = useState({});
  const [loading, setLoading] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`${base}/api/customers_age_gender`)
      .then(r => r.json())
      .then(json => {
        if (!isMounted) return;
        setAgesSorted(Array.isArray(json.ages_sorted) ? json.ages_sorted : []);
        setByCountry(json.by_country || {});
      })
      .catch(() => {
        // Silently fail in production; optionally log to monitoring service
      })
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [base]);

  return { agesSorted, byCountry, loading };
}
