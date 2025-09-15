# api/routers/country_top_cities.py
from fastapi import APIRouter, Depends, Path, Query
import pandas as pd
from deps import get_customers_df

router = APIRouter(prefix="/api/country", tags=["country"])

@router.get("/{country_id}/top-cities")
def top_cities(
    country_id: str = Path(..., description="invoiceCountryId, e.g. 205 for Sweden"),
    limit: int = Query(10, ge=1, le=50),
    df: pd.DataFrame = Depends(get_customers_df),
):
    # Filter rows for this country
    d = df.loc[df["invoiceCountryId"] == country_id, ["invoiceCity", "shopUserId"]]
    if d.empty:
        return {"country_id": country_id, "top_cities": []}

    # Make city names case-insensitive for grouping
    d = d.copy()
    d["invoiceCity_lower"] = d["invoiceCity"].str.lower()

    top = (
        d.groupby("invoiceCity_lower")["shopUserId"]
         .nunique()
         .sort_values(ascending=False)
         .head(limit)
         .reset_index()
         .rename(columns={"invoiceCity_lower": "city", "shopUserId": "unique_customers"})
    )

    #return the city name in a consistent format, e.g., title case
    top["city"] = top["city"].str.title()

    return {"country_id": country_id, "top_cities": top.to_dict(orient="records")}
