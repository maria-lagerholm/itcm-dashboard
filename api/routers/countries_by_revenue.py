# routers/countries_by_revenue.py
from fastapi import APIRouter, Depends
import pandas as pd
from pathlib import Path
from deps import get_country_summary_df, COUNTRY_SUMMARY_PARQUET_PATH

router = APIRouter(prefix="/api/countries_by_revenue", tags=["countries"])

_cache = {"sig": None, "data": None}  # (mtime_ns, size)

def _sig(p: Path) -> tuple[int, int]:
    st = p.stat()
    return (st.st_mtime_ns, st.st_size)

def _build_payload(df: pd.DataFrame) -> dict:
    d = df[["country", "total_revenue_sek", "total_orders", "avg_order_value_sek"]].copy()

    # minimal, assumes schema is stable; cast once
    d["total_revenue_sek"] = d["total_revenue_sek"].astype("int64")
    d["total_orders"] = d["total_orders"].astype("int64")
    d["avg_order_value_sek"] = d["avg_order_value_sek"].astype("int64")

    ksek = (d["total_revenue_sek"] + 500) // 1000
    countries = d["country"].astype(str).tolist()

    return {
        "revenue_by_country_ksek": {c: int(v) for c, v in zip(countries, ksek.tolist())},
        "avg_order_value_by_country_sek": {c: int(v) for c, v in zip(countries, d["avg_order_value_sek"].tolist())},
        "orders_count_by_country": {c: int(v) for c, v in zip(countries, d["total_orders"].tolist())},
    }

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_country_summary_df)):
    sig = _sig(COUNTRY_SUMMARY_PARQUET_PATH)
    if _cache["data"] is None or _cache["sig"] != sig:
        _cache["data"] = _build_payload(df)
        _cache["sig"] = sig
    return _cache["data"]
