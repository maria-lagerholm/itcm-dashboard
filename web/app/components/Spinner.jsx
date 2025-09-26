// Spinner: Animated loading indicator with optional label.
"use client";
export default function Spinner({ label = "Loading…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569" }}>
      <div
        style={{
          width: 16,
          height: 16,
          border: "2px solid #cbd5e1",
          borderTopColor: "#0ea5e9",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <span style={{ fontWeight: 500 }}>{label}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
