"use client";

import { formatNumberWithSpace } from "./lib/number";
import ChartToolbar from "./components/ChartToolbar";
import CountryBarChart from "./components/CountryBarChart";
import Spinner from "./components/Spinner";
import { useCountryDatasets } from "./hooks/useCountryDatasets";

export default function Home() {
  const {
    mode, setMode, data, dataKey, totalRevenueKSEK,
    revenueLoading, revenueError,
  } = useCountryDatasets();

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

      {/* Show totals only when loaded */}
      {mode === "revenue" && !showSpinner && (
        <div style={{ marginBottom: 16, fontWeight: 500 }}>
          Total Revenue: {formatNumberWithSpace(totalRevenueKSEK)} KSEK
          {/*
            Calculate total orders by summing up the 'orders' field in the revenue array.
            If revenue is not available, show nothing.
          */}
          {Array.isArray(data) && data.length > 0 && typeof data[0].orders === "number" && (
            <>
              {"  "}·{" "}
              Total Orders: {formatNumberWithSpace(data.reduce((sum, r) => sum + (r.orders || 0), 0))}
            </>
          )}
        </div>
      )}

      {/* Optional error message */}
      {mode === "revenue" && revenueError && (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{revenueError}</div>
      )}

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
