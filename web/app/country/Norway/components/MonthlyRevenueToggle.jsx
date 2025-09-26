"use client";

import { useState, useMemo } from "react";
import COUNTRY from "../country";
import MonthlySalesChart from "./MonthlySalesChart";
import MonthlyForecastChart from "./MonthlyForecastChart";
import { BUTTON, TEXT, HEADINGS, LAYOUT, SECTION } from "../../../theme";

// Month helpers
const monthIndex = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1); // 0-based month index
};
const monthsBetweenInclusive = (startYM, endYM) =>
  monthIndex(endYM) - monthIndex(startYM) + 1;

const labelFromRange = (startYM, endYM) => {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const [sy, sm] = startYM.split("-").map(Number);
  const [ey, em] = endYM.split("-").map(Number);
  return `${months[sm - 1]} ${sy} – ${months[em - 1]} ${ey}`;
};

export default function MonthlyRevenueToggle({
  country = COUNTRY,
  histStartYM = "2024-06",
  histEndYM = "2025-05",
  forecastStartYM = "2025-06",
  forecastEndYM = "2026-05",
}) {
  const [view, setView] = useState("hist");

  const histLabel = useMemo(() => labelFromRange(histStartYM, histEndYM), [histStartYM, histEndYM]);
  const forecastLabel = useMemo(() => labelFromRange(forecastStartYM, forecastEndYM), [forecastStartYM, forecastEndYM]);

  // Convert forecast range → props for MonthlyForecastChart
  // Our MonthlyForecastChart expects:
  //   - anchorEndYM: month immediately BEFORE the first month of the range
  //   - months: number of months in the range (inclusive)
  const anchorEndYM = useMemo(() => {
    // month before forecastStartYM
    const [y, m] = forecastStartYM.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, 1));
    d.setUTCMonth(d.getUTCMonth() - 1);
    const yy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${yy}-${mm}`;
  }, [forecastStartYM]);

  const forecastMonths = useMemo(
    () => monthsBetweenInclusive(forecastStartYM, forecastEndYM),
    [forecastStartYM, forecastEndYM]
  );

  const btnStyle = (active) => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
    fontFamily: TEXT.family,
    color: TEXT.color,
  });

  return (
    <section style={SECTION.container(LAYOUT)}>
      <div style={SECTION.header(TEXT)}>
        <h3 style={{ ...HEADINGS.h3, fontFamily: TEXT.family, color: TEXT.color }}>
          {country} · Monthly revenue (KSEK)
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnStyle(view === "hist")} onClick={() => setView("hist")}>
            {histLabel}
          </button>
          <button style={btnStyle(view === "forecast")} onClick={() => setView("forecast")}>
            {forecastLabel}
          </button>
        </div>
      </div>

      {view === "hist" ? (
        <MonthlySalesChart
          country={country}
          startYM={histStartYM}
          endYM={histEndYM}
        />
      ) : (
        <MonthlyForecastChart
          country={country}
          anchorEndYM={anchorEndYM}
          months={forecastMonths}
        />
      )}
    </section>
  );
}
