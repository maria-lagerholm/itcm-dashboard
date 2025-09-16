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
         .str.replace("\u00A0", "", regex=False)  # Remove non-breaking spaces
         .str.replace(" ", "", regex=False)       # Remove regular spaces (thousands sep)
         .str.replace(",", ".", regex=False),     # Convert comma decimal to dot
        errors="coerce",
    )

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_transactions_df)):
    # ---- Sanity checks: Ensure required columns are present ----
    required = {"price_sek", "currency_country", "quantity"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"transactions_clean is missing required columns: {', '.join(sorted(missing))}"
        )

    # Check for orderId column, needed for AOV calculation
    if "orderId" not in df.columns:
        raise HTTPException(status_code=500, detail="transactions_clean missing: orderId")

    # ---- Data cleaning and line total calculation ----
    # Make a copy to avoid mutating the original DataFrame
    df = df.copy()
    # Convert price and quantity to numeric, handling various formatting issues
    df["price_sek"] = _to_number(df["price_sek"])
    df["quantity"]  = _to_number(df["quantity"])
    # Drop rows where price or quantity could not be parsed
    df = df.dropna(subset=["price_sek", "quantity"])
    # Calculate total SEK per line item
    df["line_total_sek"] = df["price_sek"] * df["quantity"]

    # ---- Normalize country codes to readable names ----
    # Map currency_country to country name, fallback to "Other" if unknown
    df["country"] = (
        df["currency_country"]
          .astype(str).str.strip().str.upper()
          .map(COUNTRY_MAP_ALPHA)
          .fillna("Other")
    )

    # ---- 1) Revenue by country (sum of line totals) ----
    # Group by country and sum line totals; sort descending for debugging
    rev_by_country = (
        df.groupby("country", dropna=False)["line_total_sek"]
          .sum()
          .sort_values(ascending=False)
    )
    # Convert revenue to kSEK (thousands of SEK), rounded to int
    rev_by_country_ksek = (rev_by_country / 1_000).round(0).astype(int)

    # ---- 2) Average Order Value (AOV) by country ----
    # Collapse line-items to order level: sum line_total per orderId
    # If an order has multiple countries, use the most frequent (mode) country; fallback to first non-null or "Other"
    order_level = (
        df.groupby("orderId", as_index=False)
          .agg(
              order_total_sek=("line_total_sek", "sum"),
              country=("country", lambda x: x.mode().iat[0] if not x.mode().empty else x.dropna().iat[0] if x.dropna().size else "Other"),
          )
    )

    # Calculate mean order value per country, rounded to whole SEK
    aov_by_country = (
        order_level.groupby("country", dropna=False)["order_total_sek"]
                   .mean()
                   .round(0)
                   .astype(int)
    )

    # ---- 3) Number of orders per country ----
    # Useful for debugging and tooltips
    orders_count = (
        order_level.groupby("country", dropna=False)["orderId"]
                   .count()
                   .astype(int)
    )

    # ---- Final payload for API response ----
    # All dicts keyed by country name
    return {
        "revenue_by_country_ksek": rev_by_country_ksek.to_dict(),
        "avg_order_value_by_country_sek": aov_by_country.to_dict(),
        "orders_count_by_country": orders_count.to_dict(),
    }
