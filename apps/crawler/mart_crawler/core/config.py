from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    database_url: str
    pg_host: str
    pg_port: int
    pg_user: str
    pg_password: str
    pg_database: str
    pg_maintenance_db: str
    emart_category_url: str
    lottemart_category_url: str
    homeplus_category_url: str
    marketkurly_category_url: str
    wisely_category_url: str
    marketkurly_max_products: int
    marketkurly_crawl_pool_size: int
    request_timeout: int
    user_agent: str
    schedule_hour: int
    schedule_minute: int
    timezone: str


def _build_database_url() -> str:
    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return explicit

    host = os.getenv("PGHOST", "127.0.0.1")
    port = os.getenv("PGPORT", "5432")
    user = os.getenv("PGUSER", "postgres")
    password = os.getenv("PGPASSWORD", "")
    database = os.getenv("PGDATABASE", "postgres")

    if password:
        return f"postgresql+psycopg://{user}:{password}@{host}:{port}/{database}"
    return f"postgresql+psycopg://{user}@{host}:{port}/{database}"


def get_settings() -> Settings:
    return Settings(
        database_url=_build_database_url(),
        pg_host=os.getenv("PGHOST", "127.0.0.1"),
        pg_port=int(os.getenv("PGPORT", "5432")),
        pg_user=os.getenv("PGUSER", "postgres"),
        pg_password=os.getenv("PGPASSWORD", ""),
        pg_database=os.getenv("PGDATABASE", "postgres"),
        pg_maintenance_db=os.getenv("PG_MAINTENANCE_DB", "postgres"),
        emart_category_url=os.getenv(
            "EMART_CATEGORY_URL",
            "https://emart.ssg.com/search.ssg?target=all&query=%EC%83%81%ED%92%88",
        ),
        lottemart_category_url=os.getenv(
            "LOTTEMART_CATEGORY_URL",
            "https://lottemartzetta.com/products/search?q=%EC%83%81%ED%92%88",
        ),
        homeplus_category_url=os.getenv(
            "HOMEPLUS_CATEGORY_URL",
            "https://mfront.homeplus.co.kr/search?keyword=%EC%83%81%ED%92%88",
        ),
        marketkurly_category_url=os.getenv(
            "MARKETKURLY_CATEGORY_URL",
            "https://www.kurly.com/sitemap/index-sitemap.xml",
        ),
        wisely_category_url=os.getenv(
            "WISELY_CATEGORY_URL",
            "https://shop.wisely.store/",
        ),
        marketkurly_max_products=int(os.getenv("MARKETKURLY_MAX_PRODUCTS", "20")),
        marketkurly_crawl_pool_size=int(os.getenv("MARKETKURLY_CRAWL_POOL_SIZE", "300")),
        request_timeout=int(os.getenv("REQUEST_TIMEOUT", "20")),
        user_agent=os.getenv(
            "USER_AGENT",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/123.0.0.0 Safari/537.36",
        ),
        schedule_hour=int(os.getenv("SCHEDULE_HOUR", "3")),
        schedule_minute=int(os.getenv("SCHEDULE_MINUTE", "0")),
        timezone=os.getenv("TIMEZONE", "Asia/Seoul"),
    )
