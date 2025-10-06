# api/routers/country_top_cities.py
from fastapi import APIRouter, Query
from deps import get_city_summary_df

router = APIRouter(prefix="/country", tags=["country"])

@router.get("/{country}/top-cities")
def top_cities(country: str, limit: int = 10):
    df = get_city_summary_df()[[
        "country", "city", "customers_count",
        "total_revenue_sek", "total_orders", "avg_order_value_sek"
    ]]
    c = country.strip().casefold()
    sub = (
        df[df["country"].str.casefold() == c]
        .sort_values("customers_count", ascending=False)
        .head(limit)
        .reset_index(drop=True)
    )
    return {"country": country, "top_cities": sub.to_dict("records")}
