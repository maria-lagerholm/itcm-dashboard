# routers/top_repurchase_by_country.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import pandas as pd

from deps import get_top_repurchase_df  # columns: country, value, name, brand, repurchasers, rank

router = APIRouter(prefix="/api/top_repurchase_by_country", tags=["top_repurchase_by_country"])

# Load once; minimal approach
DF: pd.DataFrame = get_top_repurchase_df()

@router.get("/")
def get_top_repurchase_by_country(
    country: str = Query(..., description="e.g. 'Denmark'"),
    limit: int = Query(10, ge=1, le=10),
):
    df = DF[DF["country"] == country]
    if df.empty:
        raise HTTPException(status_code=404, detail="No data for given country")

    rows = (
        df.sort_values(["rank", "repurchasers"], ascending=[True, False])
          .loc[:, ["name", "value", "brand", "repurchasers", "rank"]]
          .head(limit)
          .rename(columns={"name": "product", "value": "product_id"})
    )

    return {"data": rows.to_dict(orient="records")}
