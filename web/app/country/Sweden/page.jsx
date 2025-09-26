"use client";

import TopCitiesChart from "./components/TopCitiesChart";
import AgeDistributionSection from "./components/AgeDistributionSection";
import MonthlyRevenueToggle from "./components/MonthlyRevenueToggle";
import ChannelBar from "./components/channel_bar";
import TopBrandsSection from "./components/TopBrandsSection";
import TopCategoriesSection from "./components/TopCategoriesSection";
import TopProductsSection from "./components/TopProductsSection";
import TopRepurchaseSection from "./components/TopRepurchaseSection";
import { COUNTRY } from "./country";
import { FLOW } from "@/app/theme";

// Main page for Denmark country dashboard
export default function DenmarkPage() {
  return (
    <main
      style={{
        ...FLOW.page,
        padding: 20,
        maxWidth: 1200,
        margin: "10px auto",
        fontSize: 14,
      }}
    >
      <TopCitiesChart country={COUNTRY} titlePrefix={COUNTRY} />
      <ChannelBar />
      <AgeDistributionSection />
      <MonthlyRevenueToggle />
      <TopProductsSection />
      <TopBrandsSection />
      <TopRepurchaseSection />
      <TopCategoriesSection />
    </main>
  );
}
