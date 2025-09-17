"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { TopCitiesChart, AgeDistributionChart } from "./Charts";
import { CHART, COLORS as THEME_COLORS } from "../../theme";

const COLORS = {
  female: "#ad92b2",
  male:   "#6081a4",
};

export default function Finland() {
  const [mode, setMode] = useState("customers"); // "customers" | "revenue"
  const [rowsCustomers, setRowsCustomers] = useState([]);
  const [rowsRevenue, setRowsRevenue] = useState([]);

  const [genderMode, setGenderMode] = useState("Female"); // "Female" | "Male" | "Both"
  const [agesSorted, setAgesSorted] = useState([]);
  const [ageByCountry, setAgeByCountry] = useState(null);
  const [ageLoading, setAgeLoading] = useState(false);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Top cities by unique customers
  useEffect(() => {
    fetch(`${base}/api/country/72/top-cities?limit=10`)
      .then((r) => r.json())
      .then((j) => setRowsCustomers(Array.isArray(j.top_cities) ? j.top_cities : []))
      .catch((e) => console.error("Error fetching Finland top cities by customers:", e));
  }, [base]);

  // Top cities by revenue (lazy fetch when switching to revenue)
  useEffect(() => {
    if (mode !== "revenue" || rowsRevenue.length) return;
    fetch(`${base}/api/cities_by_revenue`)
      .then((r) => r.json())
      .then((j) => {
        const finland = j?.top_cities_by_revenue_ksek?.["Finland"];
        setRowsRevenue(Array.isArray(finland) ? finland : []);
      })
      .catch((e) => console.error("Error fetching Finland top cities by revenue:", e));
  }, [mode, rowsRevenue.length, base]);

  // Age distribution
  useEffect(() => {
    setAgeLoading(true);
    fetch(`${base}/api/customers_age_gender`)
      .then((r) => r.json())
      .then((json) => {
        setAgesSorted(Array.isArray(json.ages_sorted) ? json.ages_sorted : []);
        setAgeByCountry(json.by_country || {});
      })
      .catch((e) => console.error("Error fetching customers_age_gender:", e))
      .finally(() => setAgeLoading(false));
  }, [base]);

  const topCitiesData = useMemo(
    () => (mode === "customers" ? rowsCustomers : rowsRevenue),
    [mode, rowsCustomers, rowsRevenue]
  );

  return (
    <main className={styles.main}>
      {/* --- Top cities --- */}
      <section className={styles.sectionCard}>
        <header className={styles.headerRow}>
          <h2 className={styles.h2}>
            Finland · Top 10 cities by {mode === "customers" ? "unique customers" : "revenue (KSEK)"}
          </h2>
          <div className={styles.toggleRow}>
            <button
              onClick={() => setMode("customers")}
              className={`${styles.toggleBtn} ${mode === "customers" ? styles.active : ""}`}
            >
              Customers
            </button>
            <button
              onClick={() => setMode("revenue")}
              className={`${styles.toggleBtn} ${mode === "revenue" ? styles.active : ""}`}
            >
              Total Revenue (KSEK)
            </button>
          </div>
        </header>

        <TopCitiesChart
          data={topCitiesData}
          mode={mode}
          CHART={CHART}
          color={THEME_COLORS.primary}
        />
      </section>

      {/* --- Age distribution --- */}
      <section className={styles.sectionCard}>
        <header className={styles.headerRow}>
          <h3 className={styles.h3}>Finland · Age distribution by gender</h3>
          <div className={styles.toggleRow}>
            <button
              onClick={() => setGenderMode("Female")}
              className={`${styles.toggleBtn} ${genderMode === "Female" ? styles.active : ""}`}
            >
              Female
            </button>
            <button
              onClick={() => setGenderMode("Male")}
              className={`${styles.toggleBtn} ${genderMode === "Male" ? styles.active : ""}`}
            >
              Male
            </button>
            <button
              onClick={() => setGenderMode("Both")}
              className={`${styles.toggleBtn} ${genderMode === "Both" ? styles.active : ""}`}
            >
              Both
            </button>
          </div>
        </header>

        <AgeDistributionChart
          agesSorted={agesSorted}
          ageByCountry={ageByCountry}
          genderMode={genderMode}
          loading={ageLoading}
          CHART={CHART}
          femaleColor={COLORS.female}
          maleColor={COLORS.male}
        />
      </section>
    </main>
  );
}
