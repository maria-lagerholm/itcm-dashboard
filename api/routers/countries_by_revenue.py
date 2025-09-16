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

@router.get("")
def revenue_by_country(df: pd.DataFrame = Depends(get_transactions_df)):
    # sanity checks
    required = {"price_sek", "currency_country", "quantity"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"transactions_clean is missing required columns: {', '.join(sorted(missing))}"
        )

    df = df.copy()
    df["price_sek"] = pd.to_numeric(df["price_sek"], errors="coerce")
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df = df.dropna(subset=["price_sek", "quantity"])

    # Calculate total revenue per row
    df["total_revenue_sek"] = df["price_sek"] * df["quantity"]

    # Normalize country code to uppercase and strip whitespace
    s = (
        df.assign(
            country=df["currency_country"]
                      .astype(str).str.strip().str.upper()
                      .map(COUNTRY_MAP_ALPHA)
                      .fillna("Other")
        )
        .groupby("country", dropna=False)["total_revenue_sek"]
        .sum()
        .sort_values(ascending=False)
    )

    # Convert to KSEK and round to integer (no decimals)
    s_ksek = (s / 1000).round(0).astype(int)

    return {"revenue_by_country_ksek": s_ksek.to_dict()}