# routers/countries.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_customer_summary_df

router = APIRouter(prefix="/countries", tags=["countries"])

@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customer_summary_df)):
    s = (df.groupby("country")["customer_id"])
    return {"customers_by_country": s.to_dict()}

@router.get("/segments")
def customer_segments_by_country(df: pd.DataFrame = Depends(get_customer_summary_df)):
    labels = ["New", "Returning", "Loyal"]

    counts = (df.groupby(["country", "status"])
                    .size()
                    .rename("count")
                    .reset_index())

    payload = {}
    for country, grp in counts.groupby("country"):
        seg_map = {row["status"]: int(row["count"]) for _, row in grp.iterrows()}
        total = int(grp["count"].sum())
        payload[country] = {
            "total_customers_with_orders": total,
            "segments": {
                k: {
                    "count": seg_map.get(k, 0),
                    "percent": round((seg_map.get(k, 0) / total * 100) if total else 0.0, 1),
                }
                for k in labels
            },
        }

    grand_total = int(sum(v["total_customers_with_orders"] for v in payload.values()))
    return {"segments_by_country": payload, "total_customers": grand_total}