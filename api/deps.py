# deps.py
# Dependency loader for Parquet DataFrames (cached per process)
from pathlib import Path
import pandas as pd

CUSTOMERS_PARQUET_PATH        = Path("/app/data/customers_clean.parquet")
TRANSACTIONS_PARQUET_PATH     = Path("/app/data/transactions_clean.parquet")
ARTICLES_PARQUET_PATH         = Path("/app/data/articles_clean.parquet")
ORDERS_PARQUET_PATH           = Path("/app/data/orders.parquet")
ORDER_ITEMS_PARQUET_PATH      = Path("/app/data/order_items.parquet")
CUSTOMER_SUMMARY_PARQUET_PATH = Path("/app/data/customer_summary.parquet")
COUNTRY_SUMMARY_PARQUET_PATH  = Path("/app/data/country_summary.parquet")
CITY_SUMMARY_PARQUET_PATH     = Path("/app/data/city_summary.parquet")
CITY_MONTHLY_REVENUE_PARQUET_PATH = Path("/app/data/city_monthly_revenue.parquet")
COUNTRIES_BY_CHANNEL_PARQUET_PATH = Path("/app/data/country_customers_by_channel.parquet")
RETURN_BUCKETS_PARQUET_PATH   = Path("/app/data/return_buckets_overall.parquet")
TOP_BRANDS_PARQUET_PATH       = Path("/app/data/top_brands_by_country.parquet")
TOP_CATEGORIES_PARQUET_PATH   = Path("/app/data/top_categories_by_season.parquet")
TOP_GROUPS_PARQUET_PATH       = Path("/app/data/top_groupids_by_season.parquet")
TOP_REPURCHASE_PARQUET_PATH   = Path("/app/data/top_repurchase_groupids_by_country.parquet")
COOCURRING_GROUPS_PARQUET_PATH = Path("/app/data/pair_cooccurrences.parquet")

_customers_df = None
_transactions_df = None
_articles_df = None
_orders_df = None
_order_items_df = None
_customer_summary_df = None
_country_summary_df = None
_city_summary_df = None
_city_monthly_revenue_df = None
_countries_by_channel_df = None
_return_buckets_df = None
_top_brands_df = None
_top_categories_df = None
_top_groups_df = None
_top_repurchase_df = None
_cooccurring_groups_df = None


def _get(df_var: str, path: Path) -> pd.DataFrame:
    g = globals()
    if g[df_var] is None:
        g[df_var] = pd.read_parquet(path, engine="pyarrow")
    return g[df_var]

def get_customers_df():             return _get("_customers_df", CUSTOMERS_PARQUET_PATH)
def get_transactions_df():          return _get("_transactions_df", TRANSACTIONS_PARQUET_PATH)
def get_articles_df():              return _get("_articles_df", ARTICLES_PARQUET_PATH)
def get_orders_df():                return _get("_orders_df", ORDERS_PARQUET_PATH)
def get_order_items_df():           return _get("_order_items_df", ORDER_ITEMS_PARQUET_PATH)
def get_customer_summary_df():      return _get("_customer_summary_df", CUSTOMER_SUMMARY_PARQUET_PATH)
def get_country_summary_df():       return _get("_country_summary_df", COUNTRY_SUMMARY_PARQUET_PATH)
def get_city_summary_df():          return _get("_city_summary_df", CITY_SUMMARY_PARQUET_PATH)
def get_city_monthly_revenue_df():  return _get("_city_monthly_revenue_df", CITY_MONTHLY_REVENUE_PARQUET_PATH)
def get_countries_by_channel_df():  return _get("_countries_by_channel_df", COUNTRIES_BY_CHANNEL_PARQUET_PATH)
def get_return_buckets_df():        return _get("_return_buckets_df", RETURN_BUCKETS_PARQUET_PATH)
def get_top_brands_df():            return _get("_top_brands_df", TOP_BRANDS_PARQUET_PATH)
def get_top_categories_df():        return _get("_top_categories_df", TOP_CATEGORIES_PARQUET_PATH)
def get_top_groups_df():            return _get("_top_groups_df", TOP_GROUPS_PARQUET_PATH)
def get_top_repurchase_df():        return _get("_top_repurchase_df", TOP_REPURCHASE_PARQUET_PATH)
def get_cooccurring_groups_df():    return _get("_cooccurring_groups_df", COOCURRING_GROUPS_PARQUET_PATH)
