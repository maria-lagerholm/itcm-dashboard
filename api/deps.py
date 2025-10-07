# deps.py (better: cached, auto-invalidate on mtime, simple API)
from functools import lru_cache
from pathlib import Path
import pandas as pd

DATA = Path("/app/data")

PATHS = {
    "customers":                 DATA / "customers_clean.parquet",
    "transactions":              DATA / "transactions_clean.parquet",
    "articles":                  DATA / "articles_clean.parquet",
    "orders":                    DATA / "orders.parquet",
    "order_items":               DATA / "order_items.parquet",
    "customer_summary":          DATA / "customer_summary.parquet",
    "country_summary":           DATA / "country_summary.parquet",
    "city_summary":              DATA / "city_summary.parquet",
    "city_monthly_revenue":      DATA / "city_monthly_revenue.parquet",
    "countries_by_channel":      DATA / "country_customers_by_channel.parquet",
    "return_buckets":            DATA / "return_buckets_overall.parquet",
    "top_brands":                DATA / "top_brands_by_country.parquet",
    "top_categories":            DATA / "top_categories_by_season.parquet",
    "top_groups":                DATA / "top_groupids_by_season.parquet",
    "top_repurchase":            DATA / "top_repurchase_groupids_by_country.parquet",
    "complements":        DATA / "pair_complements.parquet",
    "semantic_similarity_recs":        DATA / "semantic_similarity_recs.parquet",
}

def _key(path: Path) -> tuple[str, float]:
    s = path.stat()
    return (str(path), s.st_mtime)

@lru_cache(maxsize=None)
def _read_cached(path_str: str, mtime: float) -> pd.DataFrame:
    return pd.read_parquet(path_str, engine="pyarrow")

def _read(name: str) -> pd.DataFrame:
    return _read_cached(*_key(PATHS[name]))

def get_customers_df():             return _read("customers")
def get_transactions_df():          return _read("transactions")
def get_articles_df():              return _read("articles")
def get_orders_df():                return _read("orders")
def get_order_items_df():           return _read("order_items")
def get_customer_summary_df():      return _read("customer_summary")
def get_country_summary_df():       return _read("country_summary")
def get_city_summary_df():          return _read("city_summary")
def get_city_monthly_revenue_df():  return _read("city_monthly_revenue")
def get_countries_by_channel_df():  return _read("countries_by_channel")
def get_return_buckets_df():        return _read("return_buckets")
def get_top_brands_df():            return _read("top_brands")
def get_top_categories_df():        return _read("top_categories")
def get_top_groups_df():            return _read("top_groups")
def get_top_repurchase_df():        return _read("top_repurchase")
def get_complements_df():    return _read("complements")
def get_semantic_similarity_recs_df():    return _read("semantic_similarity_recs")

def clear_cache():
    _read_cached.cache_clear()