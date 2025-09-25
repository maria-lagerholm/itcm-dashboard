"use client";

import COUNTRY from "../country";
import useChannelShare from "../hooks/useChannelShare";
import ChannelStack from "./ChannelStack";
import { TEXT, LAYOUT, CARD } from "../../../theme";
import { fmtInt } from "../utils/formatters";

export default function ChannelBar({
  country = COUNTRY,
  title = `${country} · Orders by channel`,
  height = 110,
}) {
  const { rows, data, total, loading, error } = useChannelShare(country);

  return (
    <section style={{ display: "grid", gap: LAYOUT.sectionGap, position: "relative", isolation: "isolate" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontFamily: TEXT.family, color: TEXT.color }}>
        <h3>{title}</h3>
        {total > 0 && <div style={{ fontSize: TEXT.size }}>Total orders: {fmtInt(total)}</div>}
      </div>

      {loading ? (
        <div style={{
          width: "100%", height,
          border: CARD.border, borderRadius: CARD.radius, background: CARD.bg,
          padding: CARD.padding, boxSizing: "border-box",
          display: "grid", placeItems: "center", fontFamily: TEXT.family, color: TEXT.color,
        }}>
          Loading…
        </div>
      ) : error ? (
        <div style={{ color: "crimson", fontFamily: TEXT.family }}>{error}</div>
      ) : (
        <ChannelStack rows={rows} data={data} height={height} />
      )}
    </section>
  );
}
