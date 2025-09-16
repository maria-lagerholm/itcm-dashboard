"use client";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { COLORS, CHART } from "../theme";

const fmt = (n, locale = "sv-SE") => Number(n ?? 0).toLocaleString(locale);

function CountryTooltip({ active, payload, isRevenue }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px",
                  boxShadow:"0 6px 20px rgba(15,23,42,0.08)", fontSize:13 }}>
      <div style={{ fontWeight:700, marginBottom:6 }}>{p.country}</div>
      {isRevenue ? (
        <>
          {"ksek"    in p && <div><strong>Revenue:</strong> {fmt(p.ksek)} KSEK</div>}
          {"aov_sek" in p && <div><strong>Avg order value:</strong> {fmt(p.aov_sek)} SEK</div>}
          {"orders"  in p && <div><strong>Order count:</strong> {fmt(p.orders)}</div>}
        </>
      ) : (
        "count" in p && <div><strong>Customers:</strong> {fmt(p.count)}</div>
      )}
    </div>
  );
}

export default function CountryBarChart({ data, dataKey, mode }) {
  const router = useRouter();
  const isRevenue = dataKey === "ksek" || mode === "revenue";

  const handleBarClick = (e) => {
    const country = e?.payload?.country ?? e?.country;
    if (!country) return;
    // if your routes are /country/Sweden, /country/Norway, push the name directly:
    router.push(`/country/${encodeURIComponent(country)}`);
    // If you use slugs, convert here:
    // const slug = country.toLowerCase().replace(/\s+/g, "-");
    // router.push(`/country/${slug}`);
  };

  return (
    <div style={{ width:"100%", height:420, border:"1px solid #eee", borderRadius:8, padding:12 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={CHART.margin}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="country" tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} angle={-15} dy={10} />
          <YAxis tick={{ fontSize: CHART.tickFont }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
          {/* function form so tooltip sees latest props */}
          <Tooltip content={(props) => <CountryTooltip {...props} isRevenue={isRevenue} />} cursor={false} />
          <Bar
            dataKey={dataKey}
            fill={COLORS.primary}
            radius={CHART.barRadius}
            onClick={handleBarClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
