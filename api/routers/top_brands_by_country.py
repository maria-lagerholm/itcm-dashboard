# routers/top_brands_by_country.py
from fastapi import APIRouter, HTTPException, Query, Response
import pandas as pd
from pathlib import Path
from typing import Optional, Tuple
from deps import get_top_brands_df, TOP_BRANDS_PARQUET_PATH

router = APIRouter(prefix="/api/top_brands_by_country", tags=["top_brands_by_country"])
_cache = {"sig": None, "data": None}

def _sig(p: Path) -> Tuple[int, int]:
    st = p.stat()
    return (st.st_mtime_ns, st.st_size)

def _load_df() -> pd.DataFrame:
    p = Path(TOP_BRANDS_PARQUET_PATH)
    sig = _sig(p)
    if _cache["sig"] != sig:
        try:
            df = get_top_brands_df()
        except Exception:
            df = pd.read_parquet(p)
        df = df.sort_values(["country", "rank"]).reset_index(drop=True)
        _cache["sig"] = sig
        _cache["data"] = df
    return _cache["data"].copy()

@router.get("/")
def top_brands_by_country(
    response: Response,
    country: Optional[str] = Query(None, description="Filter by country (case-insensitive)"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Top N per country"),
):
    df = _load_df()

    # cheap ETag + basic caching
    etag = f"{_cache['sig'][0]}-{_cache['sig'][1]}"
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "max-age=60"

    if country:
        m = df["country"].str.lower() == country.strip().lower()
        df = df.loc[m]
        if df.empty:
            raise HTTPException(404, f"No data for country: {country}")

    if limit is not None:
        df = df.groupby("country", as_index=False, group_keys=False).head(limit)

    return {
        "data": df.to_dict(orient="records"),  # [{country, brand, count, rank}, ...]
        "meta": {"rows": int(df.shape[0]), "etag": etag, "country": country, "limit": limit},
    }
