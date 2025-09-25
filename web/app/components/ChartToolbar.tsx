// app/components/ChartToolbar.tsx
"use client";

import { BUTTON, TEXT } from "../theme";

type Props = {
  mode: "customers" | "revenue";
  setMode: (m: "customers" | "revenue") => void;
};

export default function ChartToolbar({ mode, setMode }: Props) {
  const btnStyle = (active: boolean) => ({
    ...BUTTON.base,
    background: active ? BUTTON.activeBg : BUTTON.base.background,
    fontFamily: (TEXT as any).family,
    fontSize: (TEXT as any).size,
  });

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => setMode("customers")}
        style={btnStyle(mode === "customers")}
        aria-pressed={mode === "customers"}
      >
        Customers
      </button>
      <button
        onClick={() => setMode("revenue")}
        style={btnStyle(mode === "revenue")}
        aria-pressed={mode === "revenue"}
      >
        Total Revenue
      </button>
    </div>
  );
}