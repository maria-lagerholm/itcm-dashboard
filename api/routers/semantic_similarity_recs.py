from fastapi import APIRouter
from deps import get_semantic_similarity_recs_df

router = APIRouter(prefix="/semantic_similarity_recs", tags=["semantic_similarity_recs"])

@router.get("")
def get_all_rows():
    df = get_semantic_similarity_recs_df()
    score_cols = [c for c in df.columns if c.strip().lower().startswith("score")]
    if score_cols:
        df = df.drop(columns=score_cols)
    return df.to_dict(orient="records")
