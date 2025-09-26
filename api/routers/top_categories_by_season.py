# routers/top_categories_by_season.py
from fastapi import APIRouter, HTTPException, Query, Response
import pandas as pd
from pathlib import Path
from typing import Optional
from deps import get_top_categories_df, TOP_CATEGORIES_PARQUET_PATH

router = APIRouter(prefix="/api/top_categories_by_season", tags=["top_categories_by_season"])
_cache = {"sig": None, "data": None}

def _sig(p: Path):
    st = p.stat()
    return st.st_mtime_ns, st.st_size

def _load_df():
    p = Path(TOP_CATEGORIES_PARQUET_PATH)
    sig = _sig(p)
    if _cache["sig"] != sig:
        try:
            df = get_top_categories_df()
        except Exception:
            df = pd.read_parquet(p)
        df = df.sort_values(["country", "season_label", "rank"]).reset_index(drop=True)
        _cache["sig"] = sig
        _cache["data"] = df
    return _cache["data"].copy()

@router.get("/")
def top_categories_by_season(
    response: Response,
    country: Optional[str] = Query(None, description="Country (case-insensitive)"),
    season: Optional[str] = Query(None, alias="season_label", description="Season label"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Top N per (country, season)"),
):
    df = _load_df()
    etag = f"{_cache['sig'][0]}-{_cache['sig'][1]}"
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "max-age=60"

    if country:
        df = df[df["country"].str.lower() == country.strip().lower()]
        if df.empty:
            raise HTTPException(404, f"No data for country: {country}")
    if season:
        df = df[df["season_label"] == season]
        if df.empty:
            raise HTTPException(404, f"No data for season_label: {season}")
    if limit is not None:
        df = (
            df.sort_values(["country", "season_label", "rank"])
              .groupby(["country", "season_label"], as_index=False, group_keys=False)
              .head(limit)
        )
    return {
        "data": df.to_dict(orient="records"),
        "meta": {
            "rows": int(df.shape[0]),
            "etag": etag,
            "country": country,
            "season_label": season,
            "limit": limit,
        },
    }
