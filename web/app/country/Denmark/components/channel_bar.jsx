"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Customized, Rectangle } from "recharts";
import { CHANNEL_COLORS } from "../../../theme";
import { fmtInt } from "../utils/formatters";

export default function ChannelBar({ // ← default export name (PascalCase)
  country = "Denmark",
  title = `${country} · Customers by channel`,
  height = 110,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const base = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000", []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    fetch(`${base}/api/countries_by_channel`)
      .then(r => r.json())
      .then(j => { if (!cancelled) setRows(Array.isArray(j?.countries_by_channel?.[country]) ? j.countries_by_channel[country] : []); })
      .catch(() => setError("Failed to load channels"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [base, country]);

  const total = useMemo(() => rows.reduce((s, r) => s + (Number(r.customers_count) || 0), 0), [rows]);

  const data = useMemo(() => {
    const o = { _label: "" };
    if (total > 0) for (const r of rows) o[r.channel] = (Number(r.customers_count) || 0) / total;
    return [o];
  }, [rows, total]);

  return (
    <section style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "#000" }}>{title}</h3>
        {total > 0 && <div style={{ color: "#000", fontSize: 14 }}>Total: {fmtInt(total)}</div>}
      </div>

      {loading ? (
        <div style={{ width: "100%", height, border: "1px solid #eee", borderRadius: 10, display: "grid", placeItems: "center", background: "#fafafa" }}>
          <div style={{ fontSize: 14, color: "#000" }}>Loading…</div>
        </div>
      ) : error ? (
        <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div>
      ) : (
        <div style={{ width: "100%", height, border: "1px solid #eee", borderRadius: 10, padding: 10, position: "relative" }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 6 }}>
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
      )}
    </section>
  );
}
