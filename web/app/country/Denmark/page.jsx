// app/country/Denmark/page.jsx
"use client";

import TopCitiesChart from "./components/TopCitiesChart";
import AgeDistributionSection from "./components/AgeDistributionSection";
import MonthlyRevenueToggle from "./components/MonthlyRevenueToggle";
import ChannelBar from "./components/channel_bar";
import TopBrandsSection from "./components/TopBrandsSection";
import TopCategoriesSection from "./components/TopCategoriesSection";

export default function DenmarkPage() {
  const COUNTRY_ID = 58;
  const fontFamily = "'Helvetica Neue'";

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto", fontSize: 14, fontFamily }}>
      <TopCitiesChart countryId={COUNTRY_ID} titlePrefix="Denmark" />
      <ChannelBar country="Denmark" />
      <AgeDistributionSection country="Denmark" />
      <MonthlyRevenueToggle country="Denmark" />

      <TopBrandsSection country="Denmark" limit={10} height={280} title="Denmark · Top Brands" />

      {/* New: Top Categories (Treemap) with Season + Year toggles */}
      <TopCategoriesSection country="Denmark" limit={12} height={300} title="Denmark · Top Categories (Treemap)" />
    </main>
  );
}
