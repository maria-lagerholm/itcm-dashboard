# routers/search.py
from fastapi import APIRouter, Query
from typing import Optional
import os, requests

router = APIRouter(prefix="/search", tags=["search"])

VESPA = os.getenv("VESPA_ENDPOINT", "http://vespa:8080")
_session = requests.Session()

def qstr(s: str) -> str:
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

def build_yql(brand: Optional[str], category: Optional[str],
              color: Optional[str], size: Optional[str],
              audience: Optional[str]) -> str:
    parts = ["select * from doc where userQuery()"]
    if brand:    parts.append(f"and brand contains {qstr(brand)}")
    if audience: parts.append(f"and audience contains {qstr(audience)}")
    if category: parts.append(f"and categories contains {qstr(category)}")
    if color:    parts.append(f"and color contains {qstr(color)}")
    if size:     parts.append(f"and size contains {qstr(size)}")
    return " ".join(parts)

@router.get("")
def search(
    q: str = Query("", description="free-text query"),
    brand: Optional[str] = None,
    category: Optional[str] = None,
    color: Optional[str] = None,
    size: Optional[str] = None,
    audience: Optional[str] = None,
    hits: int = Query(10, ge=1, le=100),
):
    yql = build_yql(brand, category, color, size, audience)
    params = {"yql": yql, "query": q, "hits": str(hits), "ranking": "fusion", "format": "json"}
    r = _session.get(f"{VESPA}/search/", params=params, timeout=8)
    return r.json()