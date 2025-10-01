# routers/top_products_by_season.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import pandas as pd

from deps import get_top_groups_df  # columns: country, season_label, value, name, count, rank

router = APIRouter(prefix="/top_products_by_season", tags=["top_products_by_season"])

# load once; keep it minimal
DF: pd.DataFrame = get_top_groups_df()

@router.get("/")
def get_top_products_by_season(
    country: str = Query(..., description="e.g. 'Denmark'"),
    season_label: Optional[str] = Query(
        None, description="e.g. 'Summer 2025'. Omit to list available season labels for the country."
    ),
    limit: int = Query(10, ge=1, le=10),  # cap at 10 (your parquet has 10 groupids per season)
):
    df = DF[DF["country"] == country]

    if season_label is None:
        labels = df["season_label"].drop_duplicates().tolist()
        return {"data": [{"season_label": sl} for sl in labels]}

    rows = (
        df[df["season_label"] == season_label]
        .sort_values(["rank", "count"], ascending=[True, False])
        .loc[:, ["name", "brand", "value", "count", "rank"]]
        .head(limit)
        .rename(columns={"name": "product", "value": "product_id", "brand": "brand"})
    )

    if rows.empty:
        raise HTTPException(status_code=404, detail="No data for given country/season_label")

    return {"data": rows.to_dict(orient="records")}
