# routers/customers_age_gender.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_customer_summary_df

router = APIRouter(prefix="/customers_age_gender", tags=["customers"])

@router.get("")
def customers_age_gender(customers: pd.DataFrame = Depends(get_customer_summary_df)):
    df = customers[["country", "age", "gender"]].copy()
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["gender"] = df["gender"].astype("string").str.strip().str.title()
    df["country"] = df["country"].astype("string").str.strip().fillna("Other").replace("", "Other")
    df = df.dropna(subset=["age", "gender"])
    df = df[(df["age"] >= 0) & (df["age"] <= 120)]
    df["age"] = df["age"].astype(int)
    df = df[df["gender"].isin(["Female", "Male"])]
    table = df.groupby(["country", "gender", "age"], dropna=False).size().rename("count").reset_index()
    by_country = {}
    for (country, gender), g in table.groupby(["country", "gender"]):
        by_country.setdefault(country, {})
        by_country[country][gender] = {str(int(a)): int(c) for a, c in zip(g["age"], g["count"])}
    ages_sorted = sorted(map(int, df["age"].unique()))
    return {
        "ages_sorted": list(map(str, ages_sorted)),
        "genders": ["Female", "Male"],
        "by_country": by_country,
    }
