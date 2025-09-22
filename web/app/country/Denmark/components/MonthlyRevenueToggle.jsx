// app/country/Denmark/components/MonthlyRevenueToggle.jsx
"use client";

import { useState } from "react";
import MonthlySalesChart from "../MonthlySalesChart";
import MonthlyForecastChart from "../MonthlyForecastChart";

export default function MonthlyRevenueToggle({
  country = "Denmark",
  // target windows 
  histStartYM = "2024-06",
  histEndYM   = "2025-05",
  forecastStartYM = "2025-06",
  forecastEndYM   = "2026-05",
}) {
  const [view, setView] = useState("hist"); // "hist" | "forecast"

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          {country} · Monthly Revenue (KSEK)
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setView("hist")}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: view === "hist" ? "#f1f5f9" : "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            June 2024 – May 2025
          </button>
          <button
            onClick={() => setView("forecast")}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: view === "forecast" ? "#f1f5f9" : "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            June 2025 – May 2026
          </button>
        </div>
      </div>

      {/* Render exactly one chart based on toggle */}
      {view === "hist" ? (
        <MonthlySalesChart
          country={country}
          startYM={histStartYM}
          endYM={histEndYM}
        />
      ) : (
        <MonthlyForecastChart
          country={country}
          startYM={forecastStartYM}
          endYM={forecastEndYM}
        />
      )}
    </section>
  );
}