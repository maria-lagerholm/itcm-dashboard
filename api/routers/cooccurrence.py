from fastapi import APIRouter, Query
from deps import get_cooccurring_groups_df

router = APIRouter(prefix="/cooccurrence", tags=["cooccurrence"])

@router.get("")
def get_rows(offset: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=10_000)):
    df = get_cooccurring_groups_df()
    return df.iloc[offset: offset + limit].to_dict(orient="records")
