# routers/countries_by_channel.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_countries_by_channel_df

router = APIRouter(prefix="/api/countries_by_channel", tags=["countries"])

@router.get("")
def countries_by_channel(df: pd.DataFrame = Depends(get_countries_by_channel_df)):
    d = df[["country", "channel", "customers_count"]].copy()
    d["country"] = d["country"].astype(str)
    d["channel"] = d["channel"].astype(str)
    d["customers_count"] = d["customers_count"].astype("int64")
    result = {
        country: [
            {"channel": row["channel"], "customers_count": int(row["customers_count"])}
            for _, row in grp.iterrows()
        ]
        for country, grp in d.groupby("country", sort=False)
    }
    return {"countries_by_channel": result}