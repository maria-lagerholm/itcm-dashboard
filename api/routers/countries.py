# api/routers/countries.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_customers_df

router = APIRouter(prefix="/api/countries", tags=["countries"])

COUNTRY_MAP = {"58": "Denmark", "205": "Sweden", "160": "Norway", "72": "Finland"}

@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customers_df)):
    s = (
        df.assign(country=df["invoiceCountryId"].map(COUNTRY_MAP).fillna("Other"))
          .groupby("country")["shopUserId"].nunique()
          .sort_values(ascending=False)
    )
    return {"customers_by_country": s.to_dict()}
