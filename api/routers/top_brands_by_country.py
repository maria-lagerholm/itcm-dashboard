# routers/top_brands_by_country.py
from fastapi import APIRouter, Query
from typing import Optional
from deps import get_top_brands_df

router = APIRouter(prefix="/top_brands_by_country", tags=["top_brands_by_country"])

@router.get("/")
def top_brands_by_country(
    country: Optional[str] = Query(None, description="Country filter"),
):
    df = get_top_brands_df().sort_values(["country", "rank"]).reset_index(drop=True)
    if country:
        mask = df["country"].str.casefold() == country.strip().casefold()
        df = df.loc[mask]
    return {
        "data": df.to_dict(orient="records"),
        "meta": {"rows": int(df.shape[0]), "country": country},
    }
