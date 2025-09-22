"use client";

import TopCitiesChart from "./components/TopCitiesChart";
import AgeDistributionSection from "./components/AgeDistributionSection";
import MonthlyRevenueToggle from "./components/MonthlyRevenueToggle";
import ChannelBar from "./components/channel_bar"; 

export default function DenmarkPage() {
  const COUNTRY_ID = 58;
  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto", fontSize: 14 }}>
      <TopCitiesChart countryId={COUNTRY_ID} titlePrefix="Denmark" />
      <ChannelBar country="Denmark" /> {/* ← PascalCase usage */}
      <AgeDistributionSection country="Denmark" />
      <MonthlyRevenueToggle country="Denmark" />
    </main>
  );
}
