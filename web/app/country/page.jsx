"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CountryOverview() {
  // State to hold the sorted array of countries and their unique customer counts
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Determine API base URL (use env var if set, otherwise fallback to localhost for local dev)
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${base}/api/countries`)
      .then((r) => r.json())
      .then((j) => {
        // Expecting response shape: { customers_by_country: { Sweden: 34570, Norway: 26223, ... } }
        // Convert customers_by_country object to sorted array of { country, count }
        const arr = Object.entries(j.customers_by_country || {})
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count);
        setRows(arr);
      })
      .catch((e) => {
        // Log fetch or parse errors for debugging
        console.error("Error fetching countries or parsing response in CountryOverview:", e);
      });
  }, []);

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Customers by Country</h2>
      <p style={{ marginBottom: 16, color: "#555" }}>
        Click a country to view its top cities.
      </p>

      <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", background: "#fafafa", padding: "10px 12px", fontWeight: 600 }}>
          <div>Country</div>
          <div style={{ textAlign: "right" }}>Unique customers</div>
        </div>

        {/* Render a row for each country, linking to its detail page */}
        {rows.map((r) => (
          <Link
            key={r.country}
            href={`/country/${encodeURIComponent(r.country)}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px",
              padding: "10px 12px",
              borderTop: "1px solid #eee",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span>{r.country}</span>
            <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {r.count.toLocaleString()}
            </span>
          </Link>
        ))}

        {/* Show loading message if no data has been loaded yet */}
        {!rows.length && (
          <div style={{ padding: 16, color: "#777" }}>Loading…</div>
        )}
      </div>
    </main>
  );
}
