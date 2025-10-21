"use client";

import TopCitiesChart from "./components/TopCitiesChart";
import AgeDistributionSection from "./components/AgeDistributionSection";
import MonthlyRevenueToggle from "./components/MonthlyRevenueToggle";
import ChannelBar from "./components/channel_bar";
import ChannelShareMonthly from "./components/ChannelShareMonthly";
import TopBrandsSection from "./components/TopBrandsSection";
import TopCategoriesSection from "./components/TopCategoriesSection";
import TopProductsSection from "./components/TopProductsSection";
import TopRepurchaseSection from "./components/TopRepurchaseSection";
import { COUNTRY } from "./country";
import { FLOW } from "@/app/theme";

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
      <AgeDistributionSection />
      <ChannelBar />
      <ChannelShareMonthly />
      <MonthlyRevenueToggle />
      <TopProductsSection />
      <TopBrandsSection />
      <TopRepurchaseSection />
      <TopCategoriesSection />
    </main>
  );
}
