# item-dashboard
Dashboard stack: **FastAPI** API + **Next.js** web UI.
Reads CSVs from `./data` and serves simple aggregates for drill-down charts.

## Structure (initial)

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

## Backend (FastAPI)

* Serves JSON aggregates; **no HTML**.
* CSV path inside container: `/app/data/customers.csv`.
* CORS allows `http://localhost:3000`.

**Key endpoints**

* `GET /health` → `{ "ok": true }`
* `GET /api/countries` → `{ customers_by_country: { Sweden: 34570, ... } }`
* `GET /api/country/{invoiceCountryId}/top-cities?limit=10`
  → `{ country_id, top_cities: [{ city, unique_customers }, ...] }`

## Frontend (Next.js)

* Fetches API via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`).
* Overview bar chart on `/`; drill-down pages under `/country/...`.

## Run (dev)

```bash
# from repo root
docker compose up -d --build
# API:   http://localhost:8000  (docs at /docs)
# Web:   http://localhost:3000
```

## Notes

* Edit Python under `./api` and Next.js under `./web`; both are bind-mounted with hot reload.
* Change chart look in `web/app/theme.js`.