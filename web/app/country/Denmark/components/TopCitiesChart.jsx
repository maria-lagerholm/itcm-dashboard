// app/country/Denmark/components/TopCitiesChart.jsx
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { COLORS, CHART, CARD, BUTTON, TOOLTIP, TEXT, UI } from "../../../theme";
import useTopCities from "../hooks/useTopCities";
import { fmtInt } from "../utils/formatters";

function CityRevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload ?? {};
  return (
    <div style={{ ...TOOLTIP.base, fontSize: TEXT.size, color: TEXT.color, fontFamily: TEXT.family }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.city}</div>
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
  const { mode, setMode, data, dataKey, titleSuffix } = useTopCities({
    country,
    countryId,
    limit,
  });

  const btn = (active) => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
  });

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
          fontSize: TEXT.size,
          fontFamily: TEXT.family,
          color: TEXT.color,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          {titlePrefix} · Top {limit} cities by {titleSuffix}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMode("customers")} style={btn(mode === "customers")}>
            Customers
          </button>
          <button onClick={() => setMode("revenue")} style={btn(mode === "revenue")}>
            Total Revenue (KSEK)
          </button>
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
            <CartesianGrid
              strokeDasharray={UI.grid.strokeDasharray}
              stroke={COLORS.grid}
            />
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
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
              />
            ) : (
              <Tooltip
                formatter={(v) => [fmtInt(v), "Customers"]}
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
                wrapperStyle={{ ...TOOLTIP.base }}
                contentStyle={{ ...TOOLTIP.base }}
              />
            )}
            <Bar dataKey={dataKey} fill={COLORS.primary} radius={CHART.barRadius} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
