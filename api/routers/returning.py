from fastapi import APIRouter
from deps import get_return_buckets_df

router = APIRouter(prefix="/returning", tags=["returning"])

DF = get_return_buckets_df()

@router.get("/")
def get_returning():
    return {
        "data": DF.to_dict(orient="records"),
        "meta": {
            "total_customers": int(DF["customers"].sum()),
            "buckets": int(DF.shape[0]),
        },
    }
