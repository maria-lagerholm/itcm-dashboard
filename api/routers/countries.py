# routers/countries.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_customers_df

router = APIRouter(prefix="/api/countries", tags=["countries"])

# Map numeric country IDs (as strings) to country names for customer data
COUNTRY_MAP = {"58": "Denmark", "205": "Sweden", "160": "Norway", "72": "Finland"}

@router.get("")
def customers_by_country(df: pd.DataFrame = Depends(get_customers_df)):
    # ---- Debug: Check for required columns ----
    if "invoiceCountryId" not in df.columns or "shopUserId" not in df.columns:
        raise ValueError("customers_clean missing required columns: invoiceCountryId and/or shopUserId")

    # ---- Map country IDs to names, fallback to 'Other' for unmapped IDs ----
    df = df.copy()
    df["country"] = df["invoiceCountryId"].map(COUNTRY_MAP).fillna("Other")

    # ---- Group by country and count unique customers ----
    s = (
        df.groupby("country")["shopUserId"]
          .nunique()
          .sort_values(ascending=False)
    )

    # ---- Debug: Check for countries with zero customers or unexpected country names ----
    # print("Customer counts by country:", s.to_dict())

    return {"customers_by_country": s.to_dict()}
