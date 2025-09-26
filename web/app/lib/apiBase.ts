export function apiBase() {
  // Server-side (Next.js Node runtime)
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_BASE_URL ?? "http://api:8000";
  }
  // Browser
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
}
