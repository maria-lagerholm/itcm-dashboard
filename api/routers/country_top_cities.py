# api/routers/country_top_cities.py
from fastapi import APIRouter, Query
from deps import get_city_summary_df

router = APIRouter(prefix="/country", tags=["country"])

DF = get_city_summary_df()[[
    "country", "city", "customers_count",
    "total_revenue_sek", "total_orders", "avg_order_value_sek"
]]

@router.get("/{country}/top-cities")
def top_cities(
    country: str,
    limit: int = 10,
):
    sub = (
        DF[DF["country"] == country]
        .sort_values("customers_count", ascending=False)
        .head(limit)
    )
    return {"country": country, "top_cities": sub.to_dict("records")}
