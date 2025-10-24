from fastapi import APIRouter
from deps import get_top_same_brand_df

router = APIRouter(prefix="/top_same_brand", tags=["top_same_brand"])

@router.get("")
def get_all_rows():
    df = get_top_same_brand_df()
    return df.to_dict(orient="records")
