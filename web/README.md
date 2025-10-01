## How to access the dashboard

- **Frontend (dashboard):** http://localhost/
- **Docs (Swagger):** http://localhost/api/docs

Caddy is used to act as a reverse proxy on port 80, routing `/api/*` to FastAPI and everything else to the Next.js frontend so everything lives under one URL (`http://localhost`).
