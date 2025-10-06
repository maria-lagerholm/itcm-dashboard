from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_customer_summary_df

router = APIRouter(prefix="/customers_age_gender", tags=["customers"])

@router.get("")
def customers_age_gender(customers: pd.DataFrame = Depends(get_customer_summary_df)):
    df = customers[["country", "age", "gender"]].copy()
    df = df.dropna(subset=["country", "age", "gender"])
    df = df[df["gender"].isin(["Female", "Male"])]
    df = df[df["age"].between(0, 120)]
    table = df.groupby(["country", "gender", "age"]).size().rename("count").reset_index()

    by_country = {
        country: {
            gender: {str(int(a)): int(c) for a, c in zip(g["age"], g["count"])}
            for gender, g in grp.groupby("gender", sort=False)
        }
        for country, grp in table.groupby("country", sort=False)
    }

    return {
        "ages_sorted": [str(int(a)) for a in sorted(df["age"].unique())],
        "genders": ["Female", "Male"],
        "by_country": by_country,
    }

