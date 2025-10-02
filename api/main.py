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
from routers.returning import router as returning_router
from routers.top_brands_by_country import router as top_brands_by_country_router
from routers.top_categories_by_season import router as top_categories_by_season_router
from routers.top_products import router as top_products_router
from routers.top_repurchase_by_country import router as top_repurchase_by_country_router
from routers.cooccurrence import router as cooccurrence_router

app = FastAPI(root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(countries_router.router)
app.include_router(cooccurrence_router)
app.include_router(country_top_cities_router.router)
app.include_router(country_revenue_router)
app.include_router(cities_by_revenue_router)
app.include_router(customers_age_gender_router)
app.include_router(sales_month_router)
app.include_router(countries_by_channel_router)
app.include_router(returning_router)
app.include_router(top_brands_by_country_router)
app.include_router(top_categories_by_season_router)
app.include_router(top_products_router)
app.include_router(top_repurchase_by_country_router)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root_summary(df: pd.DataFrame = Depends(get_customers_df)):
    return countries_router.customers_by_country(df)