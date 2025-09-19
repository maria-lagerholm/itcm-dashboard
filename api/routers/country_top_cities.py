# api/routers/country_top_cities.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from deps import get_city_summary_df

router = APIRouter(prefix="/api/country", tags=["country"])

COUNTRY_ID_TO_ALPHA2 = {"58": "DK", "160": "NO", "205": "SE", "72": "FI"}
ALPHA2_TO_NAME = {"SE": "Sweden", "DK": "Denmark", "NO": "Norway", "FI": "Finland"}

@router.get("/{country_id}/top-cities")
def top_cities(country_id: str, df: pd.DataFrame = Depends(get_city_summary_df)):
    alpha2 = COUNTRY_ID_TO_ALPHA2.get(country_id)
    country_name = ALPHA2_TO_NAME.get(alpha2 or "")
    if not country_name:
        raise HTTPException(404, f"Unknown country_id '{country_id}'")

    if df is None or df.empty:
        raise HTTPException(500, "city_summary is empty")

    df = df.copy()
    for c in ("country", "city", "customers_count"):
        if c not in df.columns:
            raise HTTPException(500, f"city_summary missing '{c}' column")

    df["country"] = df["country"].astype(str).str.strip()
    df["city"] = df["city"].astype(str).str.strip()
    df["customers_count"] = pd.to_numeric(df["customers_count"], errors="coerce").fillna(0).astype(int)

    sub = df[df["country"].str.casefold() == country_name.casefold()]
    sub = sub[~sub["city"].str.casefold().eq("unknown")]
    if sub.empty:
        raise HTTPException(404, f"No data for country_id '{country_id}'")

    top = sub.sort_values("customers_count", ascending=False).head(10)

    return {
        "country_id": country_id,
        "top_cities": [
            {"city": r["city"], "unique_customers": int(r["customers_count"])}
            for _, r in top.iterrows()
        ],
    }
