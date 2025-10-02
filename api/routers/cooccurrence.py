# routers/cooccurrence.py
from __future__ import annotations

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from typing import Optional
import pandas as pd

from deps import get_cooccurring_groups_df

router = APIRouter(prefix="/cooccurrence", tags=["cooccurrence"])

DF: pd.DataFrame = get_cooccurring_groups_df()

@router.get("", response_model=None)
def get_rows(
    offset: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1),
) -> JSONResponse:
    """Single output: just the rows (columns preserved), with optional pagination."""
    end = None if limit is None else offset + limit
    sliced = DF.iloc[offset:end]
    return JSONResponse(content=sliced.to_dict(orient="records"))
