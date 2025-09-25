"use client";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { COLORS, CHART, SEGMENT_ORDER, SEGMENT_LABELS, CARD, TEXT, UI, TOOLTIP } from "../theme";

type Row = Record<string, unknown> & { country: string };
type Props = {
  data: Row[];
  dataKey?: string;
  mode?: "customers" | "revenue";
  seriesKeys?: string[];
};

const fmt = (n: unknown) => Number(n ?? 0).toLocaleString("sv-SE");

function SegmentsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  const total = typeof p.total === "number"
    ? p.total
    : payload.reduce((s: number, r: any) => s + (Number(r?.value) || 0), 0);
  const ordered = SEGMENT_ORDER.map(k => payload.find((r: any) => r.dataKey === k)).filter(Boolean);
  return (
    <div style={{ ...TOOLTIP.base, fontSize: TEXT.size, color: TEXT.color, fontFamily: TEXT.family }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.country ?? ""}</div>
      {ordered.map((row: any) => {
        const val = Number(row?.value) || 0, pct = total ? (val / total) * 100 : 0;
        return (
          <div key={row.dataKey}>
            <strong>{row.dataKey}:</strong> {fmt(val)} ({pct.toFixed(1)}%)
          </div>
        );
      })}
      {total ? <div style={{ marginTop: 6, color: "#64748b" }}>Total customers: {fmt(total)}</div> : null}
    </div>
  );
}

function CountryTooltip({ active, payload, isRevenue }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div style={{ ...TOOLTIP.base, fontSize: TEXT.size, color: TEXT.color, fontFamily: TEXT.family }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.country}</div>
      {isRevenue ? (
        <>
          {"ksek" in p && <div><strong>Revenue:</strong> {fmt(p.ksek)} KSEK</div>}
          {"aov_sek" in p && <div><strong>Avg order value:</strong> {fmt(p.aov_sek)} SEK</div>}
          {"orders" in p && <div><strong>Order count:</strong> {fmt(p.orders)}</div>}
        </>
      ) : (
        "count" in p && <div><strong>Customers:</strong> {fmt(p.count)}</div>
      )}
    </div>
  );
}

function SegmentsLegend() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6, fontFamily: TEXT.family, color: TEXT.color }}>
      <div style={{ display: "flex", gap: 16,justifyContent: "center" }}>
        {SEGMENT_ORDER.map(k => (
          <div key={k} style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <span style={{
              width: 12, height: 12, borderRadius: 2,
              background: COLORS.segments[k as keyof typeof COLORS.segments],
              display: "inline-block"
            }} />
            <span style={{ fontSize: TEXT.size - 1 }}>{k}</span>
          </div>
        ))}
      </div>
      <div>
        {SEGMENT_LABELS.New} · {SEGMENT_LABELS.Repeat} · {SEGMENT_LABELS.Loyal}
      </div>
    </div>
  );
}

export default function CountryBarChart({ data, dataKey, mode, seriesKeys }: Props) {
  const router = useRouter();
  const isStacked = !!seriesKeys?.length;
  const yFmt = (v: any) => fmt(v);
  const topKey = SEGMENT_ORDER[SEGMENT_ORDER.length - 1];
  const onBarClick = (e: any) => {
    const country = e?.payload?.country ?? e?.country;
    if (country) router.push(`/country/${encodeURIComponent(country)}`);
  };

  return (
    <div style={{
      width: "100%", height: 420, border: CARD.border, borderRadius: CARD.radius,
      padding: CARD.padding, background: CARD.bg, boxSizing: "border-box",
      fontFamily: TEXT.family, fontSize: TEXT.size, color: TEXT.color
    }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={CHART.margin}
          barCategoryGap={isStacked ? "18%" : undefined}
          barGap={isStacked ? 0 : undefined}
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
            content={props =>
              isStacked
                ? <SegmentsTooltip {...props} />
                : <CountryTooltip {...props} isRevenue={dataKey === "ksek" || mode === "revenue"} />
            }
            cursor={{ fill: TOOLTIP.cursorFill, radius: TOOLTIP.cursorRadius }}
          />
          {isStacked ? (
            <>
              {SEGMENT_ORDER.map(k => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId="seg"
                  fill={COLORS.segments[k as keyof typeof COLORS.segments]}
                  stroke="none"
                  radius={k === topKey ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                  onClick={onBarClick}
                  barSize={100}
                />
              ))}
              <Legend content={<SegmentsLegend />} />
            </>
          ) : (
            <Bar
              dataKey={dataKey!}
              fill={COLORS.series.revenue}
              stroke="none"
              radius={CHART.barRadius}
              barSize={100}
              onClick={onBarClick}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
