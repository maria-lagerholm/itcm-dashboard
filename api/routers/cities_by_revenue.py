from typing import Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from deps import get_city_summary_df

router = APIRouter(prefix="/cities_by_revenue", tags=["cities"])

class CityOut(BaseModel):
    city: str
    ksek: int
    avg_order_value_sek: Optional[int]

class Resp(BaseModel):
    top_cities_by_revenue_ksek: Dict[str, List[CityOut]]

@router.get("", response_model=Resp)
def cities_by_revenue(df: pd.DataFrame = Depends(get_city_summary_df)):
    df = df.loc[
        ~df["city"].str.contains("unknown", case=False, na=False),
        ["country", "city", "total_revenue_sek", "total_orders"],
    ]
    agg = (
        df.groupby(["country", "city"], as_index=False)
          .sum(numeric_only=True)
    )

    agg["ksek"] = (agg["total_revenue_sek"] / 1000).round().astype("int64")

    agg["avg_order_value_sek"] = (
        agg["total_revenue_sek"]
        .div(agg["total_orders"].replace(0, pd.NA))
        .round()
        .astype("Int64")
    )

    top10 = (
        agg.groupby("country", group_keys=False)
           .apply(lambda g: g.nlargest(10, "ksek"))
           .reset_index(drop=True)
    )
    result: Dict[str, List[dict]] = {}
    for country, g in top10.groupby("country"):
        out = g[["city", "ksek", "avg_order_value_sek"]].copy()
        out["avg_order_value_sek"] = (
            out["avg_order_value_sek"]
            .astype("object")
            .where(out["avg_order_value_sek"].notna(), None)
        )
        result[country] = out.to_dict(orient="records")

    return {"top_cities_by_revenue_ksek": result}
