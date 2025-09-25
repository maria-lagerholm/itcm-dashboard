// components/PrevYearTick.jsx
export default function PrevYearTick({ cx, cy }) {
  if (cx == null || cy == null) return null;
  return <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke="#111827" strokeWidth={2} />;
}
