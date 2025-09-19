# api/routers/country_top_cities.py
from fastapi import APIRouter, Depends, HTTPException, Path, Query
import pandas as pd
from deps import get_city_summary_df  # reads city_summary.parquet

router = APIRouter(prefix="/api/country", tags=["country"])

ID2NAME = {"58": "Denmark", "160": "Norway", "205": "Sweden", "72": "Finland"}

@router.get("/{country_id}/top-cities")
def top_cities(
    country_id: str = Path(..., description="invoiceCountryId, e.g. 205 for Sweden"),
    limit: int = Query(10, ge=1, le=50),
    df: pd.DataFrame = Depends(get_city_summary_df),
):
    name = ID2NAME.get(country_id)
    if not name or df is None or df.empty:
        return {"country_id": country_id, "top_cities": []}

    # filter country + exclude "Unknown" (case-insensitive)
    mask = (
        df["country"].str.strip().str.casefold().eq(name.casefold())
        & ~df["city"].str.contains(r"\bunknown\b", case=False, na=False)
    )
    sub = df.loc[mask, ["city", "customers_count"]]
    if sub.empty:
        return {"country_id": country_id, "top_cities": []}

    # ensure ints, aggregate once in case of accidental duplicates, then top-k
    sub = sub.assign(customers_count=sub["customers_count"].astype("int64"))
    top = (
        sub.groupby("city", as_index=False)["customers_count"].sum()
           .nlargest(limit, "customers_count")
    )

    # format exactly as FE expects; title-case like previous endpoint
    top["city"] = top["city"].astype(str).str.title()
    return {
        "country_id": country_id,
        "top_cities": [
            {"city": c, "unique_customers": int(n)}
            for c, n in zip(top["city"].to_list(), top["customers_count"].to_list())
        ],
    }
