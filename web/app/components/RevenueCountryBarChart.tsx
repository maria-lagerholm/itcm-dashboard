"use client";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { RowRevenue } from "../hooks/useRevenueByCountry";
import { COLORS, CHART, CARD, TEXT, UI, TOOLTIP } from "../theme";

type Props = {
  data: RowRevenue[];
  totalRevenueKSEK?: number | null;
  totalOrders?: number | null;
};

const fmt = (n: unknown) => Number(n ?? 0).toLocaleString("sv-SE");

function RevenueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div style={{ ...TOOLTIP.base, fontSize: TEXT.size, color: TEXT.color, fontFamily: TEXT.family }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.country}</div>
      {"ksek" in p && <div><strong>Revenue:</strong> {fmt(p.ksek)} KSEK</div>}
      {"aov_sek" in p && <div><strong>Avg order value:</strong> {fmt(p.aov_sek)} SEK</div>}
      {"orders" in p && <div><strong>Order count:</strong> {fmt(p.orders)}</div>}
    </div>
  );
}

export default function RevenueCountryBarChart({
  data, totalRevenueKSEK, totalOrders
}: Props) {
  const router = useRouter();
  const yFmt = (v: any) => fmt(v);

  const onBarClick = (e: any) => {
    const country = e?.payload?.country ?? e?.country;
    if (country) router.push(`/country/${encodeURIComponent(country)}`);
  };

  // Unified header line
  const headerItems: string[] = [];
  if (totalRevenueKSEK != null) headerItems.push(`Total revenue: ${fmt(totalRevenueKSEK)} KSEK`);
  if (totalOrders != null) headerItems.push(`Total orders: ${fmt(totalOrders)}`);

  return (
    <div
      style={{
        width: "100%", height: 460, border: CARD.border, borderRadius: CARD.radius,
        padding: CARD.padding, background: CARD.bg, boxSizing: "border-box",
        fontFamily: TEXT.family, fontSize: TEXT.size, color: TEXT.color,
        display: "grid", gridTemplateRows: "auto 1fr", rowGap: 8
      }}
    >
      {headerItems.length ? (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ whiteSpace: "pre" }}>{headerItems.join(" · ")}</span>
        </div>
      ) : <div />}

      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={CHART.margin}
        >
          <CartesianGrid strokeDasharray={UI.grid.strokeDasharray} stroke={COLORS.grid} />
          <XAxis
            dataKey="country"
            tick={{ fontSize: CHART.tickFont, fill: TEXT.color }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: CHART.tickFont, fill: TEXT.color }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yFmt}
          />
          <Tooltip
            content={(props) => <RevenueTooltip {...props} />}
            cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
          />
          <Bar
            dataKey="ksek"
            fill={COLORS.series.revenue}
            stroke="none"
            radius={CHART.barRadius as unknown as [number, number, number, number]}
            barSize={100}
            onClick={onBarClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}