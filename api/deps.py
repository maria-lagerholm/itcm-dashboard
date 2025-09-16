# api/deps.py
from pathlib import Path
import pandas as pd

CUSTOMERS_CSV_PATH = Path("/app/data/customers_clean.csv")
TRANSACTIONS_CSV_PATH = Path("/app/data/transactions_clean.csv")
ARTICLES_CSV_PATH = Path("/app/data/articles_clean.csv")

_customers_df = None
_transactions_df = None
_articles_df = None

def get_customers_df() -> pd.DataFrame:
    global _customers_df
    if _customers_df is None:
        _customers_df = pd.read_csv(CUSTOMERS_CSV_PATH, dtype=str, keep_default_na=False)
    return _customers_df

def get_transactions_df() -> pd.DataFrame:
    global _transactions_df
    if _transactions_df is None:
        _transactions_df = pd.read_csv(TRANSACTIONS_CSV_PATH, dtype=str, keep_default_na=False)
    return _transactions_df

def get_articles_df() -> pd.DataFrame:
    global _articles_df
    if _articles_df is None:
        _articles_df = pd.read_csv(ARTICLES_CSV_PATH, dtype=str, keep_default_na=False)
    return _articles_df
