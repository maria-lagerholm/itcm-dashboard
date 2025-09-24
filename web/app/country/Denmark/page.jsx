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
import { COUNTRY_ID } from "./country";
import { COUNTRY } from "./country";

export default function DenmarkPage() {
  return (
    <main style={{ padding: 20, maxWidth: 1200, margin: "10px auto", fontSize: 14 }}>
      <TopCitiesChart countryId={COUNTRY_ID} titlePrefix={COUNTRY} />
      <ChannelBar/>
      <AgeDistributionSection />
      <MonthlyRevenueToggle />
      <TopBrandsSection />
      <TopCategoriesSection/>
      <TopProductsSection />
      <TopRepurchaseSection />
    </main>
  );
}
