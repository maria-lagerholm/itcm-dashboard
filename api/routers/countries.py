# routers/countries.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
import numpy as np
from deps import get_customers_df, get_transactions_df

router = APIRouter(prefix="/api/countries", tags=["countries"])

# Map numeric country IDs (as strings) to country names for customer data
COUNTRY_MAP = {"58": "Denmark", "205": "Sweden", "160": "Norway", "72": "Finland"}

@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customers_df)):
    # ---- sanity ----
    if "invoiceCountryId" not in df.columns or "shopUserId" not in df.columns:
        raise HTTPException(status_code=500,
            detail="customers_clean missing required columns: invoiceCountryId and/or shopUserId")

    # ---- unique customers per country ----
    cust = df[["shopUserId", "invoiceCountryId"]].copy()
    cust["country"] = cust["invoiceCountryId"].astype(str).str.strip().map(COUNTRY_MAP).fillna("Other")

    s = (
        cust.groupby("country")["shopUserId"]
            .nunique()
            .sort_values(ascending=False)
    )

    return {"customers_by_country": s.to_dict()}


@router.get("/segments")
def customer_segments_by_country(
    customers: pd.DataFrame = Depends(get_customers_df),
    tx: pd.DataFrame = Depends(get_transactions_df),
):
    """
    Segments customers by order count:
      - New = 1 order
      - Repeat = 2–3 orders
      - Loyal = ≥4 orders
    Returns counts and percentages for each country (only customers with ≥1 order).
    """

    # ---- sanity checks ----
    cust_required = {"shopUserId", "invoiceCountryId"}
    tx_required = {"shopUserId", "orderId"}
    miss_c = cust_required - set(customers.columns)
    miss_t = tx_required - set(tx.columns)
    if miss_c:
        raise HTTPException(status_code=500, detail=f"customers_clean missing: {', '.join(sorted(miss_c))}")
    if miss_t:
        raise HTTPException(status_code=500, detail=f"transactions_clean missing: {', '.join(sorted(miss_t))}")

    # ---- clean inputs ----
    cust = customers[["shopUserId", "invoiceCountryId"]].dropna(subset=["shopUserId"]).copy()
    # keep one row per user (latest/first doesn’t matter for country here)
    cust = cust.drop_duplicates(subset=["shopUserId"], keep="first")
    cust["country"] = cust["invoiceCountryId"].astype(str).str.strip().map(COUNTRY_MAP).fillna("Other")

    tx = tx[["shopUserId", "orderId"]].dropna(subset=["shopUserId", "orderId"]).copy()

    # ---- per-user order counts ----
    per_user_orders = (
        tx.groupby("shopUserId")["orderId"]
          .nunique()
          .rename("orders")
          .reset_index()
    )

    # ---- join orders onto customers (inner: only users with ≥1 order) ----
    joined = cust.merge(per_user_orders, on="shopUserId", how="inner")

    # ---- segment label ----
    bins = [0, 1, 3, np.inf]                # (0,1] -> New; (1,3] -> Repeat; (3,inf) -> Loyal
    labels = ["New", "Repeat", "Loyal"]
    # pd.cut is right-closed by default; use include_lowest=True for the first bin
    joined["segment"] = pd.cut(joined["orders"], bins=bins, labels=labels, right=True, include_lowest=True)

    # ---- aggregate: counts per country x segment ----
    tbl = (
        joined.groupby(["country", "segment"])
              .size()
              .rename("count")
              .reset_index()
    )

    # ensure all segments exist per country (fill missing with 0)
    countries = tbl["country"].unique()
    idx = pd.MultiIndex.from_product([countries, labels], names=["country", "segment"])
    tbl = tbl.set_index(["country", "segment"]).reindex(idx, fill_value=0).reset_index()

    # totals and percents
    totals = tbl.groupby("country")["count"].sum().rename("total")
    tbl = tbl.merge(totals, on="country", how="left")
    tbl["percent"] = (tbl["count"] / tbl["total"]).where(tbl["total"] > 0, 0) * 100

    # ---- build payload ----
    payload = {}
    for country, g in tbl.groupby("country", sort=False):
        # keep fixed order: New, Repeat, Loyal
        g = g.set_index("segment").reindex(labels).reset_index()
        payload[country] = {
            "total_customers_with_orders": int(g["total"].iloc[0]),
            "segments": {
                seg: {
                    "count": int(cnt),
                    "percent": float(round(pct, 1))
                }
                for seg, cnt, pct in zip(g["segment"], g["count"], g["percent"])
            }
        }

    return {"segments_by_country": payload}
