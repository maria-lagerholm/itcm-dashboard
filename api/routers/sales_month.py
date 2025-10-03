# routers/sales_month.py
from fastapi import APIRouter, Query
from datetime import datetime, timezone
import pandas as pd
from deps import get_city_monthly_revenue_df

router = APIRouter(prefix="/sales_month", tags=["sales"])

DF = get_city_monthly_revenue_df()[["country", "year_month", "total_revenue_sek"]].copy()
DF["month"] = pd.to_datetime(DF["year_month"]).dt.to_period("M")
DF["total_revenue_sek"] = pd.to_numeric(DF["total_revenue_sek"]).fillna(0)

@router.get("")
def sales_per_month_by_country(start_month: str = Query("2024-06")):
    start_p = pd.Period(start_month, "M")
    end_p = DF["month"].max()

    months = pd.period_range(start=start_p, end=end_p, freq="M")
    d = DF[DF["month"].isin(months)]

    by_cm = d.groupby(["country", "month"], as_index=False)["total_revenue_sek"].sum()
    wide = by_cm.pivot(index="country", columns="month", values="total_revenue_sek").reindex(columns=months, fill_value=0)
    ksek = (wide / 1_000).round().astype(int)

    sales = {
        country: [{"month": str(m), "ksek": int(ksek.loc[country, m])} for m in months]
        for country in ksek.index
    }

    return {
        "sales_month_ksek": sales,
        "start_month": str(start_p),
        "end_month": str(end_p),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }