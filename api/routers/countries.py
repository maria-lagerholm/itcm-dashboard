# routers/countries.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_customer_summary_df

router = APIRouter(prefix="/countries", tags=["countries"])

@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customer_summary_df)):
    counts = (
        df.groupby("country")["customer_id"]
          .nunique()                # or .count() if duplicates are OK
          .sort_values(ascending=False)
          .astype(int)
          .to_dict()
    )
    return {"customers_by_country": counts}

@router.get("/segments")
def customer_segments_by_country(df: pd.DataFrame = Depends(get_customer_summary_df)):
    labels = ["New", "Returning", "Loyal"]

    counts = (
        df.groupby(["country", "status"])
          .size()
          .rename("count")
          .reset_index()
    )
    pivot = (
        counts.pivot(index="country", columns="status", values="count")
              .reindex(columns=labels, fill_value=0)
              .astype(int)
    )
    totals = pivot.sum(axis=1)

    payload = {
        country: {
            "total_customers_with_orders": int(total),
            "segments": {
                label: {
                    "count": int(pivot.at[country, label]),
                    "percent": round((pivot.at[country, label] / total * 100) if total else 0.0, 1),
                }
                for label in labels
            },
        }
        for country, total in totals.items()
    }

    grand_total = int(totals.sum())
    return {"segments_by_country": payload, "total_customers": grand_total}