from fastapi import APIRouter
from deps import get_complements_df

router = APIRouter(prefix="/complements", tags=["complements"])

@router.get("")
def get_all_rows():
    df = get_complements_df()
    return df.to_dict(orient="records")
