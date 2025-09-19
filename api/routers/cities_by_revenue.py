# routers/cities_by_revenue.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_city_summary_df  # reads city_summary.parquet

router = APIRouter(prefix="/api/cities_by_revenue", tags=["cities"])

@router.get("")
def cities_by_revenue(df: pd.DataFrame = Depends(get_city_summary_df)):
    # Keep needed cols; drop "Unknown"
    sub = df.loc[
        ~df["city"].str.contains(r"\bunknown\b", case=False, na=False),
        ["country", "city", "total_revenue_sek", "total_orders"],
    ].copy()

    # Ensure ints (cheap if already ints)
    sub["total_revenue_sek"] = sub["total_revenue_sek"].astype("int64")
    sub["total_orders"] = sub["total_orders"].astype("int64")

    # Aggregate per (country, city) to be safe
    city_agg = (
        sub.groupby(["country", "city"], as_index=False)
           .agg(total_revenue_sek=("total_revenue_sek", "sum"),
                total_orders=("total_orders", "sum"))
    )

    # Compute kSEK (nearest thousand) and AOV from totals
    city_agg["ksek"] = ((city_agg["total_revenue_sek"] + 500) // 1000).astype("int64")
    # Avoid div-by-zero; AOV None when no orders
    aov = city_agg["total_revenue_sek"] / city_agg["total_orders"].where(city_agg["total_orders"] != 0, pd.NA)
    city_agg["avg_order_value_sek"] = aov.round().fillna(pd.NA).astype("Int64")

    # Top 10 cities by revenue per country
    city_agg = city_agg.sort_values(["country", "ksek"], ascending=[True, False])
    top10 = city_agg.groupby("country", group_keys=True).head(10)

    # EXACT payload shape + new field
    result = {
        country: [
            {
                "city": row["city"],
                "ksek": int(row["ksek"]),
                "avg_order_value_sek": (None if pd.isna(row["avg_order_value_sek"]) else int(row["avg_order_value_sek"]))
            }
            for _, row in grp.iterrows()
        ]
        for country, grp in top10.groupby("country")
    }

    return {"top_cities_by_revenue_ksek": result}
