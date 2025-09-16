"use client";

import { formatNumberWithSpace } from "./lib/number";
import ChartToolbar from "./components/ChartToolbar";
import CountryBarChart from "./components/CountryBarChart";
import { useCountryDatasets } from "./hooks/useCountryDatasets";

export default function Home() {
  const { mode, setMode, data, dataKey, totalRevenueKSEK } = useCountryDatasets();

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 1,
            margin: 0,
            textAlign: "center",
            color: "#1e293b",
            textTransform: "uppercase",
            lineHeight: 1.1,
            textShadow: "0 2px 12px rgba(30,41,59,0.08)",
          }}
        >
          <span style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif", fontWeight: 800 }}>
            Åshild Analytics
          </span>
        </h1>
      </header>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif", fontWeight: 700 }}>
          {mode === "customers" ? "Customers by Country" : "Total Revenue by Country"}
        </h2>
        <ChartToolbar mode={mode} setMode={setMode} />
      </div>

      {mode === "revenue" && (
        <div style={{ marginBottom: 16, fontWeight: 500 }}>
          Total Revenue: {formatNumberWithSpace(totalRevenueKSEK)} KSEK
        </div>
      )}

      <CountryBarChart data={data} dataKey={dataKey} />
    </main>
  );
}
