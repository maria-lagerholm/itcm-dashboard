# routers/countries_by_revenue.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
import numpy as np
from deps import get_transactions_df

router = APIRouter(prefix="/api/countries_by_revenue", tags=["countries"])

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_transactions_df)):
    required = {"line_total_sek", "currency_country", "orderId"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(500, detail=f"transactions_clean is missing: {', '.join(sorted(missing))}")

    # Ensure 'line_total_sek' is numeric (imported as str previously)
    df = df.copy()
    df["line_total_sek"] = pd.to_numeric(df["line_total_sek"], errors="coerce")

    # Only use 'currency_country' as the country key, no mapping
    df = df.dropna(subset=["currency_country"])

    # revenue -> kSEK (integer rounding)
    rev_sum = df.groupby("currency_country", sort=False)["line_total_sek"].sum()
    rev_by_country_ksek = ((rev_sum + 500) // 1000).astype("int64")

    # AOV per country
    order_totals = df.groupby("orderId", sort=False)["line_total_sek"].sum()
    order_country = df.groupby("orderId", sort=False)["currency_country"].agg(
        lambda x: x.mode().iat[0] if not x.mode().empty else x.iloc[0]
    )
    order_level = pd.DataFrame({"order_total_sek": order_totals, "currency_country": order_country})
    sums = order_level.groupby("currency_country", sort=False)["order_total_sek"].sum()
    counts = order_level.groupby("currency_country", sort=False)["order_total_sek"].size()
    aov_by_country = ((sums * 2 + counts) // (2 * counts)).astype("int64")

    orders_count = counts.astype("int64")

    return {
        "revenue_by_country_ksek": rev_by_country_ksek.to_dict(),
        "avg_order_value_by_country_sek": aov_by_country.to_dict(),
        "orders_count_by_country": orders_count.to_dict(),
    }
