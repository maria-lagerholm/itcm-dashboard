# routers/countries_by_revenue.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_country_summary_df

router = APIRouter(prefix="/countries_by_revenue", tags=["countries"])

def _build_payload(df: pd.DataFrame):
    d = df.loc[:, ["country", "total_revenue_sek", "total_orders", "avg_order_value_sek"]].copy()
    d["ksek"] = (d["total_revenue_sek"] / 1000).round().astype("int64")
    d["avg_order_value_sek"] = d["avg_order_value_sek"].astype("object").where(d["avg_order_value_sek"].notna(), None)

    return {
        "revenue_by_country_ksek": d.set_index("country")["ksek"].to_dict(),
        "avg_order_value_by_country_sek": d.set_index("country")["avg_order_value_sek"].to_dict(),
        "orders_count_by_country": d.set_index("country")["total_orders"].astype("int64").to_dict(),
    }

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_country_summary_df)):
    return _build_payload(df)
