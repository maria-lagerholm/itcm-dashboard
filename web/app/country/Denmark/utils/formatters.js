// utils/formatters.js
export const fmtInt = (v) => {
  const s = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 })
    .format(Number(v ?? 0));
  return s.replace(/\u00A0/g, " ").replace(/\u202F/g, " ");
};

// For arrays of { month: "YYYY-MM", ... }
export function sortByMonthJanToDec(arr) {
  if (!Array.isArray(arr) || !arr.length || !arr[0].month) return arr;
  return [...arr].sort((a, b) => {
    const [ya, ma] = a.month.split("-").map(Number);
    const [yb, mb] = b.month.split("-").map(Number);
    return ma === mb ? ya - yb : ma - mb;
  });
}

export const prevYearYM = (ym /* "YYYY-MM" */) => {
  const [y, m] = ym.split("-").map(Number);
  return `${y - 1}-${String(m).padStart(2, "0")}`;
};

export const addMonths = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
