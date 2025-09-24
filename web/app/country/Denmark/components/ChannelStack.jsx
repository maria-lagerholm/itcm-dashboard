"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, Customized, Rectangle
} from "recharts";
import { CHANNEL_COLORS, CARD, TEXT, CHART, TOOLTIP } from "../../../theme";
import { fmtInt } from "../utils/formatters";

export default function ChannelStack({ rows = [], data = [], height = 110 }) {
  return (
    <div
      style={{
        width: "100%", height,
        border: CARD.border, borderRadius: CARD.radius, background: CARD.bg,
        padding: CARD.padding, boxSizing: "border-box", fontFamily: TEXT.family
      }}
    >
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ ...CHART.margin, top: 4, bottom: 4, left: 6 }}>
          <XAxis type="number" domain={[0, 1]} hide />
          <YAxis type="category" dataKey="_label" tick={false} axisLine={false} width={0} />
          {rows.map((r, i) => (
            <Bar
              key={r.channel}
              dataKey={r.channel}
              stackId="1"
              fill={CHANNEL_COLORS[r.channel] ?? "#8ab7c0"}
              radius={i === 0 ? [8, 0, 0, 8] : i === rows.length - 1 ? [0, 8, 8, 0] : 0}
            />
          ))}
          <Tooltip
                cursor={false}
                wrapperStyle={{ fontSize: 14, zIndex: 10, pointerEvents: "none" }}
                contentStyle={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, boxShadow: "0 4px 10px rgba(0,0,0,.05)", color: "#000", fontSize: 14 }}
                labelStyle={{ color: "#000", fontSize: 14 }}
                itemStyle={{ color: "#000", fontSize: 14 }}
                formatter={(val, name) => {
                  const pct = Math.round(Number(val || 0) * 100);
                  const count = rows.find(x => x.channel === name)?.customers_count ?? 0;
                  return [`${pct}% (${fmtInt(count)})`, name?.toString().replace(/\b\w/g, m => m.toUpperCase())];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={24}
                wrapperStyle={{ fontSize: 14, color: "#000", position: "relative", zIndex: 0 }}
                formatter={(v) => <span style={{ color: "#000", fontSize: 14 }}>{v?.toString().replace(/\b\w/g, m => m.toUpperCase())}</span>}
              />
              <Customized
                component={({ isTooltipActive, tooltipCoordinate, tooltipAxisBandSize, offset }) => {
                  if (!isTooltipActive || !tooltipCoordinate) return null;
                  const w = Math.max(tooltipAxisBandSize || 0, 0);
                  const x0 = tooltipCoordinate.x - w / 2;
                  return <Rectangle x={x0} y={offset.top} width={w} height={offset.height} radius={8} fill="rgba(0,0,0,0.035)" pointerEvents="none" />;
                }}
              />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
