from fastapi import APIRouter, Query
import pandas as pd
from deps import get_cooccurring_groups_df

router = APIRouter(prefix="/cooccurrence", tags=["cooccurrence"])

@router.get("")
def get_rows(offset: int = Query(0)):
    df = get_cooccurring_groups_df()
    return df.iloc[offset:].to_dict(orient="records")
