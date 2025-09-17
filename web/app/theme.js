// Theme constants for charts and UI.

export const COLORS = {
  // General
  primary:   "#137d73", // main accent (marine green)
  secondary: "#2a9d92", // cool gray
  tertiary:  "#30c4b2", // green
  grid:      "#e5e7eb",
  text:      "#1f2937",

  // Segment colors (used for New / Repeat / Loyal)
  segments: {
    New:    "#137d73", // align with primary
    Repeat: "#2a9d92", // align with secondary
    Loyal:  "#30c4b2", // align with tertiary
  },

  // Single-series bars (e.g., revenue)
  series: {
    revenue: "#62949d",
  },
};

// Fixed segment order + labels (export so components don’t hardcode)
export const SEGMENT_ORDER = ["New", "Repeat", "Loyal"];

export const SEGMENT_LABELS = {
  New: "New = 1 order",
  Repeat: "Repeat = 2–3 orders",
  Loyal: "Loyal = ≥4 orders",
};

// Chart style settings.
export const CHART = {
  barRadius: [8, 8, 0, 0],
  margin: { top: 8, right: 12, bottom: 32, left: 12 },
  tickFont: 14,
};
