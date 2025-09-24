# routers/countries.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
import numpy as np
from deps import get_customers_df, get_transactions_df

router = APIRouter(prefix="/api/countries", tags=["countries"])

def _country_col(df: pd.DataFrame) -> str:
    for c in ("country", "Country"):
        if c in df.columns:
            return c
    return ""

@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customers_df)):
    # required columns
    if "shopUserId" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail="customers_clean missing required column: shopUserId",
        )
    ccol = _country_col(df)
    if not ccol:
        raise HTTPException(
            status_code=500,
            detail='customers_clean missing required column: "country" (or "Country")',
        )

    cust = df[["shopUserId", ccol]].copy()
    cust[ccol] = cust[ccol].astype(str).str.strip().replace({"": np.nan})
    cust[ccol] = cust[ccol].fillna("Other")

    s = (
        cust.groupby(ccol)["shopUserId"]
            .nunique()
            .sort_values(ascending=False)
    )
    return {"customers_by_country": s.to_dict()}

@router.get("/segments")
def customer_segments_by_country(
    customers: pd.DataFrame = Depends(get_customers_df),
    tx: pd.DataFrame = Depends(get_transactions_df),
):
    # required columns
    if "shopUserId" not in customers.columns:
        raise HTTPException(status_code=500, detail="customers_clean missing: shopUserId")
    if not {"shopUserId", "orderId"}.issubset(tx.columns):
        raise HTTPException(status_code=500, detail="transactions_clean missing: shopUserId and/or orderId")

    ccol = _country_col(customers)
    if not ccol:
        raise HTTPException(
            status_code=500,
            detail='customers_clean missing required column: "country" (or "Country")',
        )

    # clean customers
    cust = customers[["shopUserId", ccol]].dropna(subset=["shopUserId"]).copy()
    cust = cust.drop_duplicates(subset=["shopUserId"], keep="first")
    cust[ccol] = cust[ccol].astype(str).str.strip().replace({"": np.nan}).fillna("Other")

    # clean transactions
    tx = tx[["shopUserId", "orderId"]].dropna(subset=["shopUserId", "orderId"]).copy()

    # per-user order counts
    per_user_orders = (
        tx.groupby("shopUserId")["orderId"]
          .nunique()
          .rename("orders")
          .reset_index()
    )

    # join only customers with ≥1 order
    joined = cust.merge(per_user_orders, on="shopUserId", how="inner")

    # segment labels
    bins = [0, 1, 3, np.inf]            # (0,1] New; (1,3] Repeat; (3,inf) Loyal
    labels = ["New", "Repeat", "Loyal"]
    joined["segment"] = pd.cut(joined["orders"], bins=bins, labels=labels, right=True, include_lowest=True)

    # counts per country x segment
    tbl = (
        joined.groupby([ccol, "segment"])
              .size()
              .rename("count")
              .reset_index()
    )

    # ensure all segments present per country
    countries = tbl[ccol].unique()
    idx = pd.MultiIndex.from_product([countries, labels], names=[ccol, "segment"])
    tbl = tbl.set_index([ccol, "segment"]).reindex(idx, fill_value=0).reset_index()

    # totals and percents
    totals = tbl.groupby(ccol)["count"].sum().rename("total")
    tbl = tbl.merge(totals, on=ccol, how="left")
    tbl["percent"] = (tbl["count"] / tbl["total"]).where(tbl["total"] > 0, 0) * 100

    # payload (keeps your existing shape)
    payload = {}
    for country_name, g in tbl.groupby(ccol, sort=False):
        g = g.set_index("segment").reindex(labels).reset_index()
        payload[country_name] = {
            "total_customers_with_orders": int(g["total"].iloc[0]),
            "segments": {
                seg: {"count": int(cnt), "percent": float(round(pct, 1))}
                for seg, cnt, pct in zip(g["segment"], g["count"], g["percent"])
            },
        }

    return {"segments_by_country": payload}
