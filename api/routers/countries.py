# routers/countries.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
import numpy as np
from deps import get_customer_summary_df

router = APIRouter(prefix="/countries", tags=["countries"])

def _country_col(df: pd.DataFrame) -> str:
    for c in ("country", "Country"):
        if c in df.columns:
            return c
    return ""

def _clean_country_series(s: pd.Series) -> pd.Series:
    s = s.astype(str).str.strip().replace({"": np.nan})
    return s.fillna("Other")

def _segment_from_orders(n):
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
    ccol = _country_col(df)
    if not ccol or "customer_id" not in df.columns:
        raise HTTPException(500, "Missing required columns")
    cust = df[[ccol, "customer_id"]].copy()
    cust[ccol] = _clean_country_series(cust[ccol])
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
    ccol = _country_col(df)
    if not ccol or "customer_id" not in df.columns or ("total_orders" not in df.columns and "status" not in df.columns):
        raise HTTPException(500, "Missing required columns")
    cols = [c for c in (ccol, "customer_id", "total_orders", "status") if c in df.columns]
    base = (
        df[cols]
        .dropna(subset=["customer_id"])
        .drop_duplicates(subset=["customer_id"], keep="first")
        .copy()
    )
    base[ccol] = _clean_country_series(base[ccol])
    if "total_orders" in base.columns:
        base["total_orders"] = pd.to_numeric(base["total_orders"], errors="coerce")
    else:
        base["total_orders"] = np.nan
    seg_from_orders = base["total_orders"].map(_segment_from_orders)
    seg_from_status = base["status"].map(_segment_from_status) if "status" in base.columns else pd.Series(np.nan, index=base.index)
    base["segment"] = seg_from_orders.where(seg_from_orders.notna(), seg_from_status)
    base = base[base["total_orders"].fillna(0) > 0].copy()
    base["segment"] = base["segment"].where(base["segment"].notna(), base["total_orders"].map(_segment_from_orders))
    labels = ["New", "Repeat", "Loyal"]
    tbl = (
        base.groupby([ccol, "segment"])
            .size()
            .rename("count")
            .reset_index()
    )
    countries = tbl[ccol].unique()
    idx = pd.MultiIndex.from_product([countries, labels], names=[ccol, "segment"])
    tbl = tbl.set_index([ccol, "segment"]).reindex(idx, fill_value=0).reset_index()
    totals = tbl.groupby(ccol)["count"].sum().rename("total")
    tbl = tbl.merge(totals, on=ccol, how="left")
    tbl["percent"] = (tbl["count"] / tbl["total"]).where(tbl["total"] > 0, 0) * 100
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