# routers/countries_by_revenue.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from deps import get_transactions_df

router = APIRouter(prefix="/api/countries_by_revenue", tags=["countries"])

# Map alpha-2 currency_country codes to country names
COUNTRY_MAP_ALPHA = {
    "SE": "Sweden",
    "DK": "Denmark",
    "FI": "Finland",
    "NO": "Norway",
}

def _to_number(s: pd.Series) -> pd.Series:
    """Parse numbers that may contain NBSP, spaces as thousands sep, or comma decimals."""
    return pd.to_numeric(
        s.astype(str)
         .str.replace("\u00A0", "", regex=False)  # NBSP
         .str.replace(" ", "", regex=False)       # thousands sep
         .str.replace(",", ".", regex=False),     # 12,5 -> 12.5
        errors="coerce",
    )

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_transactions_df)):
    # ---- sanity checks ----
    required = {"price_sek", "currency_country", "quantity"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"transactions_clean is missing required columns: {', '.join(sorted(missing))}"
        )

    # AOV requires orderId
    if "orderId" not in df.columns:
        raise HTTPException(status_code=500, detail="transactions_clean missing: orderId")

    # ---- clean + totals per line ----
    df = df.copy()
    df["price_sek"] = _to_number(df["price_sek"])
    df["quantity"]  = _to_number(df["quantity"])
    df = df.dropna(subset=["price_sek", "quantity"])
    df["line_total_sek"] = df["price_sek"] * df["quantity"]

    # normalize country code to readable country; keep "Other" fallback
    df["country"] = (
        df["currency_country"]
          .astype(str).str.strip().str.upper()
          .map(COUNTRY_MAP_ALPHA)
          .fillna("Other")
    )

    # ---- 1) Revenue by country (sum of line totals) ----
    rev_by_country = (
        df.groupby("country", dropna=False)["line_total_sek"]
          .sum()
          .sort_values(ascending=False)
    )
    rev_by_country_ksek = (rev_by_country / 1_000).round(0).astype(int)

    # ---- 2) Average Order Value by country ----
    # Collapse line-items → orders: sum line_total per (orderId)
    # If an order accidentally spans multiple countries, pick the most frequent (mode) country in that order.
    order_level = (
        df.groupby("orderId", as_index=False)
          .agg(
              order_total_sek=("line_total_sek", "sum"),
              # mode country per order; fallback to first non-null
              country=("country", lambda x: x.mode().iat[0] if not x.mode().empty else x.dropna().iat[0] if x.dropna().size else "Other"),
          )
    )

    # Now AOV per country = mean(order_total_sek) within each country
    aov_by_country = (
        order_level.groupby("country", dropna=False)["order_total_sek"]
                   .mean()
                   .round(0)  # round to whole SEK
                   .astype(int)
    )

    # Optional: number of orders per country (handy for tooltips)
    orders_count = (
        order_level.groupby("country", dropna=False)["orderId"]
                   .count()
                   .astype(int)
    )

    # ---- payload ----
    return {
        "revenue_by_country_ksek": rev_by_country_ksek.to_dict(),
        "avg_order_value_by_country_sek": aov_by_country.to_dict(),
        "orders_count_by_country": orders_count.to_dict(),
    }
