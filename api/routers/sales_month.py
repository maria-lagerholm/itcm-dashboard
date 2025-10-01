# routers/sales_month.py
from fastapi import APIRouter, Depends, HTTPException, Query
import pandas as pd
from datetime import datetime, timezone
from deps import get_city_monthly_revenue_df

router = APIRouter(prefix="/sales_month", tags=["sales"])

@router.get("")
def sales_per_month_by_country(
    df: pd.DataFrame = Depends(get_city_monthly_revenue_df),
    start_month: str = Query("2024-06", description='Start month "YYYY-MM"'),
):
    try:
        pd.Period(start_month, freq="M")
    except Exception:
        raise HTTPException(400, 'Invalid start_month. Use "YYYY-MM".')

    required = {"country", "year_month", "total_revenue_sek"}
    if not required.issubset(df.columns):
        raise HTTPException(500, f"Missing columns: {', '.join(sorted(required - set(df.columns)))}")

    d = df[["country", "year_month", "total_revenue_sek"]].copy()
    d["month"] = pd.to_datetime(d["year_month"], errors="coerce").dt.to_period("M").astype(str)
    d["total_revenue_sek"] = pd.to_numeric(d["total_revenue_sek"], errors="coerce").fillna(0)

    by_cm = (
        d.groupby(["country", "month"], as_index=False)["total_revenue_sek"]
         .sum()
         .rename(columns={"total_revenue_sek": "total_sek"})
    )

    if by_cm.empty:
        return {
            "sales_month_ksek": {},
            "start_month": start_month,
            "end_month": start_month,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    end_month = by_cm["month"].max()
    months_all = pd.period_range(start=start_month, end=end_month, freq="M").astype(str).tolist()
    by_cm = by_cm[by_cm["month"].isin(months_all)]

    countries = sorted(by_cm["country"].unique())
    idx = pd.MultiIndex.from_product([countries, months_all], names=["country", "month"])
    by_cm = by_cm.set_index(["country", "month"]).reindex(idx, fill_value=0).reset_index()
    by_cm["ksek"] = (by_cm["total_sek"] / 1_000).round().astype(int)
    by_cm = by_cm.sort_values(["country", "month"])

    out = {
        country: [{"month": m, "ksek": int(v)} for m, v in zip(g["month"], g["ksek"])]
        for country, g in by_cm.groupby("country", sort=False)
    }

    return {
        "sales_month_ksek": out,
        "start_month": start_month,
        "end_month": end_month,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
