# routers/customers_age_gender.py
from fastapi import APIRouter, Depends
import pandas as pd
from deps import get_customer_summary_df

router = APIRouter(prefix="/api/customers_age_gender", tags=["customers"])

@router.get("")
def customers_age_gender(customers: pd.DataFrame = Depends(get_customer_summary_df)):
    # Expecting columns: country (str), age (number/nullable), gender (str/nullable)
    df = customers[["country", "age", "gender"]].copy()

    # Normalize fields
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["gender"] = (
        df["gender"]
        .astype("string")
        .str.strip()
        .str.title()  # "female"/"Female" -> "Female"
    )
    df["country"] = (
        df["country"]
        .astype("string")
        .str.strip()
        .fillna("Other")
        .replace("", "Other")
    )

    # Keep valid ages & genders
    df = df.dropna(subset=["age", "gender"])
    df = df[(df["age"] >= 0) & (df["age"] <= 120)]
    df["age"] = df["age"].astype(int)
    df = df[df["gender"].isin(["Female", "Male"])]

    # Aggregate counts per (country, gender, age)
    table = (
        df.groupby(["country", "gender", "age"], dropna=False)
          .size()
          .rename("count")
          .reset_index()
    )

    # Build by_country[country][gender][age] = count
    by_country: dict[str, dict[str, dict[str, int]]] = {}
    for (country, gender), g in table.groupby(["country", "gender"]):
        g = g.sort_values("age")
        by_country.setdefault(country, {})
        by_country[country][gender] = {str(int(a)): int(c) for a, c in zip(g["age"], g["count"])}

    # Sorted list of all ages (as strings)
    ages_sorted = sorted(map(int, df["age"].unique()))

    return {
        "ages_sorted": list(map(str, ages_sorted)),
        "genders": ["Female", "Male"],
        "by_country": by_country,
    }
