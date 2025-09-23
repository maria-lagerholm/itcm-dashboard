"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { fmtInt } from "../utils/formatters";
import { PALETTE_10 as PALETTE, COLORS, TEXT, TREEMAP } from "@/app/theme";

const approxW = (t, fs) => (t?.length || 0) * (TEXT.measureCoeff * fs);
const fit = (label, avail, pref = TEXT.size, min = TEXT.minSize) => {
  let s = pref; while (s > min && approxW(label, s) > avail) s--; return s;
};

function Tip({ active, payload = [] }) {
  if (!active || !payload.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${COLORS.grid}`,
      borderRadius: TREEMAP.containerRadius,
      padding: "8px 10px",
      fontSize: TEXT.size,
      color: TEXT.color,
      fontFamily: TEXT.family,
      boxShadow: TREEMAP.tooltipShadow,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
      <div><strong>Transactions:</strong> {fmtInt(p.size ?? 0)}</div>
      {"share" in p && <div><strong>Share:</strong> {p.share.toFixed(1)}%</div>}
    </div>
  );
}

// Always-horizontal labels; clip to tile; shrink then truncate.
function Tile(props) {
  const { x, y, width, height, name, size, fill } = props;
  const pad = TREEMAP.tilePadding;
  const label = name || "";
  const inX = x + pad;
  const availW = Math.max(0, width - pad * 2);
  const fs = fit(label, availW);
  const lineH = fs + 2;
  const inY = y + pad + fs;

  const fitsOne = height >= (lineH + pad * 2);
  const trunc = approxW(label, fs) > availW;
  const maxChars = Math.max(0, Math.floor(availW / (TEXT.measureCoeff * fs)));
  const text = trunc && maxChars > 1 ? label.slice(0, maxChars - 1) + "…" : label;
  const canNum = fitsOne && height >= (lineH * 2 + pad * 2);

  const clipId = `clip-${Math.round(x)}-${Math.round(y)}-${Math.round(width)}-${Math.round(height)}`;

  return (
    <g>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x={x} y={y} width={width} height={height} rx={TREEMAP.tileRadius} ry={TREEMAP.tileRadius} />
        </clipPath>
      </defs>

      <rect
        x={x} y={y} width={width} height={height}
        fill={fill || COLORS.primary}
        stroke={TREEMAP.tileStroke}
        rx={TREEMAP.tileRadius} ry={TREEMAP.tileRadius}
      />

      <g clipPath={`url(#${clipId})`}>
        {fitsOne && (
          <text
            x={inX} y={inY}
            fontSize={fs}
            fontFamily={TEXT.family}
            fill={TEXT.color}
            stroke="none" strokeWidth={0}
            dominantBaseline="alphabetic" textAnchor="start"
            style={{ pointerEvents: "none" }}
          >
            {text}
          </text>
        )}
        {canNum && (
          <text
            x={inX} y={inY + lineH}
            fontSize={fs}
            fontFamily={TEXT.family}
            fill={TEXT.color}
            stroke="none" strokeWidth={0}
            dominantBaseline="alphabetic" textAnchor="start"
            style={{ pointerEvents: "none", opacity: 0.9 }}
          >
            {fmtInt(size ?? 0)}
          </text>
        )}
      </g>
    </g>
  );
}

/** rows: [{ category, count, rank }] */
export default function TopCategoriesTreemap({ rows = [], height = 300 }) {
  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
  const data = rows.map((r, i) => ({
    name: r.category,
    size: Number(r.count) || 0,
    share: total ? (Number(r.count) / total) * 100 : 0,
    fill: PALETTE[i % PALETTE.length],
  }));

  if (!data.length) {
    return (
      <div style={{
        width: "100%", height,
        border: `1px solid ${TREEMAP.containerBorder}`,
        borderRadius: TREEMAP.containerRadius,
        display: "grid", placeItems: "center",
        background: TREEMAP.emptyBg,
        color: TEXT.color, fontSize: TEXT.size, fontFamily: TEXT.family,
      }}>
        No data
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height,
      border: `1px solid ${TREEMAP.containerBorder}`,
      borderRadius: TREEMAP.containerRadius,
      padding: TREEMAP.containerPadding,
      boxSizing: "border-box",
      color: TEXT.color, fontSize: TEXT.size, fontFamily: TEXT.family,
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          content={<Tile />}
          isAnimationActive={false}
          fill={COLORS.primary}
          ratio={TREEMAP.ratio}   // wider-than-tall tiles
        >
          <Tooltip content={<Tip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}