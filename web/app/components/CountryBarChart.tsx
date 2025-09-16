"use client";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { COLORS, CHART } from "../theme";

// fmt: Format numbers with Swedish locale (space as thousands separator).
// If debugging, check that n is a number or string convertible to number.
const fmt = (n, locale = "sv-SE") => Number(n ?? 0).toLocaleString(locale);

// CountryTooltip: Custom tooltip for bar chart.
// If debugging, check that 'payload' contains expected fields for the current mode (revenue/customers).
function CountryTooltip({ active, payload, isRevenue }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px",
                  boxShadow:"0 6px 20px rgba(15,23,42,0.08)", fontSize:13 }}>
      <div style={{ fontWeight:700, marginBottom:6 }}>{p.country}</div>
      {isRevenue ? (
        <>
          {/* If debugging, check that p.ksek, p.aov_sek, and p.orders are present for revenue mode */}
          {"ksek"    in p && <div><strong>Revenue:</strong> {fmt(p.ksek)} KSEK</div>}
          {"aov_sek" in p && <div><strong>Avg order value:</strong> {fmt(p.aov_sek)} SEK</div>}
          {"orders"  in p && <div><strong>Order count:</strong> {fmt(p.orders)}</div>}
        </>
      ) : (
        // For customers mode, ensure p.count is present
        "count" in p && <div><strong>Customers:</strong> {fmt(p.count)}</div>
      )}
    </div>
  );
}

// CountryBarChart: Renders a bar chart of countries by customers or revenue.
// If debugging, check that 'data' is an array of objects with 'country' and the correct dataKey.
// 'dataKey' should be "count" for customers or "ksek" for revenue.
// 'mode' should be either "customers" or "revenue".
export default function CountryBarChart({ data, dataKey, mode }) {
  const router = useRouter();
  // If debugging, check that isRevenue is true only for revenue mode or dataKey "ksek".
  const isRevenue = dataKey === "ksek" || mode === "revenue";

  // handleBarClick: Navigates to the country detail page when a bar is clicked.
  // If debugging, check that 'e' contains a valid country name.
  const handleBarClick = (e) => {
    const country = e?.payload?.country ?? e?.country;
    if (!country) return;
    // If your routes are /country/Sweden, /country/Norway, push the name directly.
    router.push(`/country/${encodeURIComponent(country)}`);
    // If you use slugs, convert here:
    // const slug = country.toLowerCase().replace(/\s+/g, "-");
    // router.push(`/country/${slug}`);
  };

  return (
    <div style={{ width:"100%", height:420, border:"1px solid #eee", borderRadius:8, padding:12 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={CHART.margin}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="country"
            tick={{ fontSize: CHART.tickFont }}
            tickLine={false}
            axisLine={false}
            angle={-15}
            dy={10}
            // If debugging, check that all data items have a 'country' property.
          />
          <YAxis
            tick={{ fontSize: CHART.tickFont }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmt(v)}
            // If debugging, check that Y values are numbers.
          />
          {/* Tooltip: Use function form so tooltip sees latest props.
              If debugging, check that tooltip displays correct values for the current mode. */}
          <Tooltip content={(props) => <CountryTooltip {...props} isRevenue={isRevenue} />} cursor={false} />
          <Bar
            dataKey={dataKey}
            fill={COLORS.primary}
            radius={CHART.barRadius}
            onClick={handleBarClick}
            // If debugging, check that bars are clickable and route to the correct country.
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
