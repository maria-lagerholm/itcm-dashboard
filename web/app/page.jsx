// app/page.jsx
"use client";

import { formatNumberWithSpace } from "./lib/number";
import ChartToolbar from "./components/ChartToolbar";
import Spinner from "./components/Spinner";
import { useCountryDatasets } from "./hooks/useCountryDatasets";
import { useReturningBuckets } from "./hooks/useReturningBuckets";
import CountryBarChart from "./components/CountryBarChart";
import ReturningPatterns from "./components/ReturningPatterns"; // ← fixed path

export default function Home() {
  const {
    mode, setMode,
    data, dataKey, totalRevenueKSEK,
    revenueLoading, revenueError,
    segmentsRows, segmentsLoading, segmentsError,
  } = useCountryDatasets();

  const showRevenueSpinner = mode === "revenue" && revenueLoading;
  const showCustomersSpinner = mode === "customers" && segmentsLoading;

  // Returning buckets (bucket → customers)
  const {
    rows: returningRows,
    total: returningTotal,
    loading: returningLoading,
    error: returningError,
  } = useReturningBuckets();

  // Customer total (for customers mode)
  const totalCustomerCount =
    mode === "customers" && Array.isArray(segmentsRows) && segmentsRows.length > 0
      ? segmentsRows.reduce(
          (sum, row) =>
            sum +
            (typeof row.New === "number" ? row.New : 0) +
            (typeof row.Repeat === "number" ? row.Repeat : 0) +
            (typeof row.Loyal === "number" ? row.Loyal : 0),
          0
        )
      : 0;

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
        <h3 style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif", fontWeight: 500 }}>
          {mode === "customers" ? "Customers" : "Total Revenue by Country"}
        </h3>
        <ChartToolbar mode={mode} setMode={setMode} />
      </div>

      {/* Revenue total only for revenue mode */}
      {mode === "revenue" && !showRevenueSpinner && (
        <div style={{ marginBottom: 16, fontWeight: 500 }}>
          Total Revenue: {formatNumberWithSpace(totalRevenueKSEK)} KSEK
          {Array.isArray(data) && data.length > 0 && typeof data[0].orders === "number" && (
            <> · Total Orders: {formatNumberWithSpace(data.reduce((s, r) => s + (r.orders || 0), 0))}</>
          )}
        </div>
      )}

      {/* Customer total only for customers mode */}
      {mode === "customers" && !showCustomersSpinner && (
        <div style={{ marginBottom: 16, fontWeight: 500 }}>
          Total customers: {formatNumberWithSpace(totalCustomerCount)}
        </div>
      )}

      {/* Errors */}
      {mode === "revenue" && revenueError && (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{revenueError}</div>
      )}
      {mode === "customers" && segmentsError && (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{segmentsError}</div>
      )}

      {/* MAIN chart area (countries) */}
      {(showRevenueSpinner || showCustomersSpinner) ? (
        <div style={{
          width: "100%", height: 420, border: "1px solid #eee",
          borderRadius: 8, display: "grid", placeItems: "center", background: "#fafafa"
        }}>
          <Spinner label={mode === "revenue" ? "Loading revenue…" : "Loading segments…"} />
        </div>
      ) : (
        mode === "customers" ? (
          <CountryBarChart
            data={segmentsRows}
            seriesKeys={["New", "Repeat", "Loyal"]}
          />
        ) : (
          <CountryBarChart
            data={data}
            dataKey={dataKey}
            mode={mode}
          />
        )
      )}

      {/* Returning patterns — BELOW the main chart, horizontal bars */}
      <section style={{ marginTop: 28 }}>
        <h3 style={{ fontFamily: "'Inter','Segoe UI',sans-serif", fontWeight: 500, marginBottom: 36 }}>
            Time from first to second order
        </h3>

        {returningLoading ? (
          <div style={{
            width: "100%", height: 420, border: "1px solid #eee",
            borderRadius: 8, display: "grid", placeItems: "center", background: "#fafafa"
          }}>
            <Spinner label="Loading returning…" />
          </div>
        ) : returningError ? (
          <div style={{ color: "#b91c1c", marginBottom: 12 }}>
            Returning error: {returningError}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              Total returning customers: {formatNumberWithSpace(returningTotal)}
            </div>
            <ReturningPatterns
              data={returningRows}    // [{ country: bucket, count: customers }, ...]
              categoryKey="country"   // Y-axis: bucket labels
              valueKey="count"        // X-axis: customers
              height={520}
              legend={false}
            />
          </>
        )}
      </section>
    </main>
  );
}
