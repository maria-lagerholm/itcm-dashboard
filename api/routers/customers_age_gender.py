# routers/customers_age_gender.py
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from deps import get_customers_df

# Reuse your numeric -> country name map (e.g., {752: "Sweden", 208: "Denmark", ...})
try:
    from .countries import COUNTRY_MAP
except ImportError:
    from routers.countries import COUNTRY_MAP  # fallback if relative import fails

router = APIRouter(prefix="/api/customers_age_gender", tags=["customers"])

@router.get("")
def customers_age_gender(customers: pd.DataFrame = Depends(get_customers_df)):
    required = {"Age", "invoiceCountryId", "Gender"}
    missing = required - set(customers.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"customers_clean missing: {', '.join(sorted(missing))}"
        )

    # Keep only what we need; drop NA in Age/Gender
    df = customers[["invoiceCountryId", "Age", "Gender"]].copy()
    df["Age"] = pd.to_numeric(df["Age"], errors="coerce")
    df = df.dropna(subset=["Age", "Gender"])

    # Clamp to a sensible age range and cast to whole years
    df = df[(df["Age"] >= 0) & (df["Age"] <= 120)]
    df["Age"] = df["Age"].astype(int)

    # Only Female/Male (you said data is exactly these two)
    df = df[df["Gender"].isin(["Female", "Male"])]

    # Map country id -> readable country
    df["country"] = df["invoiceCountryId"].map(COUNTRY_MAP).fillna("Other")

    # Count rows per (country, Gender, Age)
    table = (
        df.groupby(["country", "Gender", "Age"])
          .size()
          .rename("count")
          .reset_index()
    )

    # Build payload: by_country[country][gender][age] = count
    by_country: dict[str, dict[str, dict[str, int]]] = {}
    for (country, gender), g in table.groupby(["country", "Gender"]):
        g = g.sort_values("Age")
        by_country.setdefault(country, {})
        by_country[country][gender] = {str(int(a)): int(c) for a, c in zip(g["Age"], g["count"])}

    # Sorted list of all ages (for x-axis on the frontend)
    ages_sorted = sorted(map(int, df["Age"].unique()))
    return {
        "ages_sorted": list(map(str, ages_sorted)),
        "genders": ["Female", "Male"],
        "by_country": by_country,
    }
