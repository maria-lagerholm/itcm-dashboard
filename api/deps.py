# deps.py
# Dependency functions for loading and caching Parquet dataframes.

from pathlib import Path
import pandas as pd

# Paths to the Parquet data files
CUSTOMERS_PARQUET_PATH       = Path("/app/data/customers_clean.parquet")
TRANSACTIONS_PARQUET_PATH    = Path("/app/data/transactions_clean.parquet")
ARTICLES_PARQUET_PATH        = Path("/app/data/articles_clean.parquet")
ORDERS_PARQUET_PATH          = Path("/app/data/orders.parquet")
ORDER_ITEMS_PARQUET_PATH     = Path("/app/data/order_items.parquet")
CUSTOMER_SUMMARY_PARQUET_PATH= Path("/app/data/customer_summary.parquet")
COUNTRY_SUMMARY_PARQUET_PATH = Path("/app/data/country_summary.parquet")
CITY_SUMMARY_PARQUET_PATH    = Path("/app/data/city_summary.parquet")

# Global cache for loaded DataFrames (loaded once per process)
_customers_df = None
_transactions_df = None
_articles_df = None
_orders_df = None
_order_items_df = None
_customer_summary_df = None
_country_summary_df = None
_city_summary_df = None

def get_customers_df() -> pd.DataFrame:
    global _customers_df
    if _customers_df is None:
        _customers_df = pd.read_parquet(CUSTOMERS_PARQUET_PATH, engine="pyarrow")
    return _customers_df

def get_transactions_df() -> pd.DataFrame:
    global _transactions_df
    if _transactions_df is None:
        _transactions_df = pd.read_parquet(TRANSACTIONS_PARQUET_PATH, engine="pyarrow")
    return _transactions_df

def get_articles_df() -> pd.DataFrame:
    global _articles_df
    if _articles_df is None:
        _articles_df = pd.read_parquet(ARTICLES_PARQUET_PATH, engine="pyarrow")
    return _articles_df

def get_orders_df() -> pd.DataFrame:
    global _orders_df
    if _orders_df is None:
        _orders_df = pd.read_parquet(ORDERS_PARQUET_PATH, engine="pyarrow")
    return _orders_df

def get_order_items_df() -> pd.DataFrame:
    global _order_items_df
    if _order_items_df is None:
        _order_items_df = pd.read_parquet(ORDER_ITEMS_PARQUET_PATH, engine="pyarrow")
    return _order_items_df

def get_customer_summary_df() -> pd.DataFrame:
    global _customer_summary_df
    if _customer_summary_df is None:
        _customer_summary_df = pd.read_parquet(CUSTOMER_SUMMARY_PARQUET_PATH, engine="pyarrow")
    return _customer_summary_df

def get_country_summary_df() -> pd.DataFrame:
    global _country_summary_df
    if _country_summary_df is None:
        _country_summary_df = pd.read_parquet(COUNTRY_SUMMARY_PARQUET_PATH, engine="pyarrow")
    return _country_summary_df

def get_city_summary_df() -> pd.DataFrame:
    global _city_summary_df
    if _city_summary_df is None:
        _city_summary_df = pd.read_parquet(CITY_SUMMARY_PARQUET_PATH, engine="pyarrow")
    return _city_summary_df