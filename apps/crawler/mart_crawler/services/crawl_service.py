from __future__ import annotations

from datetime import datetime
from typing import Optional

from ..core.config import get_settings
from ..core.db import SessionLocal
from ..crawlers import EmartCrawler, HomeplusCrawler, LotteMartCrawler, MarketKurlyCrawler, WiselyCrawler
from ..domain.categories import (
    MART_SOURCE_CATEGORIES,
    build_mart_category_url,
    classify_source_category,
    extract_category_keywords,
)
from ..persistence.repository import upsert_products

MART_ORDER = ["emart", "lottemart", "homeplus", "marketkurly", "wisely"]


def build_crawlers_for_mart(mart: str, url_override: Optional[str] = None):
    settings = get_settings()
    categories = MART_SOURCE_CATEGORIES[mart]
    crawlers = []

    for source_category in categories:
        normalized_major, normalized_sub = classify_source_category(source_category)
        category_url = url_override or build_mart_category_url(mart, source_category, settings)
        keywords = extract_category_keywords(source_category)

        if mart == "emart":
            crawler = EmartCrawler(
                category_url,
                settings.request_timeout,
                settings.user_agent,
                source_category=source_category,
                normalized_category_major=normalized_major,
                normalized_category_sub=normalized_sub,
            )
        elif mart == "lottemart":
            crawler = LotteMartCrawler(
                category_url,
                settings.request_timeout,
                settings.user_agent,
                source_category=source_category,
                normalized_category_major=normalized_major,
                normalized_category_sub=normalized_sub,
            )
        elif mart == "homeplus":
            crawler = HomeplusCrawler(
                category_url,
                settings.request_timeout,
                settings.user_agent,
                source_category=source_category,
                normalized_category_major=normalized_major,
                normalized_category_sub=normalized_sub,
            )
        elif mart == "marketkurly":
            crawler = MarketKurlyCrawler(
                category_url,
                settings.request_timeout,
                settings.user_agent,
                settings.marketkurly_max_products,
                source_category=source_category,
                normalized_category_major=normalized_major,
                normalized_category_sub=normalized_sub,
                category_keywords=keywords,
                crawl_pool_size=settings.marketkurly_crawl_pool_size,
            )
        elif mart == "wisely":
            crawler = WiselyCrawler(
                category_url,
                settings.request_timeout,
                settings.user_agent,
                source_category=source_category,
                normalized_category_major=normalized_major,
                normalized_category_sub=normalized_sub,
                category_keywords=keywords,
            )
        else:
            raise ValueError(f"Unknown mart: {mart}")

        crawlers.append(crawler)

    return crawlers


def build_crawlers(mart: str, url_override: Optional[str] = None):
    if mart == "all":
        crawlers = []
        for mart_name in MART_ORDER:
            crawlers.extend(build_crawlers_for_mart(mart_name, url_override=None))
        return crawlers
    return build_crawlers_for_mart(mart, url_override=url_override)


def crawl_once(mart: str, url: Optional[str] = None) -> tuple[int, int, int]:
    crawlers = build_crawlers(mart=mart, url_override=url)
    total_count = 0
    total_inserted = 0
    total_updated = 0

    with SessionLocal() as db:
        for crawler in crawlers:
            items = list(crawler.crawl())
            inserted, updated = upsert_products(db, items)
            total_count += len(items)
            total_inserted += inserted
            total_updated += updated
            print(
                f"[{datetime.now().isoformat(timespec='seconds')}] "
                f"mart={crawler.mart_name} source_category={crawler.source_category} "
                f"crawled={len(items)} inserted={inserted} updated={updated}"
            )

    return total_count, total_inserted, total_updated
