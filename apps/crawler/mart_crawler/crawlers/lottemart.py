from __future__ import annotations

import json
from decimal import Decimal
from typing import Iterable, Optional

import requests
from bs4 import BeautifulSoup

from .base import BaseMartCrawler
from ..domain.schemas import CrawledProduct


class LotteMartCrawler(BaseMartCrawler):
    mart_name = "lottemart"

    def __init__(self, category_url: str, timeout: int = 20, user_agent: Optional[str] = None, source_category: Optional[str] = None, normalized_category_major: Optional[str] = None, normalized_category_sub: Optional[str] = None):
        self.category_url = category_url
        self.timeout = timeout
        self.user_agent = user_agent or "Mozilla/5.0"
        self.source_category = source_category
        self.normalized_category_major = normalized_category_major
        self.normalized_category_sub = normalized_category_sub

    def crawl(self) -> Iterable[CrawledProduct]:
        response = requests.get(
            self.category_url,
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent},
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        state = self._extract_initial_state(soup)
        if not state:
            return []

        entities = (
            state.get("data", {})
            .get("products", {})
            .get("productEntities", {})
        )

        products: list[CrawledProduct] = []
        for entity in entities.values():
            external_id = _to_text(entity.get("retailerProductId") or entity.get("productId"))
            name = _to_text(entity.get("name"))
            if not external_id or not name:
                continue

            price = _extract_price(entity.get("price"))
            if price is None:
                continue

            image = entity.get("image") or {}
            image_url = _to_text(image.get("src")) if isinstance(image, dict) else None

            products.append(
                CrawledProduct(
                    mart=self.mart_name,
                    external_id=external_id,
                    name=name,
                    price=price,
                    currency="KRW",
                    image_url=image_url or None,
                    product_url=f"https://lottemartzetta.com/products/{external_id}/details",
                    source_category=self.source_category,
                    normalized_category_major=self.normalized_category_major,
                    normalized_category_sub=self.normalized_category_sub,
                )
            )

        return _dedupe(products)

    def _extract_initial_state(self, soup: BeautifulSoup) -> Optional[dict]:
        for script in soup.find_all("script"):
            text = script.get_text() or ""
            prefix = "window.__INITIAL_STATE__="
            if not text.startswith(prefix):
                continue

            raw = text[len(prefix):]
            if raw.endswith(";"):
                raw = raw[:-1]

            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return None

        return None


def _extract_price(value) -> Optional[Decimal]:
    if not isinstance(value, dict):
        return None

    current = value.get("current")
    if isinstance(current, dict):
        amount = current.get("amount")
        digits = _digits(_to_text(amount))
        if digits:
            return Decimal(digits)

    digits = _digits(_to_text(value.get("amount") or value.get("price")))
    if digits:
        return Decimal(digits)

    return None


def _digits(raw: str) -> str:
    return "".join(ch for ch in raw if ch.isdigit())


def _to_text(value) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _dedupe(items: list[CrawledProduct]) -> list[CrawledProduct]:
    seen = set()
    output: list[CrawledProduct] = []
    for item in items:
        key = (item.mart, item.external_id)
        if key in seen:
            continue
        seen.add(key)
        output.append(item)
    return output
