# routers/sales_month.py
from fastapi import APIRouter, Depends, HTTPException, Query
import pandas as pd
from datetime import datetime, timezone
from deps import get_city_monthly_revenue_df  # <-- new parquet getter

router = APIRouter(prefix="/api/sales_month", tags=["sales"])

@router.get("")
def sales_per_month_by_country(
    df: pd.DataFrame = Depends(get_city_monthly_revenue_df),
    start_month: str = Query("2024-06", description='Inclusive start, format "YYYY-MM"'),
):
    """
    Returns monthly revenue (KSEK) per country from start_month..end_month,
    aggregated from city-level monthly totals in city_monthly_revenue.parquet.
    Output:
      {
        "sales_month_ksek": { "<Country>": [ { "month": "YYYY-MM", "ksek": int }, ... ] },
        "start_month": "YYYY-MM",
        "end_month": "YYYY-MM",
        "generated_at": ISO8601
      }
    """
    # ---- validate start_month ----
    try:
        _ = pd.Period(start_month, freq="M")
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid start_month. Use "YYYY-MM".')

    # ---- minimal schema check ----
    required = {"country", "year_month", "total_revenue_sek"}
    missing = required.difference(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"city_monthly_revenue.parquet missing columns: {', '.join(sorted(missing))}"
        )

    d = df[["country", "year_month", "total_revenue_sek"]].copy()

    # Normalize month → "YYYY-MM" strings
    # (accepts strings already in that format; tolerates timestamps/periods)
    try:
        d["month"] = pd.to_datetime(d["year_month"], errors="coerce").dt.to_period("M").astype(str)
    except Exception:
        d["month"] = d["year_month"].astype(str)

    # Coerce revenue to numeric once
    d["total_revenue_sek"] = pd.to_numeric(d["total_revenue_sek"], errors="coerce").fillna(0)

    # Aggregate to country × month
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

    # Derive end_month from data
    end_month = max(by_cm["month"])

    # Full inclusive month range
    months_all = pd.period_range(start=start_month, end=end_month, freq="M").astype(str).tolist()

    # Keep only rows in window
    by_cm = by_cm[by_cm["month"].isin(months_all)]

    # Ensure all months exist per country (fill 0)
    countries = sorted(by_cm["country"].unique().tolist())
    idx = pd.MultiIndex.from_product([countries, months_all], names=["country", "month"])
    by_cm = by_cm.set_index(["country", "month"]).reindex(idx, fill_value=0).reset_index()

    # Convert to KSEK (round to nearest) and plain ints
    by_cm["ksek"] = (by_cm["total_sek"] / 1_000).round(0).astype(int)

    # Sort for stable output
    by_cm = by_cm.sort_values(["country", "month"])

    # Build payload: { country: [ {month, ksek}, ... ] }
    out = {}
    for country, g in by_cm.groupby("country", sort=False):
        out[country] = [{"month": m, "ksek": int(v)} for m, v in zip(g["month"], g["ksek"])]

    return {
        "sales_month_ksek": out,
        "start_month": start_month,
        "end_month": end_month,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
