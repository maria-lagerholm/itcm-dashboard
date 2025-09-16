"use client";

type Props = {
  mode: "customers" | "revenue";
  setMode: (m: "customers" | "revenue") => void;
};

export default function ChartToolbar({ mode, setMode }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => setMode("customers")}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #ddd",
          background: mode === "customers" ? "#f1f5f9" : "white",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Customers
      </button>
      <button
        onClick={() => setMode("revenue")}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #ddd",
          background: mode === "revenue" ? "#f1f5f9" : "white",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Total Revenue
      </button>
    </div>
  );
}
