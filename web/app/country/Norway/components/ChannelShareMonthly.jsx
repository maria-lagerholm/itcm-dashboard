"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import useChannelShareMonthly from "../hooks/useChannelShareMonthly";
import { COUNTRY } from "../country";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  CHANNEL_COLORS, CHANNEL_ORDER, CARD, TEXT, TOOLTIP, UI, CHART, HEADINGS, LAYOUT,
} from "../../../theme";
import { fmtInt } from "../utils/formatters";

const DEFAULT_WINDOW = 12;
const SCROLL_STEP = 3;

const legendProps = { verticalAlign: "top", height: 32 };
const legendWrapper = { fontSize: TEXT.size, color: TEXT.color, marginBottom: 4 };
const xAxisCfg = { angle: -36, height: 38, padding: { left: 0, right: 4 } };
const axisTick = { fontSize: TEXT.size, fill: TEXT.color };
const controlsBar = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
  fontFamily: TEXT.family,
  color: TEXT.color,
  fontSize: TEXT.size,
};
const inputStyle = {
  width: 64,
  padding: "2px 6px",
  border: CARD.border,
  borderRadius: 6,
  background: CARD.bg,
  color: TEXT.color,
};
const smallLabel = { opacity: 0.8 };
const counterStyle = { marginLeft: "auto", opacity: 0.7 };
const chartBox = (height) => ({
  marginTop: LAYOUT.sectionGap,
  width: "100%",
  height,
  border: CARD.border,
  borderRadius: CARD.radius,
  background: CARD.bg,
  padding: CARD.padding,
  boxSizing: "border-box",
  fontFamily: TEXT.family,
});
const btnStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: CARD.border,
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};
const btnActiveBg = "#f1f5f9";

const cap = (s) => s?.toString().replace(/\b\w/g, (m) => m.toUpperCase()) ?? "";

export default function ChannelShareMonthly({ country = COUNTRY, height = 360 }) {
  const { rows = [], channels = [] } = useChannelShareMonthly(country);
  const totalLen = rows.length;
  const [win, setWin] = useState(() => Math.min(DEFAULT_WINDOW, totalLen || DEFAULT_WINDOW));
  const [start, setStart] = useState(() =>
    Math.max(0, totalLen - Math.min(DEFAULT_WINDOW, totalLen || DEFAULT_WINDOW))
  );

  useEffect(() => {
    if (!totalLen) return;
    const w = Math.min(win, totalLen);
    setWin(w);
    setStart(Math.max(0, totalLen - w));
  }, [totalLen]);

  const ordered = useMemo(() => {
    const arr = [...channels];
    arr.sort((a, b) => {
      const ia = CHANNEL_ORDER.indexOf(a), ib = CHANNEL_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return arr;
  }, [channels]);

  const clampStart = useCallback(
    (v) => Math.max(0, Math.min(v, Math.max(0, (rows.length || 0) - win))),
    [rows.length, win]
  );
  const goOlder = useCallback(() => setStart((s) => clampStart(s - SCROLL_STEP)), [clampStart]);
  const goNewer = useCallback(() => setStart((s) => clampStart(s + SCROLL_STEP)), [clampStart]);
  const data = useMemo(() => rows.slice(start, start + win), [rows, start, win]);
  const hasData = totalLen > 0 && channels.length > 0;

  return (
    <section style={{ width: "100%" }}>
      <div style={{ ...HEADINGS.h3, fontFamily: TEXT.family, color: TEXT.color, marginBottom: 8 }}>
        {country} · Channel usage over time
      </div>
      {hasData && (
        <>
          <div style={controlsBar}>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={goOlder}
                style={btnStyle}
                onMouseDown={e => (e.currentTarget.style.background = btnActiveBg)}
                onMouseUp={e => (e.currentTarget.style.background = btnStyle.background)}
                title="Scroll left"
                aria-label="Scroll left"
              >◀</button>
              <button
                type="button"
                onClick={goNewer}
                style={btnStyle}
                onMouseDown={e => (e.currentTarget.style.background = btnActiveBg)}
                onMouseUp={e => (e.currentTarget.style.background = btnStyle.background)}
                title="Scroll right"
                aria-label="Scroll right"
              >▶</button>
            </div>
            <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <label htmlFor="win" style={smallLabel}>Window:</label>
              <input
                id="win"
                type="number"
                min={3}
                max={Math.max(3, rows.length)}
                value={win}
                onChange={e => {
                  const next = Math.max(3, Math.min(Number(e.target.value) || DEFAULT_WINDOW, rows.length || DEFAULT_WINDOW));
                  const rightEdge = start + win;
                  setWin(next);
                  setStart(clampStart(rightEdge - next));
                }}
                style={inputStyle}
              />
              <span style={{ opacity: 0.7 }}>months</span>
            </div>
            <div style={counterStyle}>
              {start + 1}–{Math.min(start + win, rows.length)} / {rows.length}
            </div>
          </div>
          <div style={chartBox(height)} aria-label="Channel share chart">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ ...CHART.margin, left: 0, right: 0 }}>
                <Legend
                  {...legendProps}
                  wrapperStyle={legendWrapper}
                  formatter={v => <span style={{ color: TEXT.color }}>{cap(v)}</span>}
                />
                <CartesianGrid strokeDasharray={UI.grid.strokeDasharray} />
                <XAxis
                  dataKey="year_month"
                  tick={axisTick}
                  interval={0}
                  minTickGap={8}
                  angle={xAxisCfg.angle}
                  textAnchor="end"
                  tickFormatter={v => v || ""}
                  height={xAxisCfg.height}
                  padding={xAxisCfg.padding}
                  allowDuplicatedCategory={false}
                  domain={data.length ? [data[0].year_month, data[data.length - 1].year_month] : [null, null]}
                  type="category"
                />
                <YAxis tick={axisTick} />
                <Tooltip
                  wrapperStyle={{ pointerEvents: "none", fontSize: TEXT.size, zIndex: 10 }}
                  contentStyle={TOOLTIP.base}
                  labelStyle={{ color: TEXT.color, fontSize: TEXT.size }}
                  itemStyle={{ color: TEXT.color, fontSize: TEXT.size }}
                  formatter={(val, name) => [fmtInt(val || 0), cap(name)]}
                  labelFormatter={label => `Month: ${label}`}
                />
                {ordered.map(ch => (
                  <Line
                    key={ch}
                    type="monotone"
                    dataKey={ch}
                    dot={false}
                    strokeWidth={2}
                    stroke={CHANNEL_COLORS[ch] ?? "#8ab7c0"}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
