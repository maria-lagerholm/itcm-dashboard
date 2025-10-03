# routers/top_repurchase_by_country.py
from fastapi import APIRouter, Query
from deps import get_top_repurchase_df

router = APIRouter(prefix="/top_repurchase_by_country", tags=["top_repurchase_by_country"])

DF = get_top_repurchase_df()

@router.get("/")
def top_repurchase_by_country(
    country: str = Query(..., description="Country"),
):
    df = DF[DF["country"] == country]
    rows = (
        df.sort_values(["rank", "repurchasers"], ascending=[True, False])
          .loc[:, ["name", "value", "brand", "repurchasers", "rank"]]
          .rename(columns={"name": "product", "value": "product_id"})
    )
    return {"data": rows.to_dict(orient="records")}
