export function apiBase() {
  const base =
    typeof window === "undefined"
      ? process.env.INTERNAL_API_BASE_URL ?? "http://api:8000"
      : process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}