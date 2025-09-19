# routers/countries_by_revenue.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from deps import get_country_summary_df, COUNTRY_SUMMARY_CSV_PATH

router = APIRouter(prefix="/api/countries_by_revenue", tags=["countries"])

_payload_cache = {"mtime": None, "data": None}

def _build_payload(df: pd.DataFrame) -> dict:
    required = {"country", "total_revenue_sek", "total_orders", "avg_order_value_sek"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(500, detail=f"country_summary is missing: {', '.join(sorted(missing))}")

    # Do this ONCE per file change, not per request
    d = df.copy()
    d["total_revenue_sek"] = pd.to_numeric(d["total_revenue_sek"], errors="coerce").fillna(0).astype("int64")
    d["total_orders"] = pd.to_numeric(d["total_orders"], errors="coerce").fillna(0).astype("int64")
    d["avg_order_value_sek"] = pd.to_numeric(d["avg_order_value_sek"], errors="coerce").fillna(0).astype("int64")
    d["revenue_by_country_ksek"] = ((d["total_revenue_sek"] + 500) // 1000).astype("int64")

    return {
        "revenue_by_country_ksek": dict(zip(d["country"], d["revenue_by_country_ksek"])),
        "avg_order_value_by_country_sek": dict(zip(d["country"], d["avg_order_value_sek"])),
        "orders_count_by_country": dict(zip(d["country"], d["total_orders"])),
    }

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_country_summary_df)):
    mtime = COUNTRY_SUMMARY_CSV_PATH.stat().st_mtime
    if _payload_cache["data"] is None or _payload_cache["mtime"] != mtime:
        _payload_cache["data"] = _build_payload(df)
        _payload_cache["mtime"] = mtime
    return _payload_cache["data"]
