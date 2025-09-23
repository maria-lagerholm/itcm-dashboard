// app/components/CountryBarChart.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { COLORS, CHART, SEGMENT_ORDER, SEGMENT_LABELS } from "../theme";

type Props = {
  data: any[];
  /** Single-series key (used for revenue view, e.g. "ksek") */
  dataKey?: string;
  /** Which view is active */
  mode?: "customers" | "revenue";
  /** When provided (e.g. ["New","Repeat","Loyal"]), render stacked bars */
  seriesKeys?: string[];
};

// Format numbers (sv-SE uses space as thousands separator)
const fmt = (n: any, locale = "sv-SE") => Number(n ?? 0).toLocaleString(locale);

// Tooltip for stacked segments (ordered New → Repeat → Loyal)
function SegmentsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  const total =
    typeof p.total === "number"
      ? p.total
      : payload.reduce((s: number, r: any) => s + (Number(r?.value) || 0), 0);

  const ordered = SEGMENT_ORDER
    .map((k) => payload.find((r: any) => r.dataKey === k))
    .filter(Boolean);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)",
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.country ?? ""}</div>
      {ordered.map((row: any) => {
        const val = Number(row?.value) || 0;
        const pct = total ? (val / total) * 100 : 0;
        return (
          <div key={row.dataKey}>
            <strong>{row.dataKey}:</strong> {fmt(val)} ({pct.toFixed(1)}%)
          </div>
        );
      })}
      {total ? (
        <div style={{ marginTop: 6, color: "#64748b" }}>
          Total customers: {fmt(total)}
        </div>
      ) : null}
    </div>
  );
}

// Tooltip for single-series (customers total or revenue)
function CountryTooltip({ active, payload, isRevenue }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)",
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.country}</div>
      {isRevenue ? (
        <>
          {"ksek" in p && (
            <div>
              <strong>Revenue:</strong> {fmt(p.ksek)} KSEK
            </div>
          )}
          {"aov_sek" in p && (
            <div>
              <strong>Avg order value:</strong> {fmt(p.aov_sek)} SEK
            </div>
          )}
          {"orders" in p && (
            <div>
              <strong>Order count:</strong> {fmt(p.orders)}
            </div>
          )}
        </>
      ) : (
        "count" in p && (
          <div>
            <strong>Customers:</strong> {fmt(p.count)}
          </div>
        )
      )}
    </div>
  );
}

// Fixed-order legend using theme colors + labels
function SegmentsLegend() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {SEGMENT_ORDER.map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: COLORS.segments[k],
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 13 }}>{k}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#64748b" }}>
        {SEGMENT_LABELS.New} · {SEGMENT_LABELS.Repeat} · {SEGMENT_LABELS.Loyal}
      </div>
    </div>
  );
}

export default function CountryBarChart({ data, dataKey, mode, seriesKeys }: Props) {
  const router = useRouter();
  const isStacked = Boolean(seriesKeys?.length);
  const yFmt = (v: any) => fmt(v);

  const onBarClick = (e: any) => {
    const country = e?.payload?.country ?? e?.country;
    if (country) router.push(`/country/${encodeURIComponent(country)}`);
  };

  // Only the TOP segment (Loyal) gets rounded; others are square → continuous bar look
  const topKey = SEGMENT_ORDER[SEGMENT_ORDER.length - 1];

  return (
    <div
      style={{
        width: "100%",
        height: 420,
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={CHART.margin}
          barCategoryGap={isStacked ? "18%" : undefined}
          barGap={isStacked ? 0 : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="country"
            tick={{ fontSize: CHART.tickFont }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: CHART.tickFont }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yFmt}
          />

          <Tooltip
            content={(props) =>
              isStacked ? (
                <SegmentsTooltip {...props} />
              ) : (
                <CountryTooltip
                  {...props}
                  isRevenue={dataKey === "ksek" || mode === "revenue"}
                />
              )
            }
            cursor={false}
          />

          {isStacked ? (
            <>
              {SEGMENT_ORDER.map((k) => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId="seg"
                  fill={COLORS.segments[k]}
                  stroke="none"
                  radius={k === topKey ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                  onClick={onBarClick}
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
              onClick={onBarClick}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
