"use client";

import ChartToolbar from "./components/ChartToolbar";
import Spinner from "./components/Spinner";
import { useCustomersByCountry } from "./hooks/useCustomersByCountry";
import { useRevenueByCountry } from "./hooks/useRevenueByCountry";
import CustomersCountryBarChart from "./components/CustomersCountryBarChart";
import RevenueCountryBarChart from "./components/RevenueCountryBarChart";
import ReturningPatterns from "./components/ReturningPatterns";
import CooccurrenceSection from "./components/CooccurrenceSection";
import { useReturningBuckets } from "./hooks/useReturningBuckets";
import { formatNumberWithSpace } from "./lib/number";
import { TEXT, UI, HEADINGS, CARD } from "./theme";
import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("customers");
  const {
    rows: segmentsRows,
    totalCustomers,
    loading: segmentsLoading,
    error: segmentsError,
  } = useCustomersByCountry();
  const {
    rows: revenueRows,
    totalRevenueKSEK,
    totalOrders,
    loading: revenueLoading,
    error: revenueError,
  } = useRevenueByCountry();
  const showRevenueSpinner = mode === "revenue" && revenueLoading;
  const showCustomersSpinner = mode === "customers" && segmentsLoading;
  const {
    rows: returningRows,
    total: returningTotal,
    loading: returningLoading,
    error: returningError,
  } = useReturningBuckets();

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto", fontFamily: TEXT.family, color: TEXT.color }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ textAlign: "center" }}>
          Åshild Analytics (2024-06-01 - present)
        </h1>
      </header>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h3>
          {mode === "customers" ? "Customers" : "Total Revenue by Country"}
        </h3>
        <ChartToolbar mode={mode} setMode={setMode} />
      </div>
      {mode === "revenue" && revenueError && (
        <div style={{ marginBottom: 12 }}>{revenueError}</div>
      )}
      {mode === "customers" && segmentsError && (
        <div style={{ marginBottom: 12 }}>{segmentsError}</div>
      )}
      {(showRevenueSpinner || showCustomersSpinner) ? (
        <div style={{
          width: "100%", height: 420, border: UI.surface.border ? `1px solid ${UI.surface.border}` : CARD.border,
          borderRadius: CARD.radius, display: "grid", placeItems: "center",
          background: UI.surface.subtle
        }}>
          <Spinner label={mode === "revenue" ? "Loading revenue…" : "Loading segments…"} />
        </div>
      ) : (
        mode === "customers" ? (
          <CustomersCountryBarChart data={segmentsRows} totalCustomers={totalCustomers} />
        ) : (
          <RevenueCountryBarChart data={revenueRows} totalRevenueKSEK={totalRevenueKSEK} totalOrders={totalOrders} />
        )
      )}
      <section style={{ marginTop: 28 }}>
        <h3>
          Time from first to second order
        </h3>
        {returningLoading ? (
          <div style={{
            width: "100%", height: 420, border: UI.surface.border ? `1px solid ${UI.surface.border}` : CARD.border,
            borderRadius: CARD.radius, display: "grid", placeItems: "center",
            background: UI.surface.subtle
          }}>
            <Spinner label="Loading returning…" />
          </div>
        ) : returningError ? (
          <div style={{ marginBottom: 12 }}>Returning error: {returningError}</div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              Total returning customers: {formatNumberWithSpace(returningTotal)}
            </div>
            <ReturningPatterns
              data={returningRows}
              categoryKey="country"
              valueKey="count"
              height={520}
              legend={false}
            />
          </>
        )}
      </section>
      <section style={{ marginTop: 36 }}>
        <CooccurrenceSection title="Frequently bought together (pairs, sorted by affinity strength)" />
      </section>
    </main>
  );
}
