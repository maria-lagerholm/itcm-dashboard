"use client";

import { formatNumberWithSpace } from "./lib/number";
import ChartToolbar from "./components/ChartToolbar";
import CountryBarChart from "./components/CountryBarChart";
import Spinner from "./components/Spinner";
import { useCountryDatasets } from "./hooks/useCountryDatasets";

export default function Home() {
  // Destructure state and handlers from custom hook for country datasets.
  // If debugging, check that 'mode' is either "customers" or "revenue", and that 'data' is an array.
  const {
    mode, setMode, data, dataKey, totalRevenueKSEK,
    revenueLoading, revenueError,
  } = useCountryDatasets();

  // Spinner should show only when in "revenue" mode and revenue data is still loading.
  // If debugging, check that 'revenueLoading' is a boolean and 'mode' is correct.
  const showSpinner = mode === "revenue" && revenueLoading;

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: 1, margin: 0, textAlign: "center", color: "#1e293b", textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 2px 12px rgba(30,41,59,0.08)" }}>
          <span style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif", fontWeight: 500 }}>
            Åshild Analytics (2024-06-01 - present)
          </span>
        </h1>
      </header>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif", fontWeight: 500 }}>
          {mode === "customers" ? "Customers by Country" : "Total Revenue by Country"}
        </h2>
        <ChartToolbar mode={mode} setMode={setMode} />
      </div>

      {/* Show revenue totals only when in "revenue" mode and not loading.
          If debugging, check that totalRevenueKSEK is a number and data is an array with expected fields. */}
      {mode === "revenue" && !showSpinner && (
        <div style={{ marginBottom: 16, fontWeight: 500 }}>
          Total Revenue: {formatNumberWithSpace(totalRevenueKSEK)} KSEK
          {/* 
            If 'data' is an array and contains 'orders' field, show total orders.
            If debugging, check that each item in 'data' has an 'orders' property (number).
          */}
          {Array.isArray(data) && data.length > 0 && typeof data[0].orders === "number" && (
            <>
              {"  "}·{" "}
              Total Orders: {formatNumberWithSpace(data.reduce((sum, r) => sum + (r.orders || 0), 0))}
            </>
          )}
        </div>
      )}

      {/* Show error message if revenue fetch failed.
          If debugging, check value of 'revenueError'. */}
      {mode === "revenue" && revenueError && (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{revenueError}</div>
      )}

      {/* Show spinner while loading revenue data, otherwise show the bar chart.
          If debugging, check that 'data' and 'dataKey' are correct for the chart. */}
      {showSpinner ? (
        <div style={{
          width: "100%", height: 420, border: "1px solid #eee",
          borderRadius: 8, display: "grid", placeItems: "center", background: "#fafafa"
        }}>
          <Spinner label="Loading revenue…" />
        </div>
      ) : (
        <CountryBarChart data={data} dataKey={dataKey} mode={mode} />
      )}
    </main>
  );
}
