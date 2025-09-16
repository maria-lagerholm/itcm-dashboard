# Dependency functions for loading and caching CSV dataframes.
# If you encounter issues with missing or stale data, check the CSV paths and whether the global cache is being reset.

from pathlib import Path
import pandas as pd

# Paths to the CSV data files. If files are missing or paths are incorrect, API endpoints will fail.
CUSTOMERS_CSV_PATH = Path("/app/data/customers_clean.csv")
TRANSACTIONS_CSV_PATH = Path("/app/data/transactions_clean.csv")
ARTICLES_CSV_PATH = Path("/app/data/articles_clean.csv")

# Global cache for loaded DataFrames. If you need to reload data (e.g., after updating CSVs), restart the server.
_customers_df = None
_transactions_df = None
_articles_df = None

def get_customers_df() -> pd.DataFrame:
    """
    Returns the cached customers DataFrame, loading from CSV if not already loaded.
    Debug: If you get unexpected or missing customer data, check CUSTOMERS_CSV_PATH and ensure the file is up to date.
    """
    global _customers_df
    if _customers_df is None:
        _customers_df = pd.read_csv(CUSTOMERS_CSV_PATH, dtype=str, keep_default_na=False)
    return _customers_df

def get_transactions_df() -> pd.DataFrame:
    """
    Returns the cached transactions DataFrame, loading from CSV if not already loaded.
    Debug: If transaction data seems outdated or missing, verify TRANSACTIONS_CSV_PATH and the CSV contents.
    """
    global _transactions_df
    if _transactions_df is None:
        _transactions_df = pd.read_csv(TRANSACTIONS_CSV_PATH, dtype=str, keep_default_na=False)
    return _transactions_df

def get_articles_df() -> pd.DataFrame:
    """
    Returns the cached articles DataFrame, loading from CSV if not already loaded.
    Debug: If article data is missing or incorrect, check ARTICLES_CSV_PATH and the CSV file.
    """
    global _articles_df
    if _articles_df is None:
        _articles_df = pd.read_csv(ARTICLES_CSV_PATH, dtype=str, keep_default_na=False)
    return _articles_df
