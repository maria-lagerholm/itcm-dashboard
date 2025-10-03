# routers/top_products_by_season.py
from fastapi import APIRouter, Query
from typing import Optional
import pandas as pd

from deps import get_top_groups_df

router = APIRouter(prefix="/top_products_by_season", tags=["top_products_by_season"])

DF: pd.DataFrame = get_top_groups_df()

@router.get("/")
def get_top_products_by_season(
    country: str = Query(..., description="e.g. 'Denmark'"),
    season_label: Optional[str] = Query(
        None, description="e.g. 'Summer 2025'"
    )
):
    df = DF[DF["country"] == country]

    if season_label is None:
        labels = df["season_label"].drop_duplicates().tolist()
        return {"data": [{"season_label": sl} for sl in labels]}

    rows = (
        df[df["season_label"] == season_label]
        .loc[:, ["name", "brand", "value", "count", "rank"]]
        .rename(columns={"name": "product", "value": "product_id", "brand": "brand"})
    )

    return {"data": rows.to_dict(orient="records")}
