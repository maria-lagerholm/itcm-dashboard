// components/TopCitiesChart.jsx
"use client";

import COUNTRY from "../country";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { COLORS, CHART, CARD, BUTTON, TOOLTIP, TEXT } from "../../../theme";
import useTopCities from "../hooks/useTopCities";
import { fmtInt } from "../utils/formatters";

function CityRevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload ?? {};
  return (
    <div style={TOOLTIP.base}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.city}</div>
      <div>Revenue: {fmtInt(p.ksek)} KSEK</div>
      {p.avg_order_value_sek != null && <div>Average order value: {fmtInt(p.avg_order_value_sek)} SEK</div>}
    </div>
  );
}

export default function TopCitiesChart({ countryId, titlePrefix = COUNTRY }) {
  const { mode, setMode, data, dataKey, titleSuffix } = useTopCities({ countryId });

  const btn = (active) => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, fontSize: TEXT.size, fontFamily: TEXT.family }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>{titlePrefix} · Top 10 cities by {titleSuffix}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMode("customers")} style={btn(mode === "customers")}>Customers</button>
          <button onClick={() => setMode("revenue")}   style={btn(mode === "revenue")}>Total Revenue (KSEK)</button>
        </div>
      </div>

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
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="city" tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} angle={-20} dy={10} />
            <YAxis tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} tickFormatter={fmtInt} />
            {mode === "revenue" ? (
              <Tooltip
                content={<CityRevenueTooltip />}
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
                wrapperStyle={{ fontSize: TEXT.size, borderRadius: 8 }}
                contentStyle={{ borderRadius: 8 }}
              />
            ) : (
              <Tooltip
                formatter={(v) => [fmtInt(v), "Customers"]}
                cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
                wrapperStyle={{ fontSize: TEXT.size, borderRadius: 8 }}
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
