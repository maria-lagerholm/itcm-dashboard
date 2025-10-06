# routers/top_brands_by_country.py
from fastapi import APIRouter, Query
from typing import Optional
from deps import get_top_brands_df

router = APIRouter(prefix="/top_brands_by_country", tags=["top_brands_by_country"])

@router.get("/")
def top_brands_by_country(country: Optional[str] = Query(None, description="Country filter")):
    df = get_top_brands_df()
    if country:
        c = country.strip().casefold()
        df = df[df["country"].str.casefold() == c]

    df = df.sort_values(["country", "rank"], ascending=[True, True]).reset_index(drop=True)
    return {
        "data": df.to_dict(orient="records"),
        "meta": {"rows": int(df.shape[0]), "country": country},
    }
