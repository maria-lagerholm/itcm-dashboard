from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from deps import get_customers_df
from routers import countries as countries_router
from routers import country_top_cities as country_top_cities_router
from routers.countries_by_revenue import router as country_revenue_router
from routers.cities_by_revenue import router as cities_by_revenue_router


app = FastAPI(title="Item Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(countries_router.router)
app.include_router(country_top_cities_router.router)
app.include_router(country_revenue_router)
app.include_router(cities_by_revenue_router)


@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root_summary(df: pd.DataFrame = Depends(get_customers_df)):
    return countries_router.customers_by_country(df)
