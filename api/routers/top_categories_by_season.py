from fastapi import APIRouter, Query
from typing import Optional
from deps import get_top_categories_df

router = APIRouter(prefix="/top_categories_by_season", tags=["top_categories_by_season"])

@router.get("/")
def top_categories_by_season(
    country: Optional[str] = Query(None, description="ex. Denmark"),
    season: Optional[str] = Query(None, alias="season_label", description="ex. Summer 2025"),
):
    df = get_top_categories_df()
    if country is not None:
        df = df[df["country"] == country]
    if season is not None:
        df = df[df["season_label"] == season]

    df = df.sort_values(["country", "season_label", "rank"]).reset_index(drop=True)
    return {"data": df.to_dict(orient="records"), "rows": int(df.shape[0])}
