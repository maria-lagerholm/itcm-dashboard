"use client";

import ChartToolbar from "./components/ChartToolbar";
import Spinner from "./components/Spinner";
import { useCustomersByCountry } from "./hooks/useCustomersByCountry";
import { useRevenueByCountry } from "./hooks/useRevenueByCountry";
import CustomersCountryBarChart from "./components/CustomersCountryBarChart";
import RevenueCountryBarChart from "./components/RevenueCountryBarChart";
import ReturningPatterns from "./components/ReturningPatterns";
import ComplementsSection from "./components/ComplementsSection";
import { useReturningBuckets } from "./hooks/useReturningBuckets";
import SemanticSimilaritySection from "./components/SemanticSimilaritySection";
import Basket_cf_Section from "./components/Basket_cf_Section";
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
      <header>
        <h1 style={{ textAlign: "center" }}>
          Åshild Analytics (2024-06-01 - present)
        </h1>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <h3>
            {mode === "customers" ? "Customers" : "Total Revenue by Country"}
          </h3>
          <ChartToolbar mode={mode} setMode={setMode} />
        </div>
      </header>
      {mode === "revenue" && revenueError && (
        <div style={{ marginBottom: 12 }}>{revenueError}</div>
      )}
      {mode === "customers" && segmentsError && (
        <div style={{ marginBottom: 12 }}>{segmentsError}</div>
      )}
      {(showRevenueSpinner || showCustomersSpinner) ? (
        <div>
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
          <div>
            <Spinner label="Loading returning…" />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              Total returning customers: {formatNumberWithSpace(returningTotal)}
            </div>
            <ReturningPatterns
              data={returningRows}
              categoryKey="country"
              valueKey="count"
              compact
            />
          </>
        )}
      </section>
      <section style={{ marginTop: 60 }}>
        <ComplementsSection/>
      </section>
      <section style={{ marginTop: 60 }}>
        <SemanticSimilaritySection/>
      </section>
      <section style={{ marginTop: 60, marginBottom: 200 }}>
        <Basket_cf_Section/>
      </section>
    </main>
  );
}
