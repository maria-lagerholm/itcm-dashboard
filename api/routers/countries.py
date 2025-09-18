# routers/countries.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
import numpy as np
from deps import get_customers_df, get_transactions_df

router = APIRouter(prefix="/api/countries", tags=["countries"])

# Map numeric country IDs (as strings) to country names for customer data
COUNTRY_MAP = {"58": "Denmark", "205": "Sweden", "160": "Norway", "72": "Finland"}

# Fixed channel set + order for output
CHANNEL_ORDER = ["Telephone", "Web", "Email"]

def _norm_channel(s: str) -> str:
    """Normalize free-text type → one of Telephone/Web/Email; else 'Other'."""
    if not isinstance(s, str):
        return "Other"
    t = s.strip().lower()
    if t in {"telephone", "phone", "tel", "call"}:
        return "Telephone"
    if t in {"web", "online", "site"}:
        return "Web"
    if t in {"email", "e-mail", "mail"}:
        return "Email"
    return "Other"


@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customers_df)):
    # ---- sanity ----
    if "invoiceCountryId" not in df.columns or "shopUserId" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail="customers_clean missing required columns: invoiceCountryId and/or shopUserId",
        )

    # ---- unique customers per country ----
    cust = df[["shopUserId", "invoiceCountryId"]].copy()
    cust["country"] = (
        cust["invoiceCountryId"].astype(str).str.strip().map(COUNTRY_MAP).fillna("Other")
    )

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
      - New     = 1 order
      - Repeat  = 2–3 orders
      - Loyal   = ≥4 orders

    Counts & percentages for each country (only customers with ≥1 order).
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
    bins = [0, 1, 3, np.inf]                 # (0,1] -> New; (1,3] -> Repeat; (3,inf) -> Loyal
    labels = ["New", "Repeat", "Loyal"]
    joined["segment"] = pd.cut(
        joined["orders"], bins=bins, labels=labels, right=True, include_lowest=True
    )

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

    # ---- payload ----
    payload = {}
    for country, g in tbl.groupby("country", sort=False):
        g = g.set_index("segment").reindex(labels).reset_index()
        payload[country] = {
            "total_customers_with_orders": int(g["total"].iloc[0]),
            "segments": {
                seg: {
                    "count": int(cnt),
                    "percent": float(round(pct, 1)),
                }
                for seg, cnt, pct in zip(g["segment"], g["count"], g["percent"])
            },
        }

    return {"segments_by_country": payload}


@router.get("/channels")
def customer_channels_by_country(
    customers: pd.DataFrame = Depends(get_customers_df),
    tx: pd.DataFrame = Depends(get_transactions_df),
):
    """
    Split customers (by country) across selling channels from transactions column 'type':
      - Telephone, Web, Email

    A customer is counted ONCE per channel if they have ≥1 order in that channel.
    (A user can appear in multiple channels if they used multiple types.)

    Response:
    {
      "channels_by_country": {
        "Sweden": {
          "total_customers_with_orders": 1234,
          "types": {
            "Telephone": {"count": 900, "percent": 73.0},
            "Web":       {"count": 400, "percent": 32.4},
            "Email":     {"count": 150, "percent": 12.2}
          }
        },
        ...
      }
    }
    """
    # ---- sanity checks ----
    cust_required = {"shopUserId", "invoiceCountryId"}
    tx_required = {"shopUserId", "orderId", "type"}
    miss_c = cust_required - set(customers.columns)
    miss_t = tx_required - set(tx.columns)
    if miss_c:
        raise HTTPException(status_code=500, detail=f"customers_clean missing: {', '.join(sorted(miss_c))}")
    if miss_t:
        raise HTTPException(status_code=500, detail=f"transactions_clean missing: {', '.join(sorted(miss_t))}")

    # ---- customers: one row per user + country ----
    cust = customers[["shopUserId", "invoiceCountryId"]].dropna(subset=["shopUserId"]).copy()
    cust = cust.drop_duplicates(subset=["shopUserId"], keep="first")
    cust["country"] = cust["invoiceCountryId"].astype(str).str.strip().map(COUNTRY_MAP).fillna("Other")

    # ---- transactions: normalize type to {Telephone, Web, Email}; drop others ----
    tx_use = tx[["shopUserId", "orderId", "type"]].dropna(subset=["shopUserId", "orderId", "type"]).copy()
    tx_use["channel"] = tx_use["type"].apply(_norm_channel)
    tx_use = tx_use[tx_use["channel"].isin(CHANNEL_ORDER)]
    if tx_use.empty:
        return {"channels_by_country": {}}

    # Deduplicate to (user, channel) presence once
    user_channel = tx_use.drop_duplicates(subset=["shopUserId", "channel"])[["shopUserId", "channel"]]

    # Attach country
    jt = user_channel.merge(cust[["shopUserId", "country"]], on="shopUserId", how="inner")
    if jt.empty:
        return {"channels_by_country": {}}

    # Counts per country x channel (unique customers)
    counts = (
        jt.groupby(["country", "channel"])["shopUserId"]
          .nunique()
          .rename("count")
          .reset_index()
    )

    # Ensure stable grid of countries × CHANNEL_ORDER
    countries = sorted(counts["country"].unique())
    idx = pd.MultiIndex.from_product([countries, CHANNEL_ORDER], names=["country", "channel"])
    counts = counts.set_index(["country", "channel"]).reindex(idx, fill_value=0).reset_index()

    # Total customers with ≥1 order (in ANY channel) per country
    totals = (
        jt.groupby("country")["shopUserId"]
          .nunique()
          .rename("total_customers_with_orders")
          .reset_index()
    )

    # Merge totals back
    out = counts.merge(totals, on="country", how="left")

    # Percent per channel (of the country total)
    out["percent"] = (
        (out["count"] / out["total_customers_with_orders"].where(out["total_customers_with_orders"] > 0, np.nan)) * 100
    ).fillna(0.0)

    # ---- build payload in fixed channel order ----
    payload = {}
    for country, g in out.groupby("country", sort=False):
        g = g.set_index("channel").reindex(CHANNEL_ORDER).reset_index()
        total = int(g["total_customers_with_orders"].iloc[0]) if not g.empty else 0
        payload[country] = {
            "total_customers_with_orders": total,
            "types": {
                ch: {
                    "count": int(cnt),
                    "percent": float(round(pct, 1)),
                }
                for ch, cnt, pct in zip(g["channel"], g["count"], g["percent"])
            },
        }

    return {"channels_by_country": payload}
