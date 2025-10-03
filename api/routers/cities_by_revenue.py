from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_city_summary_df

router = APIRouter(prefix="/cities_by_revenue", tags=["cities"])

@router.get("")
def cities_by_revenue(df: pd.DataFrame = Depends(get_city_summary_df)):
    sub = df.loc[
        ~df["city"].str.contains("unknown", case=False, na=False),
        ["country", "city", "total_revenue_sek", "total_orders"],
    ]

    agg = (
        sub.groupby(["country", "city"], as_index=False)
           .sum(numeric_only=True)
    )

    agg["ksek"] = ((agg["total_revenue_sek"] + 500) // 1000).astype("int64")
    aov = agg["total_revenue_sek"] / agg["total_orders"].where(agg["total_orders"] != 0, pd.NA)
    agg["avg_order_value_sek"] = aov.round().astype("Int64")

    top10 = (
        agg.sort_values(["country", "ksek"], ascending=[True, False])
           .groupby("country", group_keys=True)
           .head(10)
    )

    result = {
        country: [
            {
                "city": row["city"],
                "ksek": int(row["ksek"]),
                "avg_order_value_sek": (None
                    if pd.isna(row["avg_order_value_sek"])
                    else int(row["avg_order_value_sek"]))
            }
            for _, row in grp.iterrows()
        ]
        for country, grp in top10.groupby("country")
    }

    return {"top_cities_by_revenue_ksek": result}
