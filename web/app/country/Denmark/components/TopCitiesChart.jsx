"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { COLORS, CHART, CARD, BUTTON, TOOLTIP, TEXT, UI } from "../../../theme";
import useTopCities from "../hooks/useTopCities";
import { fmtInt } from "../utils/formatters";
import { COUNTRY } from "../country";
import CityTooltip from "../components/CityTooltip";

export default function TopCitiesChart({
  country,
  countryId,
  titlePrefix = country ?? COUNTRY,
  limit = 10,
}) {
  const { mode, setMode, data, dataKey, titleSuffix } = useTopCities({ country, countryId, limit });

  const btnStyle = (active) => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
    color: TEXT.color,
  });

  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontSize: TEXT.size,
        fontFamily: TEXT.family,
        color: TEXT.color,
      }}>
        <h3 style={{ color: TEXT.color }}>
          {titlePrefix} · Top {limit} cities by {titleSuffix}
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMode("customers")} style={btnStyle(mode === "customers")}>Customers</button>
          <button onClick={() => setMode("revenue")} style={btnStyle(mode === "revenue")}>Total Revenue (KSEK)</button>
        </div>
      </div>

      <div style={{
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
      }}>
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
            <Tooltip
              content={<CityTooltip mode={mode} />}
              contentStyle={TOOLTIP.base}
              cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
            />
            <Bar dataKey={dataKey} fill={COLORS.series.city} radius={CHART.barRadius} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
