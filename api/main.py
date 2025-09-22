from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from deps import get_customers_df
from routers import countries as countries_router
from routers import country_top_cities as country_top_cities_router
from routers.countries_by_revenue import router as country_revenue_router
from routers.cities_by_revenue import router as cities_by_revenue_router
from routers.customers_age_gender import router as customers_age_gender_router
from routers.sales_month import router as sales_month_router
from routers.countries_by_channel import router as countries_by_channel_router

# ---- FastAPI app initialization ----
app = FastAPI(title="Item Dashboard")

# ---- CORS middleware setup ----
# If you have trouble with frontend requests being blocked, check allowed origins here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this if your frontend runs elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Register API routers ----
# If endpoints are missing, make sure routers are included here.
app.include_router(countries_router.router)
app.include_router(country_top_cities_router.router)
app.include_router(country_revenue_router)
app.include_router(cities_by_revenue_router)
app.include_router(customers_age_gender_router)
app.include_router(sales_month_router)
app.include_router(countries_by_channel_router)

# ---- Health check endpoint ----
# Use this to verify the API server is running and responsive.
@app.get("/health")
def health():
    return {"ok": True}

# ---- Root summary endpoint ----
# Returns customer counts by country.
# If this fails, check that the customers_clean.csv file is present and columns are correct.
@app.get("/")
def root_summary(df: pd.DataFrame = Depends(get_customers_df)):
    return countries_router.customers_by_country(df)
