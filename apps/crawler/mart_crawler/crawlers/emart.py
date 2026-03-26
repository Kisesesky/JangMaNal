from __future__ import annotations

import json
from decimal import Decimal
from typing import Any, Iterable, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from .base import BaseMartCrawler
from ..domain.schemas import CrawledProduct


class EmartCrawler(BaseMartCrawler):
    mart_name = "emart"

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

        products = self._parse_next_data(soup)
        if products:
            return products

        products = self._parse_ld_json(soup)
        if products:
            return products

        return self._parse_dom_cards(soup)

    def _parse_next_data(self, soup: BeautifulSoup) -> list[CrawledProduct]:
        script = soup.select_one("#__NEXT_DATA__")
        if not script:
            return []

        raw = script.get_text(strip=True)
        if not raw:
            return []

        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            return []

        results: list[CrawledProduct] = []
        for node in _walk(payload):
            if not isinstance(node, dict):
                continue

            external_id = _to_text(node.get("itemId"))
            name = _to_text(node.get("itemName") or node.get("itemNm"))
            if not external_id or not name:
                continue

            price = _parse_price(_to_text(node.get("finalPrice") or node.get("sellprc")))
            if price is None:
                price_info = node.get("priceInfo")
                if isinstance(price_info, dict):
                    price = _parse_price(_to_text(price_info.get("primaryPrice")))
            if price is None:
                continue

            product_url = _to_text(node.get("itemUrl"))
            if product_url:
                product_url = urljoin(self.category_url, product_url)

            image_url = _to_text(node.get("itemImgUrl"))
            if image_url:
                image_url = urljoin(self.category_url, image_url)

            results.append(
                CrawledProduct(
                    mart=self.mart_name,
                    external_id=external_id,
                    name=name,
                    price=price,
                    currency="KRW",
                    image_url=image_url or None,
                    product_url=product_url or None,
                    source_category=self.source_category,
                    normalized_category_major=self.normalized_category_major,
                    normalized_category_sub=self.normalized_category_sub,
                )
            )

        return _dedupe(results)

    def _parse_ld_json(self, soup: BeautifulSoup) -> list[CrawledProduct]:
        results: list[CrawledProduct] = []

        for script in soup.select('script[type="application/ld+json"]'):
            raw = script.string or script.get_text() or ""
            raw = raw.strip()
            if not raw:
                continue

            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                continue

            for node in _walk(payload):
                if not isinstance(node, dict):
                    continue

                if node.get("@type") != "Product":
                    continue

                name = _to_text(node.get("name"))
                if not name:
                    continue

                product_url = _to_text(node.get("url"))
                image_url = _extract_image(node.get("image"))
                offers = node.get("offers")
                price = _extract_offer_price(offers)
                if price is None:
                    continue

                external_id = _to_text(node.get("sku") or node.get("productID") or product_url)
                if not external_id:
                    continue

                if product_url:
                    product_url = urljoin(self.category_url, product_url)

                results.append(
                    CrawledProduct(
                        mart=self.mart_name,
                        external_id=external_id,
                        name=name,
                        price=price,
                        currency=_to_text(_extract_offer_currency(offers)) or "KRW",
                        image_url=image_url,
                        product_url=product_url,
                        source_category=self.source_category,
                        normalized_category_major=self.normalized_category_major,
                        normalized_category_sub=self.normalized_category_sub,
                    )
                )

        return _dedupe(results)

    def _parse_dom_cards(self, soup: BeautifulSoup) -> list[CrawledProduct]:
        cards = soup.select(
            "li[id^='item_id_'], li.cunit_t232, div.cunit_item, "
            "div[data-itemid], li[data-itemid]"
        )

        results: list[CrawledProduct] = []
        for card in cards:
            external_id = _first_attr(card, ["data-itemid", "data-item-id", "id"])
            if external_id and external_id.startswith("item_id_"):
                external_id = external_id.replace("item_id_", "", 1)

            name = _first_text(card, [".cunit_md", ".tx_ko", ".title", "[data-itemname]"])
            raw_price = _first_text(card, [".ssg_price", ".opt_price em", ".tx_num", ".price"])
            link = card.select_one("a[href]")
            image = card.select_one("img[src]")

            if not external_id:
                href = link.get("href") if link else ""
                external_id = _extract_item_id_from_href(href)

            if not external_id or not name:
                continue

            price = _parse_price(raw_price)
            if price is None:
                continue

            product_url = urljoin(self.category_url, link.get("href")) if link else None
            image_url = urljoin(self.category_url, image.get("src")) if image else None

            results.append(
                CrawledProduct(
                    mart=self.mart_name,
                    external_id=external_id,
                    name=name,
                    price=price,
                    currency="KRW",
                    image_url=image_url,
                    product_url=product_url,
                    source_category=self.source_category,
                    normalized_category_major=self.normalized_category_major,
                    normalized_category_sub=self.normalized_category_sub,
                )
            )

        return _dedupe(results)


def _walk(value: Any):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from _walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from _walk(item)


def _to_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _extract_image(value: Any) -> Optional[str]:
    if isinstance(value, str):
        return value
    if isinstance(value, list) and value:
        first = value[0]
        return str(first) if first else None
    return None


def _extract_offer_price(offers: Any) -> Optional[Decimal]:
    if isinstance(offers, dict):
        return _parse_price(_to_text(offers.get("price")))

    if isinstance(offers, list):
        for item in offers:
            if not isinstance(item, dict):
                continue
            price = _parse_price(_to_text(item.get("price")))
            if price is not None:
                return price

    return None


def _extract_offer_currency(offers: Any) -> Optional[str]:
    if isinstance(offers, dict):
        return _to_text(offers.get("priceCurrency")) or None

    if isinstance(offers, list):
        for item in offers:
            if not isinstance(item, dict):
                continue
            currency = _to_text(item.get("priceCurrency"))
            if currency:
                return currency

    return None


def _first_text(node, selectors: list[str]) -> str:
    for selector in selectors:
        found = node.select_one(selector)
        if not found:
            continue
        text = found.get_text(strip=True)
        if text:
            return text
    return ""


def _first_attr(node, attrs: list[str]) -> str:
    for attr in attrs:
        value = node.get(attr)
        if value:
            return str(value).strip()
    return ""


def _parse_price(raw: str) -> Optional[Decimal]:
    digits = "".join(ch for ch in (raw or "") if ch.isdigit())
    if not digits:
        return None
    return Decimal(digits)


def _extract_item_id_from_href(href: str) -> str:
    if not href:
        return ""

    parts = [p for p in href.split("/") if p]
    for i, part in enumerate(parts):
        if part == "item" and i + 1 < len(parts):
            candidate = parts[i + 1].split("?")[0].strip()
            if candidate:
                return candidate

    return ""


def _dedupe(items: list[CrawledProduct]) -> list[CrawledProduct]:
    seen: set[tuple[str, str]] = set()
    deduped: list[CrawledProduct] = []
    for item in items:
        key = (item.mart, item.external_id)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped
