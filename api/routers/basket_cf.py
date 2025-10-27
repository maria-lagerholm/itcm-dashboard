from fastapi import APIRouter
from deps import get_basket_cf_df

router = APIRouter(prefix="/basket_cf", tags=["basket_cf"])

@router.get("")
def get_all_rows():
    df = get_basket_cf_df()
    # keep only Product ID and Top N columns, ordered Top 1..Top 10
    top_cols = [c for c in df.columns if c.startswith("Top ")]
    top_cols = sorted(top_cols, key=lambda c: int(c.split()[1]))
    keep_cols = ["Product ID"] + top_cols
    return df[keep_cols].to_dict(orient="records")
