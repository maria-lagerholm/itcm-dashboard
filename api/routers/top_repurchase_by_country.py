# routers/top_repurchase_by_country.py
from fastapi import APIRouter, HTTPException, Query
from deps import get_top_repurchase_df

router = APIRouter(prefix="/top_repurchase_by_country", tags=["top_repurchase_by_country"])

DF = get_top_repurchase_df()

@router.get("/")
def top_repurchase_by_country(
    country: str = Query(..., description="Country"),
    limit: int = Query(10, ge=1, le=10),
):
    df = DF[DF["country"] == country]
    if df.empty:
        raise HTTPException(404, "No data for country")
    rows = (
        df.sort_values(["rank", "repurchasers"], ascending=[True, False])
          .loc[:, ["name", "value", "brand", "repurchasers", "rank"]]
          .head(limit)
          .rename(columns={"name": "product", "value": "product_id"})
    )
    return {"data": rows.to_dict(orient="records")}
