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
    # ---- Filter for rows matching the requested country_id ----
    # Debug: Check if country_id exists in the data, and if invoiceCity/shopUserId columns are present
    d = df.loc[df["invoiceCountryId"] == country_id, ["invoiceCity", "shopUserId"]]
    if d.empty:
        # Debug: No customers found for this country_id
        return {"country_id": country_id, "top_cities": []}

    # ---- Normalize city names for grouping (case-insensitive) ----
    # Debug: Check for empty or null city names before grouping
    d = d.copy()
    d["invoiceCity_lower"] = d["invoiceCity"].astype(str).str.lower()

    # ---- Group by normalized city name and count unique customers ----
    # Debug: After grouping, check if any cities have zero customers (should not happen)
    top = (
        d.groupby("invoiceCity_lower")["shopUserId"]
         .nunique()
         .sort_values(ascending=False)
         .head(limit)
         .reset_index()
         .rename(columns={"invoiceCity_lower": "city", "shopUserId": "unique_customers"})
    )

    # ---- Format city names for output (title case for consistency) ----
    # Debug: Check for cities with unexpected formatting or duplicates after title-casing
    top["city"] = top["city"].str.title()

    # ---- Return result as list of dicts ----
    # Debug: Check if fewer than 'limit' cities are returned (may indicate low data volume)
    return {"country_id": country_id, "top_cities": top.to_dict(orient="records")}
