from fastapi import APIRouter
from deps import get_semantic_similarity_recs_df

router = APIRouter(prefix="/semantic_similarity_recs", tags=["semantic_similarity_recs"])

@router.get("")
def get_all_rows():
    df = get_semantic_similarity_recs_df()
    return df.to_dict(orient="records")
