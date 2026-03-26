from __future__ import annotations

import json
import re
from decimal import Decimal
from typing import Optional

import requests
from bs4 import BeautifulSoup

from .base import BaseMartCrawler
from ..domain.schemas import CrawledProduct


class MarketKurlyCrawler(BaseMartCrawler):
    mart_name = "marketkurly"

    _cached_base_products: list[dict] = []
    _cache_loaded: bool = False

    def __init__(
        self,
        category_url: str,
        timeout: int = 20,
        user_agent: Optional[str] = None,
        max_products: int = 20,
        source_category: Optional[str] = None,
        normalized_category_major: Optional[str] = None,
        normalized_category_sub: Optional[str] = None,
        category_keywords: Optional[list[str]] = None,
        crawl_pool_size: int = 300,
    ):
        self.category_url = category_url
        self.timeout = timeout
        self.user_agent = user_agent or "Mozilla/5.0"
        self.max_products = max_products
        self.source_category = source_category
        self.normalized_category_major = normalized_category_major
        self.normalized_category_sub = normalized_category_sub
        self.category_keywords = category_keywords or []
        self.crawl_pool_size = crawl_pool_size

    def crawl(self):
        self._ensure_cache_loaded()

        matched: list[CrawledProduct] = []
        for base in self._cached_base_products:
            name = (base.get("name") or "").lower()
            if self.category_keywords and not any(kw in name for kw in self.category_keywords):
                continue

            matched.append(
                CrawledProduct(
                    mart=self.mart_name,
                    external_id=base["external_id"],
                    name=base["name"],
                    price=base["price"],
                    currency="KRW",
                    image_url=base.get("image_url"),
                    product_url=base.get("product_url"),
                    source_category=self.source_category,
                    normalized_category_major=self.normalized_category_major,
                    normalized_category_sub=self.normalized_category_sub,
                )
            )
            if len(matched) >= self.max_products:
                break

        return matched

    def _ensure_cache_loaded(self) -> None:
        if MarketKurlyCrawler._cache_loaded:
            return

        goods_urls = self._load_goods_urls(limit=self.crawl_pool_size)
        base_products: list[dict] = []

        for goods_url in goods_urls:
            try:
                base = self._fetch_base_product(goods_url)
                if base:
                    base_products.append(base)
            except Exception:
                continue

        MarketKurlyCrawler._cached_base_products = _dedupe_base(base_products)
        MarketKurlyCrawler._cache_loaded = True

    def _load_goods_urls(self, limit: int) -> list[str]:
        index_xml = requests.get(
            self.category_url,
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent},
        ).text

        sitemap_urls = re.findall(r"<loc>(.*?)</loc>", index_xml)
        goods_sitemaps = [u for u in sitemap_urls if "/sitemap/goods-" in u]

        goods_urls: list[str] = []
        for sitemap_url in goods_sitemaps:
            if len(goods_urls) >= limit:
                break

            xml = requests.get(
                sitemap_url,
                timeout=self.timeout,
                headers={"User-Agent": self.user_agent},
            ).text
            urls = re.findall(r"<loc>(.*?)</loc>", xml)
            for url in urls:
                if "/goods/" not in url:
                    continue
                goods_urls.append(url)
                if len(goods_urls) >= limit:
                    break

        return goods_urls[:limit]

    def _fetch_base_product(self, goods_url: str) -> Optional[dict]:
        html = requests.get(
            goods_url,
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent},
        ).text

        soup = BeautifulSoup(html, "html.parser")
        next_data = soup.select_one("#__NEXT_DATA__")
        if not next_data:
            return None

        payload = json.loads(next_data.get_text())
        product = payload.get("props", {}).get("pageProps", {}).get("product", {})

        external_id = _to_text(product.get("no"))
        name = _to_text(product.get("name"))
        if not external_id or not name:
            return None

        deal = (product.get("dealProducts") or [{}])[0]
        price = _extract_price(deal, product)
        if price is None:
            return None

        image_url = _to_text(product.get("mainImageUrl") or product.get("shareImageUrl")) or None

        return {
            "external_id": external_id,
            "name": name,
            "price": price,
            "image_url": image_url,
            "product_url": goods_url,
        }


def _extract_price(deal: dict, product: dict) -> Optional[Decimal]:
    for key in ("discountedPrice", "basePrice", "retailPrice"):
        value = deal.get(key)
        if value is not None:
            digits = "".join(ch for ch in str(value) if ch.isdigit())
            if digits:
                return Decimal(digits)

    for key in ("discountedPrice", "basePrice", "retailPrice"):
        value = product.get(key)
        if value is not None:
            digits = "".join(ch for ch in str(value) if ch.isdigit())
            if digits:
                return Decimal(digits)

    return None


def _to_text(value) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _dedupe_base(items: list[dict]) -> list[dict]:
    seen = set()
    output: list[dict] = []
    for item in items:
        key = item["external_id"]
        if key in seen:
            continue
        seen.add(key)
        output.append(item)
    return output
