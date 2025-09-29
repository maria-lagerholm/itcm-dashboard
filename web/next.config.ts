// next.config.ts
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      // remove /api on the destination because FastAPI does NOT use /api prefix
      return [{ source: "/api/:path*", destination: "http://api:8000/:path*" }];
    }
    return [];
  },
};
export default nextConfig;
