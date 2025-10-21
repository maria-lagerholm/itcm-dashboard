
export const COLORS = {
  primary: "#aec7e8", secondary: "#ffbb78", tertiary: "#98df8a", quaternary: "#ff9896",
  quinary: "#c5b0d5", senary: "#c49c94", septenary: "#f7b6d2", octonary: "#c7c7c7",
  nonary: "#dbdb8d", denary: "#9edae5", undenary: "#CCEBC5", duodenary: "#FFED6F",
  grid: "#E5E7EA", text: "#1f2937",
  web: "#1bada0", telephone: "#227c9d", letter: "#ffcb77", other: "#e37fae", email: "#fe6d73",
  segments: { New: "#137d73", Returning: "#2a9d92", Loyal: "#30c4b2" },
  series: { revenue: "#31a1b3", brand: "#6fb899", city: "#31a1b3", returning: "#31a1b3" },
  age: { female: "#f1788d", male: "#6388b4" },
};

export const PALETTE_10 = [
  COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.quinary,
  COLORS.senary, COLORS.septenary, COLORS.octonary, COLORS.nonary, COLORS.denary,
];

export const AGE_COLORS = { Female: COLORS.age.female, Male: COLORS.age.male };

export const CHANNEL_ORDER = ["web", "telephone", "email", "letter", "other"];

export const CHANNEL_COLORS = {
  web: COLORS.web, telephone: COLORS.telephone, email: COLORS.email,
  letter: COLORS.letter, other: COLORS.other,
};

export const SEGMENT_ORDER = ["New", "Returning", "Loyal"];

export const SEGMENT_LABELS = {
  New: "New = 1 order", Returning: "Returning = 2–3 orders", Loyal: "Loyal = ≥4 orders",
};

export const CHART = {
  barRadius: [8, 8, 0, 0],
  margin: { top: 8, right: 12, bottom: 32, left: 12 },
  tickFont: 14,
};

export const TEXT = {
  family: "Helvetica Neue",
  color: COLORS.text,
  size: CHART.tickFont,
  minSize: 10,
  measureCoeff: 0.65,
};

export const TREEMAP = {
  ratio: 3.0, tileRadius: 6, tilePadding: 6, tileStroke: COLORS.grid, emptyBg: "#fafafa",
  containerBorder: COLORS.grid, containerRadius: 8, containerPadding: 12,
  tooltipShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

export const LAYOUT = { sectionMarginY: 32, sectionGap: 12 };

export const FLOW = {
  page: { display: "grid", rowGap: LAYOUT.sectionMarginY },
  section: { display: "grid", rowGap: LAYOUT.sectionGap },
};

export const CARD = {
  border: `1px solid ${COLORS.grid}`, radius: 8, padding: 12, bg: "#fff",
};

export const BUTTON = {
  base: {
    padding: "6px 10px", borderRadius: 8, border: `1px solid ${COLORS.grid}`,
    background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14,
  },
  activeBg: "#f1f5f9",
};

export const TOOLTIP = {
  base: {
    background: "#fff", border: `1px solid ${COLORS.grid}`, borderRadius: 8,
    padding: "8px 10px", fontSize: 14, boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  cursorFill: "rgba(0,0,0,0.035)", cursorRadius: 6,
};

export const UI = {
  text: { primary: "#0b0b0c", sizeSm: 14, sizeMd: 16, weightSemibold: 600 },
  surface: { bg: "#ffffff", border: "#eaeaea", radius: 10, padding: 12, subtle: "#f1f5f9" },
  button: { border: "#dddddd", bgActive: "#f1f5f9", radius: 8, padding: "6px 10px" },
  tooltip: { bg: "#ffffff", border: "#eeeeee", shadow: "0 4px 10px rgba(0,0,0,.05)" },
  grid: { strokeDasharray: "3 3", cursorFill: "rgba(0,0,0,0.035)" },
};

export const HEADINGS = {
  h1: { margin: 0, fontSize: 24, fontWeight: 700 },
  h2: { margin: 0, fontSize: 18, fontWeight: 600 },
  h3: { margin: 0, fontSize: 16, fontWeight: 600 },
};

export const SECTION = {
  container: (LAYOUT) => ({
    display: "grid", gap: LAYOUT.sectionGap, marginTop: LAYOUT.sectionMarginY,
  }),
  header: (TEXT) => ({
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    gap: 8, fontFamily: TEXT.family, color: TEXT.color,
  }),
};

