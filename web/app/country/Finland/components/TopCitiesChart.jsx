// app/country/Denmark/components/TopCitiesChart.jsx
"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { COLORS, CHART, CARD, BUTTON, TOOLTIP, TEXT, UI } from "../../../theme";
import useTopCities from "../hooks/useTopCities";
import { fmtInt } from "../utils/formatters";

function CityRevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload ?? {};
  return (
    <div style={{ ...TOOLTIP.base, fontFamily: TEXT.family, fontSize: TEXT.size, color: TEXT.color }}>
      {"ksek" in p && <div>Revenue: {fmtInt(p.ksek)} KSEK</div>}
      {"avg_order_value_sek" in p && (
        <div>Average order value: {fmtInt(p.avg_order_value_sek)} SEK</div>
      )}
    </div>
  );
}

export default function TopCitiesChart({
  country,
  countryId,
  titlePrefix = country ?? "Denmark",
  limit = 10,
}) {
  const { mode, setMode, data, dataKey, titleSuffix } = useTopCities({ country, countryId, limit });

  const btn = (active) => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
    color: TEXT.color,
  });

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: TEXT.size,
          fontFamily: TEXT.family,
          color: TEXT.color,
        }}
      >
        <h3 style={{ color: TEXT.color }}>
          {titlePrefix} · Top {limit} cities by {titleSuffix}
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMode("customers")} style={btn(mode === "customers")}>Customers</button>
          <button onClick={() => setMode("revenue")} style={btn(mode === "revenue")}>Total Revenue (KSEK)</button>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          height: 420,
          border: CARD.border,
          borderRadius: CARD.radius,
          padding: CARD.padding,
          background: CARD.bg,
          boxSizing: "border-box",
          fontSize: TEXT.size,
          fontFamily: TEXT.family,
          color: TEXT.color,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART.margin}>
            <CartesianGrid strokeDasharray={UI.grid.strokeDasharray} stroke={COLORS.grid} />
            <XAxis
              dataKey="city"
              tick={{ fontSize: CHART.tickFont, fill: TEXT.color }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              dy={10}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: CHART.tickFont, fill: TEXT.color }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtInt}
            />

            {mode === "revenue" ? (
              <Tooltip
                content={<CityRevenueTooltip />}
                // Reset wrapper so only the custom content (TOOLTIP.base) draws the card
                wrapperStyle={TOOLTIP.wrapperReset}
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
              />
            ) : (
              <Tooltip
                // Use the *default* tooltip; style only with theme tokens made for default tooltip
                formatter={(v) => [fmtInt(v), "Customers"]}
                wrapperStyle={TOOLTIP.wrapperReset}      // transparent wrapper
                itemStyle={TOOLTIP.item}                 // text styling from theme
                labelStyle={TOOLTIP.label}
                contentStyle={TOOLTIP.base}              // one rounded card (theme)
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
              />
            )}

            <Bar dataKey={dataKey} fill={COLORS.series.city} radius={CHART.barRadius} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
