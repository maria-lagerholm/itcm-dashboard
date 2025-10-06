# routers/countries_by_channel.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_countries_by_channel_df

router = APIRouter(prefix="/countries_by_channel", tags=["countries"])

@router.get("")
def countries_by_channel(df: pd.DataFrame = Depends(get_countries_by_channel_df)):
    d = df.loc[:, ["country", "channel", "customers_count"]].copy()
    d["country"] = d["country"].astype(str)
    d["channel"] = d["channel"].astype(str)
    d["customers_count"] = pd.to_numeric(d["customers_count"], errors="coerce").fillna(0).astype("int64")

    result = {
        country: grp[["channel", "customers_count"]].to_dict(orient="records")
        for country, grp in d.groupby("country", sort=False)
    }
    return {"countries_by_channel": result}
