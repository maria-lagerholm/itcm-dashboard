// Theme constants for charts and UI.

export const COLORS = {
  // General
  primary:   "#0b8f84",
  secondary: "#2a9d92",
  tertiary:  "#30c4b2",
  quaternary:"#aeeee0",
  quinary:   "#a3dcef",
  senary:    "#a2b9ed",
  septenary: "#a3dcef",

  // Channel colors
  web: "#4e78a6",
  telephone: "#9fcbe8",
  email: "#f0ce63",
  letter: "#d07395",
  other: "#ff9d9a",

  grid: "#e5e7eb",
  text: "#1f2937",

  // Segment colors
  segments: {
    New:    "#137d73",
    Repeat: "#2a9d92",
    Loyal:  "#30c4b2",
  },

  // Single-series bars
  series: {
    revenue: "#62949d",
  },

  // Age palette (define first)
  age: {
    female: "#d07395",
    male:   "#6081a4",
  },
};

// Export a convenient map matching your data keys
export const AGE_COLORS = {
  Female: COLORS.age.female,
  Male:   COLORS.age.male,
};


// fixed logical order if you ever need it in legends etc.
export const CHANNEL_ORDER = ["web", "telephone", "email", "letter", "other"];

// semantic colors per channel
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

// Chart style settings.
export const CHART = {
  barRadius: [8, 8, 0, 0],
  margin: { top: 8, right: 12, bottom: 32, left: 12 },
  tickFont: 14,
};
