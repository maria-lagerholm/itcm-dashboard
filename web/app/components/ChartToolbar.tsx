"use client";

// ChartToolbar: Renders toggle buttons for "customers" and "revenue" chart modes.
// If debugging, check that 'mode' is either "customers" or "revenue", and that 'setMode' updates the parent state correctly.
type Props = {
  mode: "customers" | "revenue"; // Current chart mode
  setMode: (m: "customers" | "revenue") => void; // Handler to update chart mode
};

export default function ChartToolbar({ mode, setMode }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {/* Button for "Customers" mode. If debugging, ensure this sets mode to "customers" and highlights when active. */}
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
        aria-pressed={mode === "customers"}
      >
        Customers
      </button>
      {/* Button for "Revenue" mode. If debugging, ensure this sets mode to "revenue" and highlights when active. */}
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
        aria-pressed={mode === "revenue"}
      >
        Total Revenue
      </button>
    </div>
  );
}
