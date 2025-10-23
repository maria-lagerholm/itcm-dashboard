# BI Dashboard

This is for visualizations for Åshild's webstore, based on data generated in previous steps in the [ITCM recommendation engine](https://github.com/maria-lagerholm/itcm_recommendation_engine).

The backend (under api dir) is built with FastAPI, turning parquet files into a set of JSON endpoints so the frontend (under web dir) can render charts without additional data wrangling. All backend modules are assembled in **main.py**.

To see the frontend in action, open [http://localhost](http://localhost).

The frontend is a Next.js app, organized by country folders such as `app/country/Denmark/`. Each page uses a single `COUNTRY` constant and hooks that call the API and prepare fields for charts. All visuals are theme-driven via `app/theme.js`, so changes to colors, typography, spacing, grid lines, or tooltip styles propagate globally. All frontend elements are assembled together in **/app/app/page.jsx**.

Preview the backend API [http://localhost/api/docs#](http://localhost/api/docs#).

The goal is to deliver analytics on demand and host the dashboard on a server, making it accessible to clients with regular update capability.

This project uses Caddy as a reverse proxy on port 80, routing `/api/*` to FastAPI and all other traffic to the Next.js frontend. This setup means everything is served under one URL (`http://localhost`). Both the API and the frontend are served from a single domain.

The provided Caddyfile for `:80` (HTTP) does the following:

- Redirects `/api` to `/api/docs` (so that visiting `/api` in the browser opens the Swagger UI)
- Proxies `/openapi.json` and `/docs*` to the FastAPI backend (for Swagger/OpenAPI docs)
- Proxies all `/api/*` requests to the FastAPI backend, stripping the `/api` prefix
- Proxies all other requests to the Next.js frontend


The `compose.yaml`:

- **api**: Builds and runs the FastAPI backend using the provided Dockerfile in `api/`. It mounts the API code and the `data` directory (read-only), sets the environment to development, and uses Uvicorn for auto-reloading in dev mode.
- **web**: Builds and runs the Next.js frontend app from `web/` with live-reload and hot reloading enabled. Key environment variables are set to connect to the API and configure the development environment. Source files and `node_modules` are mounted for efficient development.
- **proxy**: Uses the Caddy server to listen on port 80 and apply reverse proxy rules as described above.
- **sync**: Runs an Alpine-based cron job container that syncs pre-processed data produced by the recommendation engine (`../itcm_recommendation_engine/data/processed`) to the API's data directory at scheduled times (default: 23:00). Logs are persisted to host.

Trigger the sync job inside the running container

```
docker exec itcm-sync sh -lc '
  echo "[$(date -Is)] START" >> /var/log/seed-cron.log;
  mkdir -p /dst && cp -a /src/. /dst/ >> /var/log/seed-cron.log 2>&1;
  RC=$?;
  echo "[$(date -Is)] DONE rc=$RC" >> /var/log/seed-cron.log
'
```


All services are set to automatically restart unless stopped, run:

```
docker compose up -d --build
```

## Structure

```
itcm-dashboard/
├─ api/                  # FastAPI app (Python)
│  ├─ main.py            # app + router includes
│  ├─ deps.py            # loads customers.csv (cached)
│  └─ routers/
│     ├─ countries.py    # GET /api/countries → customers by country
│     └─ country_top_cities.py  # GET /api/country/{id}/top-cities
├─ web/                  # Next.js app (React)
│  ├─ app/               # App Router pages
│  │  ├─ layout.jsx
│  │  ├─ page.jsx        # overview chart
│  │  └─ country/...     # drill-down pages
│  └─ app/theme.js       # chart colors/sizes
├─ data/                 # CSVs (mounted read-only into API)
└─ compose.yaml          # runs api (8000) + web (3000)
```

