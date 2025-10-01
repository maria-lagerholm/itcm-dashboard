# skinny version: trust the data, validate, sort, cache
from fastapi import APIRouter, HTTPException, Response
import pandas as pd
from pandas.api.types import is_integer_dtype
from pathlib import Path
from deps import get_return_buckets_df, RETURN_BUCKETS_PARQUET_PATH

router = APIRouter(prefix="/returning", tags=["returning"])
_cache = {"sig": None, "data": None}

_ORDER = [
    "week 1", "week 2", "week 3",
    "1 month", "2 months", "3 months", "4 months", "5 months", "6 months",
    "7 months", "8 months", "9 months", "10 months", "11 months", "12 months",
    "> 1 year",
]

def _sig(p: Path):
    st = p.stat()
    return (st.st_mtime_ns, st.st_size)

def _load_df() -> pd.DataFrame:
    p = Path(RETURN_BUCKETS_PARQUET_PATH)
    sig = _sig(p)
    if _cache["sig"] != sig:
        try:
            df = get_return_buckets_df()
        except Exception:
            df = pd.read_parquet(p)
        if set(df.columns) != {"bucket", "customers"}:
            raise HTTPException(500, "Invalid columns")
        if not is_integer_dtype(df["customers"]):
            raise HTTPException(500, "customers must be integer dtype")
        if set(df["bucket"].unique()) - set(_ORDER):
            raise HTTPException(500, "Unknown bucket labels")
        cat = pd.Categorical(df["bucket"], categories=_ORDER, ordered=True)
        df = df.assign(bucket=cat).sort_values("bucket").reset_index(drop=True)
        _cache["sig"] = sig
        _cache["data"] = df
    return _cache["data"].copy()

@router.get("/")
def get_returning(response: Response):
    df = _load_df()
    etag = f"{_cache['sig'][0]}-{_cache['sig'][1]}"
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "max-age=60"
    return {
        "data": df.to_dict(orient="records"),
        "meta": {
            "total_customers": int(df["customers"].sum()),
            "buckets": len(df),
            "order": _ORDER,
            "etag": etag,
        },
    }