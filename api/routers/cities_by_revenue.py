# routers/cities_by_revenue.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from deps import get_transactions_df, get_customers_df
from routers.countries import COUNTRY_MAP  # numeric id -> country name

router = APIRouter(prefix="/api/cities_by_revenue", tags=["cities"])

@router.get("")
def cities_by_revenue(
    tx: pd.DataFrame = Depends(get_transactions_df),
    customers: pd.DataFrame = Depends(get_customers_df),
):
    # ---- Check required columns in transactions ----
    tx_required = {"shopUserId", "price_sek", "quantity"}
    missing_tx = tx_required - set(tx.columns)
    if missing_tx:
        raise HTTPException(
            status_code=500,
            detail=f"transactions_clean missing: {', '.join(sorted(missing_tx))}"
        )

    # ---- Check required columns in customers ----
    cust_required = {"shopUserId", "invoiceCity", "invoiceCountryId"}
    missing_cust = cust_required - set(customers.columns)
    if missing_cust:
        raise HTTPException(
            status_code=500,
            detail=f"customers_clean missing: {', '.join(sorted(missing_cust))}"
        )

    # ---- Calculate per-user revenue from transactions ----
    # Convert price and quantity to numeric, handle missing/invalid values
    tx = tx.copy()
    tx["price_sek"] = pd.to_numeric(tx["price_sek"], errors="coerce")
    q = pd.to_numeric(tx["quantity"], errors="coerce").fillna(1)
    tx["total_revenue_sek"] = tx["price_sek"] * q
    # Drop rows with missing user or revenue (debug: check for NaNs here if result is empty)
    tx = tx.dropna(subset=["shopUserId", "total_revenue_sek"])

    # Group by user to get total revenue per user
    per_user = (
        tx.groupby("shopUserId", dropna=False)["total_revenue_sek"]
          .sum()
          .reset_index()
    )

    # ---- Prepare customer city and country info ----
    customers = customers.copy()
    # Remove duplicate users, keep first occurrence (debug: check for duplicates if city/country mismatches)
    customers = customers.drop_duplicates(subset=["shopUserId"], keep="first")
    # Clean up city names (debug: check for empty/whitespace cities)
    customers["invoiceCity"] = customers["invoiceCity"].astype(str).str.strip()
    # Map country id to country name, fallback to "Other" (debug: check for unmapped country ids)
    customers["country_name"] = customers["invoiceCountryId"].map(COUNTRY_MAP).fillna("Other")

    # ---- Join per-user revenue with city/country info ----
    merged = per_user.merge(
        customers[["shopUserId", "invoiceCity", "country_name"]],
        on="shopUserId", how="left"
    )
    # Filter out users with missing or empty city (debug: check if many users are dropped here)
    merged = merged[merged["invoiceCity"].notna() & (merged["invoiceCity"].str.len() > 0)]

    # ---- Aggregate revenue by (country, city) ----
    city_rev = (
        merged.groupby(["country_name", "invoiceCity"], dropna=False)["total_revenue_sek"]
              .sum()
              .reset_index()
    )

    # Convert revenue to kSEK (thousands of SEK), round to int (debug: check for negative or zero values)
    city_rev["ksek"] = (city_rev["total_revenue_sek"] / 1000).round(0).astype(int)

    # ---- For each country, select top 10 cities by revenue ----
    city_rev = city_rev.sort_values(["country_name", "ksek"], ascending=[True, False])
    top10_per_country = (
        city_rev.groupby("country_name", group_keys=True)
                .head(10)
                .reset_index(drop=True)
    )

    # ---- Build response payload: { country: [{city, ksek}], ... } ----
    # (debug: check if any country has fewer than 10 cities)
    result = {
        country: [
            {"city": row["invoiceCity"], "ksek": int(row["ksek"])}
            for _, row in grp.iterrows()
        ]
        for country, grp in top10_per_country.groupby("country_name")
    }

    return {"top_cities_by_revenue_ksek": result}
