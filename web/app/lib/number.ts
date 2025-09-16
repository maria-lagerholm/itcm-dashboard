export function formatNumberWithSpace(n: number | string) {
    const num = typeof n === "string" ? Number(n) : n || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  