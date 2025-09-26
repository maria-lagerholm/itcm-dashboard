// app/components/ChartToolbar.tsx
"use client";

import { BUTTON, TEXT } from "../theme";

type Mode = "customers" | "revenue";

interface Props {
  mode: Mode;
  setMode: (m: Mode) => void;
}

// Chart mode toggle toolbar
export default function ChartToolbar({ mode, setMode }: Props) {
  const btnStyle = (active: boolean) => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
    fontFamily: TEXT.family,
    fontSize: TEXT.size,
  });

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        onClick={() => setMode("customers")}
        style={btnStyle(mode === "customers")}
        aria-pressed={mode === "customers"}
      >
        Customers
      </button>
      <button
        type="button"
        onClick={() => setMode("revenue")}
        style={btnStyle(mode === "revenue")}
        aria-pressed={mode === "revenue"}
      >
        Total Revenue
      </button>
    </div>
  );
}