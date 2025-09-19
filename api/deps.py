# Dependency functions for loading and caching CSV dataframes.
# If you encounter issues with missing or stale data, check the CSV paths and whether the global cache is being reset.

from pathlib import Path
import pandas as pd

# Paths to the CSV data files. If files are missing or paths are incorrect, API endpoints will fail.
CUSTOMERS_CSV_PATH = Path("/app/data/customers_clean.csv")
TRANSACTIONS_CSV_PATH = Path("/app/data/transactions_clean.csv")
ARTICLES_CSV_PATH = Path("/app/data/articles_clean.csv")
ORDERS_CSV_PATH = Path("/app/data/orders.csv")
ORDER_ITEMS_CSV_PATH = Path("/app/data/order_items.csv")
CUSTOMER_SUMMARY_CSV_PATH = Path("/app/data/customer_summary.csv")
COUNTRY_SUMMARY_CSV_PATH = Path("/app/data/country_summary.csv")
CITY_SUMMARY_CSV_PATH = Path("/app/data/city_summary.csv")

# Global cache for loaded DataFrames. If you need to reload data (e.g., after updating CSVs), restart the server.
_customers_df = None
_transactions_df = None
_articles_df = None
_orders_df = None
_order_items_df = None
_customer_summary_df = None
_country_summary_df = None
_city_summary_df = None

def get_customers_df() -> pd.DataFrame:
    """
    Returns the cached customers DataFrame, loading from CSV if not already loaded.
    """
    global _customers_df
    if _customers_df is None:
        _customers_df = pd.read_csv(CUSTOMERS_CSV_PATH, dtype=str, keep_default_na=False)
    return _customers_df

def get_transactions_df() -> pd.DataFrame:
    """
    Returns the cached transactions DataFrame, loading from CSV if not already loaded.
    """
    global _transactions_df
    if _transactions_df is None:
        _transactions_df = pd.read_csv(TRANSACTIONS_CSV_PATH, dtype=str, keep_default_na=False)
    return _transactions_df

def get_articles_df() -> pd.DataFrame:
    """
    Returns the cached articles DataFrame, loading from CSV if not already loaded.
    """
    global _articles_df
    if _articles_df is None:
        _articles_df = pd.read_csv(ARTICLES_CSV_PATH, dtype=str, keep_default_na=False)
    return _articles_df

def get_orders_df() -> pd.DataFrame:
    """
    Returns the cached orders DataFrame, loading from CSV if not already loaded.
    """
    global _orders_df
    if _orders_df is None:
        _orders_df = pd.read_csv(ORDERS_CSV_PATH, dtype=str, keep_default_na=False)
    return _orders_df

def get_order_items_df() -> pd.DataFrame:
    """
    Returns the cached order items DataFrame, loading from CSV if not already loaded.
    """
    global _order_items_df
    if _order_items_df is None:
        _order_items_df = pd.read_csv(ORDER_ITEMS_CSV_PATH, dtype=str, keep_default_na=False)
    return _order_items_df

def get_customer_summary_df() -> pd.DataFrame:
    """
    Returns the cached customer summary DataFrame, loading from CSV if not already loaded.
    """
    global _customer_summary_df
    if _customer_summary_df is None:
        _customer_summary_df = pd.read_csv(CUSTOMER_SUMMARY_CSV_PATH, dtype=str, keep_default_na=False)
    return _customer_summary_df

def get_country_summary_df() -> pd.DataFrame:
    """
    Returns the cached country summary DataFrame, loading from CSV if not already loaded.
    """
    global _country_summary_df
    if _country_summary_df is None:
        _country_summary_df = pd.read_csv(COUNTRY_SUMMARY_CSV_PATH, dtype=str, keep_default_na=False)
    return _country_summary_df

def get_city_summary_df() -> pd.DataFrame:
    """
    Returns the cached city summary DataFrame, loading from CSV if not already loaded.
    """
    global _city_summary_df
    if _city_summary_df is None:
        _city_summary_df = pd.read_csv(CITY_SUMMARY_CSV_PATH, dtype=str, keep_default_na=False)
    return _city_summary_df
