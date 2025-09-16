"use client";
import { useEffect, useMemo, useState } from "react";

type RowCustomers = { country: string; count: number };
type RowRevenue = { country: string; ksek: number; aov_sek?: number; orders?: number };

// useCountryDatasets: Fetches and manages country-level customer and revenue datasets.
// If debugging, check that the correct API endpoints are hit, and that the returned data
// is correctly parsed and set in state. Also verify loading and error states for revenue.
export function useCountryDatasets() {
  // mode: "customers" or "revenue" - controls which dataset is active.
  // If debugging, ensure setMode updates the mode and triggers correct data fetch.
  const [mode, setMode] = useState<"customers" | "revenue">("customers");

  // customers: Array of { country, count }.
  // If debugging, check that this is populated after fetching "/" endpoint.
  const [customers, setCustomers] = useState<RowCustomers[]>([]);

  // revenue: Array of { country, ksek, aov_sek, orders }.
  // If debugging, check that this is populated after fetching "/api/countries_by_revenue".
  const [revenue, setRevenue] = useState<RowRevenue[]>([]);

  // revenueLoading: True while revenue data is being fetched.
  // If debugging, ensure this is true during fetch and false after (success or error).
  const [revenueLoading, setRevenueLoading] = useState(false);

  // revenueError: Holds error message if revenue fetch fails.
  // If debugging, check that this is set on fetch failure and cleared on new fetch.
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // base: API base URL. If debugging, verify this is correct for your environment.
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Fetch customers by country on mount or when base changes.
  // If debugging, check that the response contains 'customers_by_country' and that
  // setCustomers is called with the correct array.
  useEffect(() => {
    fetch(`${base}/`)
      .then(r => r.json())
      .then(json => {
        const map = json?.customers_by_country || {};
        const rows = Object.entries(map).map(([country, count]) => ({ country, count: Number(count) }));
        setCustomers(rows);
      })
      .catch(err => {
        // If debugging, check for network/API errors here.
        console.error("Failed to fetch customers by country:", err);
      });
  }, [base]);

  // Fetch revenue by country only when mode is "revenue" and revenue data is not already loaded.
  // If debugging, check that loading and error states are set/reset correctly,
  // and that the response contains the expected keys.
  useEffect(() => {
    if (mode !== "revenue" || revenue.length) return;
    setRevenueLoading(true); // Set loading state before fetch
    setRevenueError(null);   // Clear previous errors
    fetch(`${base}/api/countries_by_revenue`)
      .then(r => r.json())
      .then(json => {
        // If debugging, check that json has revenue_by_country_ksek, avg_order_value_by_country_sek, orders_count_by_country
        const revMap = json?.revenue_by_country_ksek || {};
        const aovMap = json?.avg_order_value_by_country_sek || {};
        const ordMap = json?.orders_count_by_country || {};
        const rows = Object.entries(revMap).map(([country, ksek]) => ({
          country,
          ksek: Number(ksek),
          aov_sek: Number(aovMap?.[country] ?? 0),
          orders: Number(ordMap?.[country] ?? 0),
        }));
        // If debugging, check that rows are sorted by ksek descending
        rows.sort((a, b) => (b.ksek ?? 0) - (a.ksek ?? 0));
        setRevenue(rows);
      })
      .catch(err => {
        // If debugging, check error message and network/API issues here.
        console.error("Failed to fetch revenue by country:", err);
        setRevenueError("Failed to load revenue");
      })
      .finally(() => setRevenueLoading(false)); // Always clear loading state
  }, [mode, revenue.length, base]);

  // data: The currently active dataset (customers or revenue).
  // If debugging, check that this switches correctly when mode changes.
  const data = useMemo(() => (mode === "customers" ? customers : revenue), [mode, customers, revenue]);

  // dataKey: The key to use for charting ("count" for customers, "ksek" for revenue).
  // If debugging, ensure this matches the current mode.
  const dataKey = mode === "customers" ? "count" : "ksek";

  // totalRevenueKSEK: Sum of all ksek values in revenue.
  // If debugging, check that this is correct and updates when revenue changes.
  const totalRevenueKSEK = useMemo(
    () => (revenue.length ? revenue.reduce((s, r) => s + (r.ksek || 0), 0) : 0),
    [revenue]
  );

  // If debugging, check that all returned values are correct and update as expected.
  return { mode, setMode, data, dataKey, customers, revenue, totalRevenueKSEK, revenueLoading, revenueError };
}
