// components/TopCitiesChart.jsx
"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { COLORS, CHART } from "../../../theme";
import useTopCities from "../hooks/useTopCities";
import { fmtInt } from "../utils/formatters";

function CityRevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload ?? {};
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 8, // Make the popup rectangle more round
      padding: "8px 10px",
      fontSize: 14,
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.city}</div>
      <div>Revenue: {fmtInt(p.ksek)} KSEK</div>
      {p.avg_order_value_sek != null && <div>Average order value: {fmtInt(p.avg_order_value_sek)} SEK</div>}
    </div>
  );
}

export default function TopCitiesChart({ countryId, titlePrefix = "Denmark" }) {
  const { mode, setMode, data, dataKey, titleSuffix } = useTopCities({ countryId });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, fontSize: 14 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>{titlePrefix} · Top 10 cities by {titleSuffix}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setMode("customers")}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: mode === "customers" ? "#f1f5f9" : "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          >
            Customers
          </button>
          <button
            onClick={() => setMode("revenue")}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: mode === "revenue" ? "#f1f5f9" : "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          >
            Total Revenue (KSEK)
          </button>
        </div>
      </div>

      {/* Single outer box; set fontSize:14 so ticks/tooltip/buttons match exactly */}
      <div style={{ width: "100%", height: 420, border: "1px solid #eee", borderRadius: 8, padding: 12, background: "#fff", fontSize: 14 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="city"
              tick={{ fontSize: 14 }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 14 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtInt}
            />
            {mode === "revenue" ? (
              <Tooltip
                content={<CityRevenueTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.035)", radius: 6 }}
                wrapperStyle={{ fontSize: 14, borderRadius: 16 }} // Ensure round corners for default tooltip as well
                contentStyle={{ borderRadius: 16 }} // Extra: in case default tooltip is used
              />
            ) : (
              <Tooltip
                formatter={(v) => [fmtInt(v), "Customers"]}
                cursor={{ fill: "rgba(0,0,0,0.035)", radius: 6 }}
                wrapperStyle={{ fontSize: 14, borderRadius: 8 }}
                contentStyle={{ borderRadius: 8 }}
              />
            )}
            <Bar dataKey={dataKey} fill={COLORS.primary} radius={CHART.barRadius} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
