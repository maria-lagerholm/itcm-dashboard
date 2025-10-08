from fastapi import APIRouter
from deps import get_basket_cf_df

router = APIRouter(prefix="/basket_cf", tags=["basket_cf"])

@router.get("")
def get_all_rows():
    df = get_basket_cf_df()
    return df.to_dict(orient="records")
