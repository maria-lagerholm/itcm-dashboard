// Integer formatting (sv-SE, no decimals, replaces non-breaking spaces)
export const fmtInt = v =>
  new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 })
    .format(Number(v ?? 0))
    .replace(/\u00A0|\u202F/g, " ");

// Sorts array of { month: "YYYY-MM", ... } by month (Jan-Dec, then year)
export function sortByMonthJanToDec(arr) {
  if (!Array.isArray(arr) || !arr.length || !arr[0].month) return arr;
  return [...arr].sort((a, b) => {
    const [ya, ma] = a.month.split("-").map(Number);
    const [yb, mb] = b.month.split("-").map(Number);
    return ma !== mb ? ma - mb : ya - yb;
  });
}

// Returns previous year for "YYYY-MM"
export const prevYearYM = ym => {
  const [y, m] = ym.split("-").map(Number);
  return `${y - 1}-${String(m).padStart(2, "0")}`;
};

// Adds delta months to "YYYY-MM"
export const addMonths = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
