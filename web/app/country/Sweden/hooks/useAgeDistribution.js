// hooks/useAgeDistribution.js
"use client";

import { useEffect, useState } from "react";

export default function useAgeDistribution() {
  const [agesSorted, setAgesSorted] = useState([]);
  const [byCountry, setByCountry] = useState({});
  const [loading, setLoading] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    setLoading(true);
    fetch(`${base}/api/customers_age_gender`)
      .then((r) => r.json())
      .then((json) => {
        setAgesSorted(Array.isArray(json.ages_sorted) ? json.ages_sorted : []);
        setByCountry(json.by_country || {});
      })
      .catch((e) => console.error("Error fetching customers_age_gender:", e))
      .finally(() => setLoading(false));
  }, [base]);

  return { agesSorted, byCountry, loading };
}
