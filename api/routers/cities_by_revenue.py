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
    # ---- sanity checks ----
    tx_required = {"shopUserId", "price_sek", "quantity"}
    missing_tx = tx_required - set(tx.columns)
    if missing_tx:
        raise HTTPException(
            status_code=500,
            detail=f"transactions_clean missing: {', '.join(sorted(missing_tx))}"
        )

    cust_required = {"shopUserId", "invoiceCity", "invoiceCountryId"}
    missing_cust = cust_required - set(customers.columns)
    if missing_cust:
        raise HTTPException(
            status_code=500,
            detail=f"customers_clean missing: {', '.join(sorted(missing_cust))}"
        )

    # ---- transactions: per-user revenue ----
    tx = tx.copy()
    tx["price_sek"] = pd.to_numeric(tx["price_sek"], errors="coerce")
    q = pd.to_numeric(tx["quantity"], errors="coerce").fillna(1)
    tx["total_revenue_sek"] = tx["price_sek"] * q
    tx = tx.dropna(subset=["shopUserId", "total_revenue_sek"])

    per_user = (
        tx.groupby("shopUserId", dropna=False)["total_revenue_sek"]
          .sum()
          .reset_index()
    )

    # ---- customers: city + country for each user ----
    customers = customers.copy()
    customers = customers.drop_duplicates(subset=["shopUserId"], keep="first")
    customers["invoiceCity"] = customers["invoiceCity"].astype(str).str.strip()
    customers["country_name"] = customers["invoiceCountryId"].map(COUNTRY_MAP).fillna("Other")

    # ---- join and aggregate by city within each country ----
    merged = per_user.merge(
        customers[["shopUserId", "invoiceCity", "country_name"]],
        on="shopUserId", how="left"
    )
    merged = merged[merged["invoiceCity"].notna() & (merged["invoiceCity"].str.len() > 0)]

    city_rev = (
        merged.groupby(["country_name", "invoiceCity"], dropna=False)["total_revenue_sek"]
              .sum()
              .reset_index()
    )

    # kSEK
    city_rev["ksek"] = (city_rev["total_revenue_sek"] / 1000).round(0).astype(int)

    # ---- take top 10 per country ----
    city_rev = city_rev.sort_values(["country_name", "ksek"], ascending=[True, False])
    top10_per_country = (
        city_rev.groupby("country_name", group_keys=True)
                .head(10)
                .reset_index(drop=True)
    )

    # ---- payload: { country: [{city, ksek}], ... } ----
    result = {
        country: [
            {"city": row["invoiceCity"], "ksek": int(row["ksek"])}
            for _, row in grp.iterrows()
        ]
        for country, grp in top10_per_country.groupby("country_name")
    }

    return {"top_cities_by_revenue_ksek": result}
