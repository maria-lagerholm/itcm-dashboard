// Theme constants for charts and UI.

export const COLORS = {
  // Blues
  primary:      "#7fb3b8",
  secondary:    "#FFFFB3",
  tertiary:     "#BEBADA",
  quaternary:   "#FB8072",
  quinary:      "#80B1D3",
  senary:       "#FDB462",
  septenary:    "#B3DE69",
  octonary:     "#FCCDE5",
  nonary:       "#D9D9D9",
  denary:       "#BC80BD",
  undenary:     "#CCEBC5",
  duodenary:    "#FFED6F",

  grid:         "#E5E7EA",
  text:         "#1f2937",

  // Channel colors
  web:       "#4e78a6",
  telephone: "#9fcbe8",
  email:     "#f0ce63",
  letter:    "#d07395",
  other:     "#ff9d9a",

  // Segment colors
  segments: {
    New:    "#137d73",
    Repeat: "#2a9d92",
    Loyal:  "#30c4b2",
  },

  // Single-series bars
  series: {
    revenue: "#62949d",
    web:     "#4e78a6", // used by CHANNEL_COLORS
  },

  // Age palette
  age: {
    female: "#d07395",
    male:   "#6081a4",
  },
};

// Handy palettes
export const PALETTE_10 = [
  COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.quinary,
  COLORS.senary, COLORS.septenary, COLORS.octonary, COLORS.nonary, COLORS.denary,
];

// Export a convenient map matching your data keys
export const AGE_COLORS = {
  Female: COLORS.age.female,
  Male:   COLORS.age.male,
};

// Fixed logical order if you ever need it in legends etc.
export const CHANNEL_ORDER = ["web", "telephone", "email", "letter", "other"];

// Semantic colors per channel
export const CHANNEL_COLORS = {
  web: COLORS.series.web,
  telephone: COLORS.telephone,
  email: COLORS.email,
  letter: COLORS.letter,
  other: COLORS.other,
};

// Fixed segment order + labels (export so components don’t hardcode)
export const SEGMENT_ORDER = ["New", "Repeat", "Loyal"];

export const SEGMENT_LABELS = {
  New: "New = 1 order",
  Repeat: "Repeat = 2–3 orders",
  Loyal: "Loyal = ≥4 orders",
};

// Chart style settings (general)
export const CHART = {
  barRadius: [8, 8, 0, 0],
  margin: { top: 8, right: 12, bottom: 32, left: 12 },
  tickFont: 14,
};

// Text defaults
export const TEXT = {
  family: "'Helvetica Neue', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  color: COLORS.text,
  size: CHART.tickFont,   // base size
  minSize: 10,            // min for auto-fit
  measureCoeff: 0.65,     // label width ≈ chars * coeff * fontSize
};

// Treemap styling
export const TREEMAP = {
  ratio: 3.0,            // favor wider-than-tall tiles
  tileRadius: 6,
  tilePadding: 6,
  tileStroke: COLORS.grid,
  emptyBg: "#fafafa",
  containerBorder: COLORS.grid,
  containerRadius: 8,
  containerPadding: 12,
  tooltipShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

export const LAYOUT = {
  sectionMarginY: 32,   // vertical spacing between dashboard blocks
  sectionGap: 12,       // inner gap in sections using grid
};

