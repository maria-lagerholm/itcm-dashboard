# BI Dashboard 
The backend (FastAPI) turns parquet files into a set of JSON endpoints so the frontend can render charts without data wrangling. **main.py** is where all backend modules are assembled together.

Open [http://localhost](http://localhost) to see the backend result.


The frontend is a Next.js app organized by country folders such as `app/country/Denmark/`. Each page uses a single `COUNTRY` constant and a few hooks that call the API and shape fields for charts. All visuals are theme-driven through `app/theme.js`, so colors, typography, spacing, grid lines, and tooltip styles change in one place and propagate everywhere. **/app/app/page.jsx** is where all frontend elements are assembled together.

Open [http://localhost/api/docs#](http://localhost/api/docs#) to see the FE result.

The goal is to quickly deliver analytics on demand and host the dashboard on a server so clients can access it easily and get regular updates.

Caddy is a web server that can act as a reverse proxy, load balancer, and HTTPS server with automatic certificate management. In this project, Caddy is used to route incoming requests to the correct backend service (FastAPI or Next.js frontend) based on the URL path.

Here’s what the provided Caddyfile does for `:80` (HTTP):

- Redirects `/api` to `/api/docs` (so visiting `/api` in the browser opens the Swagger UI).
- Proxies `/openapi.json` and `/docs*` to the FastAPI backend (for Swagger/OpenAPI docs).
- Proxies all `/api/*` requests to the FastAPI backend, stripping the `/api` prefix.
- All other requests are proxied to the Next.js frontend.

This setup allows you to serve both the API and the frontend from a single domain.