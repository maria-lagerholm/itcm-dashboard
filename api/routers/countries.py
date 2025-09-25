# routers/countries.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
import numpy as np
from deps import get_customer_summary_df  # new dependency

router = APIRouter(prefix="/api/countries", tags=["countries"])

def _country_col(df: pd.DataFrame) -> str:
    for c in ("country", "Country"):
        if c in df.columns:
            return c
    return ""

def _clean_country_series(s: pd.Series) -> pd.Series:
    s = s.astype(str).str.strip().replace({"": np.nan})
    return s.fillna("Other")

def _segment_from_orders(n):
    # New: 1, Repeat: 2-3, Loyal: >=4
    try:
        n = float(n)
    except Exception:
        return np.nan
    if n <= 0 or np.isnan(n):
        return np.nan
    if n == 1:
        return "New"
    if 1 < n <= 3:
        return "Repeat"
    return "Loyal"

def _segment_from_status(s):
    if not isinstance(s, str):
        return np.nan
    s = s.strip().lower()
    if s == "new":
        return "New"
    if s in ("returning", "repeat"):
        return "Repeat"
    if s == "loyal":
        return "Loyal"
    return np.nan

@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customer_summary_df)):
    # required columns
    ccol = _country_col(df)
    if not ccol:
        raise HTTPException(
            status_code=500,
            detail='customer_summary missing required column: "country" (or "Country")',
        )
    if "customer_id" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail="customer_summary missing required column: customer_id",
        )

    cust = df[[ccol, "customer_id"]].copy()
    cust[ccol] = _clean_country_series(cust[ccol])

    # unique customers per country (match previous behavior)
    s = (
        cust.dropna(subset=["customer_id"])
            .drop_duplicates(subset=["customer_id"])
            .groupby(ccol)["customer_id"]
            .nunique()
            .sort_values(ascending=False)
    )
    return {"customers_by_country": s.to_dict()}

@router.get("/segments")
def customer_segments_by_country(df: pd.DataFrame = Depends(get_customer_summary_df)):
    # required columns
    ccol = _country_col(df)
    if not ccol:
        raise HTTPException(
            status_code=500,
            detail='customer_summary missing required column: "country" (or "Country")',
        )
    for col in ("customer_id", "total_orders"):
        if col not in df.columns:
            # We can still compute segments from status if present; enforce at least one is available.
            if col == "total_orders" and "status" in df.columns:
                continue
            raise HTTPException(
                status_code=500,
                detail=f"customer_summary missing required column: {col}",
            )

    # base cleaning — one row per customer
    cols = [c for c in (ccol, "customer_id", "total_orders", "status") if c in df.columns]
    base = (
        df[cols]
        .dropna(subset=["customer_id"])
        .drop_duplicates(subset=["customer_id"], keep="first")
        .copy()
    )
    base[ccol] = _clean_country_series(base[ccol])

    # ensure numeric orders if present
    if "total_orders" in base.columns:
        base["total_orders"] = pd.to_numeric(base["total_orders"], errors="coerce")
    else:
        base["total_orders"] = np.nan

    # derive segment: prefer total_orders; fallback to status
    seg_from_orders = base["total_orders"].map(_segment_from_orders)
    if "status" in base.columns:
        seg_from_status = base["status"].map(_segment_from_status)
    else:
        seg_from_status = pd.Series(np.nan, index=base.index)

    base["segment"] = seg_from_orders.where(seg_from_orders.notna(), seg_from_status)

    # keep only customers with ≥1 order (to match previous join-on-orders>0 behavior)
    has_order = base["total_orders"].fillna(0) > 0
    base = base[has_order].copy()

    # if some segments are still NaN (e.g., unknown status), classify conservatively via orders
    base["segment"] = base["segment"].where(base["segment"].notna(), base["total_orders"].map(_segment_from_orders))

    # counts per country × segment
    labels = ["New", "Repeat", "Loyal"]
    tbl = (
        base.groupby([ccol, "segment"])
            .size()
            .rename("count")
            .reset_index()
    )

    # ensure all segments exist per country
    countries = tbl[ccol].unique()
    idx = pd.MultiIndex.from_product([countries, labels], names=[ccol, "segment"])
    tbl = tbl.set_index([ccol, "segment"]).reindex(idx, fill_value=0).reset_index()

    # totals and percents
    totals = tbl.groupby(ccol)["count"].sum().rename("total")
    tbl = tbl.merge(totals, on=ccol, how="left")
    tbl["percent"] = (tbl["count"] / tbl["total"]).where(tbl["total"] > 0, 0) * 100

    # build payload identical to previous shape
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
