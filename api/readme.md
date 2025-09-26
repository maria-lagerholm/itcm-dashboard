# BI Dashboard 
The backend (FastAPI) turns parquet files into a set of JSON endpoints so the frontend can render charts without data wrangling. **main.py** is where all backend modules are assembled together.

Open [http://localhost:3000](http://localhost:8000) to see the BE result.


The frontend is a Next.js app organized by country folders such as `app/country/Denmark/`. Each page uses a single `COUNTRY` constant and a few hooks that call the API and shape fields for charts. All visuals are theme-driven through `app/theme.js`, so colors, typography, spacing, grid lines, and tooltip styles change in one place and propagate everywhere. **/app/app/page.jsx** is where all frontend elements are assembled together.

Open [http://localhost:3000](http://localhost:3000) to see the FE result.

The goal is to quickly deliver analytics on demand and host the dashboard on a server so clients can access it easily and get regular updates.
