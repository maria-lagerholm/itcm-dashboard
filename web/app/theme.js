// Theme constants for charts and UI. If debugging, check that these values are imported and used consistently in chart components.
export const COLORS = {
  primary: "#009688",   // Main accent color for bars and highlights (MARINE_GREEN)
  grid: "#e5e7eb",      // Grid line color for charts (light gray)
  text: "#1f2937",      // Default text color (gray-800)
};

// Chart style settings. If debugging chart appearance, verify these values are passed to recharts components.
export const CHART = {
  barRadius: [8, 8, 0, 0], // Border radius for bar chart bars (top-left, top-right, bottom-right, bottom-left)
  margin: { top: 8, right: 12, bottom: 32, left: 12 }, // Chart margin (in px)
  tickFont: 14, // Font size for axis ticks
};
