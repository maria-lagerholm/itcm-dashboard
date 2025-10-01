# api/routers/country_top_cities.py
from fastapi import APIRouter, Depends, Path, Query
import pandas as pd
from deps import get_city_summary_df

router = APIRouter(prefix="/country", tags=["country"])

@router.get("/{country}/top-cities")
def top_cities(
    country: str = Path(..., description='e.g. "Sweden"'),
    limit: int = Query(10, ge=1, le=50),
    df: pd.DataFrame = Depends(get_city_summary_df),
):
    if (
        df is None
        or df.empty
        or "country" not in df.columns
        or "city" not in df.columns
    ):
        return {"country": country, "top_cities": []}

    c_norm = country.strip().casefold()
    mask = (
        df["country"].astype(str).str.strip().str.casefold().eq(c_norm)
        & ~df["city"].astype(str).str.contains(r"\bunknown\b", case=False, na=False)
    )

    cols = [c for c in ["city", "customers_count", "total_revenue_sek", "total_orders", "avg_order_value_sek"] if c in df.columns]
    sub = df.loc[mask, cols].copy()
    if sub.empty:
        return {"country": country, "top_cities": []}

    if "customers_count" in sub.columns:
        sub["customers_count"] = pd.to_numeric(sub["customers_count"], errors="coerce").fillna(0).astype("int64")
        sub = sub.sort_values("customers_count", ascending=False).head(limit)
    else:
        sub = sub.head(limit)

    return {
        "country": country,
        "top_cities": sub.to_dict(orient="records"),
    }
