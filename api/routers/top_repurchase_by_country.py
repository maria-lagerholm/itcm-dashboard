# routers/top_repurchase_by_country.py
from fastapi import APIRouter, Query
from deps import get_top_repurchase_df

router = APIRouter(prefix="/top_repurchase_by_country", tags=["top_repurchase_by_country"])

@router.get("/")
def top_repurchase_by_country(
    country: str = Query(..., description="Country"),
):
    df = get_top_repurchase_df()
    df = df[df["country"] == country]
    rows = (
        df.sort_values(["rank", "repurchasers"], ascending=[True, False])
          .loc[:, ["name", "value", "brand", "repurchasers", "rank"]]
          .rename(columns={"name": "product", "value": "product_id"})
    )
    return {"data": rows.to_dict(orient="records")}