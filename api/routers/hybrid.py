# routers/hybrid.py
from fastapi import APIRouter
from deps import get_hybrid_df

router = APIRouter(prefix="/hybrid", tags=["hybrid"])

@router.get("")
def get_all_rows(include_scores: bool = False):
    df = get_hybrid_df()
    if not include_scores:
        df = df.loc[:, ~df.columns.str.contains(r'(?i)^score\b')]
    return df.to_dict(orient="records")
