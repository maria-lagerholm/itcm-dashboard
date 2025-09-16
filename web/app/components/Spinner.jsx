// Spinner: Simple animated loading indicator with optional label.
// If debugging, check that the spinner appears when expected (e.g., during data loading),
// and that the 'label' prop is rendered correctly.
"use client";
export default function Spinner({ label = "Loading…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569" }}>
      {/* Spinner circle: If debugging, ensure animation runs and color matches theme. */}
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
      {/* Spinner label: If debugging, verify correct label text is shown. */}
      <span style={{ fontWeight: 500 }}>{label}</span>
      {/* Keyframes for spinner animation. If debugging, check that this style is injected and not duplicated. */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
