// app/country/Denmark/components/MonthlyRevenueToggle.jsx
"use client";

import { useState, useMemo } from "react";
import COUNTRY from "../country";
import MonthlySalesChart from "./MonthlySalesChart";
import MonthlyForecastChart from "./MonthlyForecastChart";
import { BUTTON, TEXT, HEADINGS, LAYOUT, SECTION } from "../../../theme";

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const labelFromRange = (startYM, endYM) => {
  const [sy, sm] = startYM.split("-").map(Number);
  const [ey, em] = endYM.split("-").map(Number);
  return `${monthNames[(sm - 1 + 12) % 12]} ${sy} – ${monthNames[(em - 1 + 12) % 12]} ${ey}`;
};

export default function MonthlyRevenueToggle({
  country = COUNTRY,
  histStartYM = "2024-06",
  histEndYM   = "2025-05",
  forecastStartYM = "2025-06",
  forecastEndYM   = "2026-05",
}) {
  const [view, setView] = useState("hist"); // "hist" | "forecast"

  const histLabel = useMemo(() => labelFromRange(histStartYM, histEndYM), [histStartYM, histEndYM]);
  const forecastLabel = useMemo(() => labelFromRange(forecastStartYM, forecastEndYM), [forecastStartYM, forecastEndYM]);

  const btn = (active) => ({
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
          <button style={btn(view === "hist")} onClick={() => setView("hist")}>
            {histLabel}
          </button>
          <button style={btn(view === "forecast")} onClick={() => setView("forecast")}>
            {forecastLabel}
          </button>
        </div>
      </div>

      {view === "hist" ? (
        <MonthlySalesChart country={country} startYM={histStartYM} endYM={histEndYM} />
      ) : (
        <MonthlyForecastChart country={country} startYM={forecastStartYM} endYM={forecastEndYM} />
      )}
    </section>
  );
}
