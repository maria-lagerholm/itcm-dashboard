// app/country/Denmark/page.jsx
"use client";

import TopCitiesChart from "./components/TopCitiesChart";
import AgeDistributionSection from "./components/AgeDistributionSection";
import MonthlyRevenueToggle from "./components/MonthlyRevenueToggle";
import ChannelBar from "./components/channel_bar";
import TopBrandsSection from "./components/TopBrandsSection";
import TopCategoriesSection from "./components/TopCategoriesSection";
import TopProductsSection from "./components/TopProductsSection";
import TopRepurchaseSection from "./components/TopRepurchaseSection";

export default function DenmarkPage() {
  const COUNTRY_ID = 58;
  const fontFamily = "'Helvetica Neue'";

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto", fontSize: 14, fontFamily }}>
      <TopCitiesChart countryId={COUNTRY_ID} titlePrefix="Denmark" />
      <ChannelBar country="Denmark" />
      <AgeDistributionSection country="Denmark" />
      <MonthlyRevenueToggle country="Denmark" />
      <TopBrandsSection country="Denmark" />
      <TopCategoriesSection country="Denmark"/>
      <TopProductsSection country="Denmark" />
      <TopRepurchaseSection country="Denmark" />
    </main>
  );
}
