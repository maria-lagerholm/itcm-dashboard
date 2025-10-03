# routers/countries_by_revenue.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_country_summary_df

router = APIRouter(prefix="/countries_by_revenue", tags=["countries"])

def _build_payload(df: pd.DataFrame):
    d = df[["country", "total_revenue_sek", "total_orders", "avg_order_value_sek"]].copy()
    ksek = (d["total_revenue_sek"] + 500) // 1000
    countries = d["country"].astype(str)
    return {
        "revenue_by_country_ksek": dict(zip(countries, ksek)),
        "avg_order_value_by_country_sek": dict(zip(countries, d["avg_order_value_sek"])),
        "orders_count_by_country": dict(zip(countries, d["total_orders"])),
    }

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_country_summary_df)):
    return _build_payload(df)
