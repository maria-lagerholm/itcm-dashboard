from fastapi import APIRouter
from deps import get_return_buckets_df

router = APIRouter(prefix="/returning", tags=["returning"])

@router.get("/")
def get_returning():
    df = get_return_buckets_df()
    return {
        "data": df.to_dict(orient="records"),
        "meta": {
            "total_customers": int(df["customers"].sum()),
            "buckets": int(df.shape[0]),
        },
    }
