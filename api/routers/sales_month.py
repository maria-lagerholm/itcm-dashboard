# routers/sales_month.py
from fastapi import APIRouter, Depends, HTTPException, Query
import pandas as pd
from datetime import datetime, timezone
from deps import get_transactions_df

router = APIRouter(prefix="/api/sales_month", tags=["sales"])

def _to_number(s: pd.Series) -> pd.Series:
    """Lenient number parser: handles NBSP, spaces as thousands sep, comma decimals."""
    return pd.to_numeric(
        s.astype(str)
         .str.replace("\u00A0", "", regex=False)  # NBSP
         .str.replace(" ", "", regex=False)       # spaces
         .str.replace(",", ".", regex=False),     # 12,5 -> 12.5
        errors="coerce",
    )

@router.get("")
def sales_per_month_by_country(
    df: pd.DataFrame = Depends(get_transactions_df),
    start_month: str = Query("2024-06", description='Inclusive start, format "YYYY-MM"'),
):
    """
    Returns monthly revenue (KSEK) per country from start_month..(max(data month)).
    Revenue is computed at order-level: sum(price_sek*quantity) per orderId, month = min line month,
    country = mode of line countries (fallback first non-null, else "Other").
    """
    # ---- required columns ----
    required = {"created", "orderId", "price_sek", "quantity", "currency_country"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"transactions_clean missing required columns: {', '.join(sorted(missing))}"
        )

    # ---- validate start_month ----
    try:
        _ = pd.Period(start_month, freq="M")
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid start_month. Use "YYYY-MM".')

    # ---- clean & compute line totals ----
    df = df.copy()
    df["price_sek"] = _to_number(df["price_sek"])
    df["quantity"]  = _to_number(df["quantity"])
    df = df.dropna(subset=["price_sek", "quantity"])
    df["line_total_sek"] = df["price_sek"] * df["quantity"]

    # parse created -> month "YYYY-MM"
    df["created"] = pd.to_datetime(df["created"], errors="coerce", utc=False)
    df = df.dropna(subset=["created"])
    if df.empty:
        return {"sales_month_ksek": {}, "start_month": start_month, "end_month": start_month, "generated_at": datetime.now(timezone.utc).isoformat()}

    df["month"] = df["created"].dt.to_period("M").astype(str)  # e.g. "2024-09"

    # currency_country is already remapped in the dataset, so just use as is
    if "country" in df.columns:
        # Use the already remapped country column if present
        pass
    else:
        # Fallback: use currency_country as country
        df["country"] = df["currency_country"]

    # ---- collapse to order level: total + month + country (mode) ----
    order_level = (
        df.groupby("orderId", as_index=False)
          .agg(
              order_total_sek=("line_total_sek", "sum"),
              month=("month", "min"),
              country=("country", lambda x: x.mode().iat[0] if not x.mode().empty
                                       else (x.dropna().iat[0] if x.dropna().size else "Other")),
          )
    )

    # ---- derive dynamic end_month from data ----
    if order_level["month"].empty:
        end_month = start_month
    else:
        end_month = max(order_level["month"])

    # full month range (inclusive)
    months_all = pd.period_range(start=start_month, end=end_month, freq="M").astype(str).tolist()

    # keep only rows within the window
    order_level = order_level[order_level["month"].isin(months_all)]

    # ---- aggregate: country x month -> sum(order_total) ----
    by_cm = (
        order_level.groupby(["country", "month"], dropna=False)["order_total_sek"]
                   .sum()
                   .rename("total_sek")
                   .reset_index()
    )

    # ---- ensure all months exist per country (fill 0) ----
    countries_set = set(by_cm["country"].unique())
    idx = pd.MultiIndex.from_product([sorted(countries_set), months_all], names=["country", "month"])
    by_cm = by_cm.set_index(["country", "month"]).reindex(idx, fill_value=0).reset_index()

    # ---- KSEK ints ----
    by_cm["ksek"] = (by_cm["total_sek"] / 1_000).round(0).astype(int)

    # ---- payload: { country: [ {month, ksek}, ... ] } ----
    out = {}
    for country, g in by_cm.groupby("country", sort=False):
        g = g.sort_values("month")
        out[country] = [{"month": m, "ksek": int(v)} for m, v in zip(g["month"], g["ksek"])]

    return {
        "sales_month_ksek": out,
        "start_month": start_month,
        "end_month": end_month,  # from data
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
