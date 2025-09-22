// hooks/useTopCities.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { sortByMonthJanToDec } from "../utils/formatters";

export default function useTopCities({ countryId }) {
  const [mode, setMode] = useState("customers"); // "customers" | "revenue"
  const [rowsCustomers, setRowsCustomers] = useState([]);
  const [rowsRevenue, setRowsRevenue] = useState([]);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // initial: top cities by unique customers
  useEffect(() => {
    fetch(`${base}/api/country/${countryId}/top-cities?limit=10`)
      .then((r) => r.json())
      .then((j) => setRowsCustomers(Array.isArray(j.top_cities) ? j.top_cities : []))
      .catch((e) => console.error("Error fetching top cities by customers:", e));
  }, [base, countryId]);

  // lazy-load revenue data when needed
  useEffect(() => {
    if (mode !== "revenue" || rowsRevenue.length) return;
    fetch(`${base}/api/cities_by_revenue`)
      .then((r) => r.json())
      .then((j) => {
        const denmark = j?.top_cities_by_revenue_ksek?.["Denmark"];
        setRowsRevenue(Array.isArray(denmark) ? denmark : []);
      })
      .catch((e) => console.error("Error fetching top cities by revenue:", e));
  }, [mode, rowsRevenue.length, base]);

  const data = useMemo(() => {
    const d = mode === "customers" ? rowsCustomers : rowsRevenue;
    if (d.length && d[0].month) return sortByMonthJanToDec(d);
    return d;
  }, [mode, rowsCustomers, rowsRevenue]);

  return {
    mode,
    setMode,
    data,
    dataKey: mode === "customers" ? "unique_customers" : "ksek",
    titleSuffix: mode === "customers" ? "unique customers" : "revenue (KSEK)",
  };
}