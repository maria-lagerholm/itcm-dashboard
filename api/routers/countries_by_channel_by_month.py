# routers/countries_by_channel_by_month.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_countries_by_channel_by_month_df

router = APIRouter(prefix="/countries_by_channel_by_month", tags=["countries"])

@router.get("")
def countries_by_channel_by_month(
    df: pd.DataFrame = Depends(get_countries_by_channel_by_month_df),
):
    d = df.loc[:, ["country", "channel", "year_month", "customers_count"]].copy()
    d["country"] = d["country"].astype(str)
    d["channel"] = d["channel"].astype(str)
    d["year_month"] = d["year_month"].astype(str)
    d["customers_count"] = pd.to_numeric(d["customers_count"], errors="coerce").fillna(0).astype("int64")

    d = d.sort_values(["country", "channel", "year_month"], kind="stable")

    result: dict[str, dict[str, list[dict]]] = {}
    for (country, channel), grp in d.groupby(["country", "channel"], sort=False):
        result.setdefault(country, {})
        result[country][channel] = grp.loc[:, ["year_month", "customers_count"]].to_dict(orient="records")

    return {"countries_by_channel_by_month": result}
