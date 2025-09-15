# api/deps.py
from pathlib import Path
import pandas as pd

CSV_PATH = Path("/app/data/customers_clean.csv")
_customers_df = None

def get_customers_df() -> pd.DataFrame:
    global _customers_df
    if _customers_df is None:
        _customers_df = pd.read_csv(CSV_PATH, dtype=str, keep_default_na=False)
    return _customers_df
