from __future__ import annotations

from decimal import Decimal
from typing import Iterable, Optional

import requests
from bs4 import BeautifulSoup

from .base import BaseMartCrawler
from ..domain.schemas import CrawledProduct


class ExampleMartCrawler(BaseMartCrawler):
    """
    실제 적용 시 아래 셀렉터를 마트 사이트 구조에 맞게 변경하세요.
    """

    mart_name = "example-mart"

    def __init__(self, category_url: str, timeout: int = 15):
        self.category_url = category_url
        self.timeout = timeout

    def crawl(self) -> Iterable[CrawledProduct]:
        response = requests.get(self.category_url, timeout=self.timeout)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.select(".product-card")

        products: list[CrawledProduct] = []
        for card in cards:
            external_id = (card.get("data-id") or "").strip()
            name_el = card.select_one(".product-name")
            price_el = card.select_one(".product-price")
            name = name_el.get_text(strip=True) if name_el else ""
            raw_price = price_el.get_text(strip=True) if price_el else ""
            image = card.select_one("img")
            link = card.select_one("a")

            if not external_id or not name:
                continue

            price = _parse_price(raw_price)
            if price is None:
                continue

            products.append(
                CrawledProduct(
                    mart=self.mart_name,
                    external_id=external_id,
                    name=name,
                    price=price,
                    currency="KRW",
                    image_url=image.get("src") if image else None,
                    product_url=link.get("href") if link else None,
                )
            )

        return products


def _parse_price(raw: str) -> Optional[Decimal]:
    digits = "".join(ch for ch in raw if ch.isdigit())
    if not digits:
        return None
    return Decimal(digits)
