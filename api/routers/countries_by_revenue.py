# routers/countries_by_revenue.py
from fastapi import APIRouter, Depends
import pandas as pd
from pathlib import Path
from deps import get_country_summary_df, COUNTRY_SUMMARY_PARQUET_PATH

router = APIRouter(prefix="/api/countries_by_revenue", tags=["countries"])

_cache = {"sig": None, "data": None}

def _sig(p: Path):
    st = p.stat()
    return st.st_mtime_ns, st.st_size

def _build_payload(df: pd.DataFrame):
    d = df[["country", "total_revenue_sek", "total_orders", "avg_order_value_sek"]].copy()
    d = d.astype({"total_revenue_sek": "int64", "total_orders": "int64", "avg_order_value_sek": "int64"})
    ksek = (d["total_revenue_sek"] + 500) // 1000
    countries = d["country"].astype(str)
    return {
        "revenue_by_country_ksek": dict(zip(countries, ksek)),
        "avg_order_value_by_country_sek": dict(zip(countries, d["avg_order_value_sek"])),
        "orders_count_by_country": dict(zip(countries, d["total_orders"])),
    }

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_country_summary_df)):
    sig = _sig(COUNTRY_SUMMARY_PARQUET_PATH)
    if _cache["data"] is None or _cache["sig"] != sig:
        _cache["data"] = _build_payload(df)
        _cache["sig"] = sig
    return _cache["data"]
