from __future__ import annotations

from decimal import Decimal
from typing import Iterable, Optional
from urllib.parse import parse_qs, quote_plus, urlparse

import requests

from .base import BaseMartCrawler
from ..domain.schemas import CrawledProduct


class HomeplusCrawler(BaseMartCrawler):
    mart_name = "homeplus"

    def __init__(self, category_url: str, timeout: int = 20, user_agent: Optional[str] = None, source_category: Optional[str] = None, normalized_category_major: Optional[str] = None, normalized_category_sub: Optional[str] = None):
        self.category_url = category_url
        self.timeout = timeout
        self.user_agent = user_agent or "Mozilla/5.0"
        self.source_category = source_category
        self.normalized_category_major = normalized_category_major
        self.normalized_category_sub = normalized_category_sub

    def crawl(self) -> Iterable[CrawledProduct]:
        keyword = _extract_keyword(self.category_url) or "상품"

        response = requests.get(
            "https://mfront.homeplus.co.kr/totalsearch/total/search/item.json",
            params={"keyword": keyword, "pageNo": 1},
            timeout=self.timeout,
            headers={
                "User-Agent": self.user_agent,
                "Accept": "application/json, text/plain, */*",
                "Referer": f"https://mfront.homeplus.co.kr/search?keyword={quote_plus(keyword)}",
            },
        )
        response.raise_for_status()

        payload = response.json()
        data = payload.get("data") or {}
        items = data.get("dataList") or []
        image_map = self._fetch_detail_images(items)

        products: list[CrawledProduct] = []
        for item in items:
            external_id = _to_text(item.get("itemNo"))
            name = _to_text(item.get("itemNm"))
            if not external_id or not name:
                continue

            price = _extract_price(item)
            if price is None:
                continue

            image_url = (
                image_map.get(external_id)
                or _to_text(item.get("imgUrl"))
                or None
            )
            product_url = f"https://mfront.homeplus.co.kr/item?itemNo={external_id}"

            products.append(
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

        return _dedupe(products)

    def _fetch_detail_images(self, items: list[dict]) -> dict[str, str]:
        output: dict[str, str] = {}
        for item in items:
            item_no = _to_text(item.get("itemNo"))
            if not item_no:
                continue

            store_type = _to_text(item.get("storeType")) or "DS"
            store_id = item.get("storeId", 0)

            try:
                response = requests.get(
                    "https://mfront.homeplus.co.kr/item/getItemDetail.json",
                    params={
                        "itemNo": item_no,
                        "storeType": store_type,
                        "storeId": store_id,
                    },
                    timeout=self.timeout,
                    headers={
                        "User-Agent": self.user_agent,
                        "Accept": "application/json, text/plain, */*",
                        "Referer": "https://mfront.homeplus.co.kr/",
                    },
                )
                response.raise_for_status()
                payload = response.json()
                image_path = (
                    payload.get("data", {})
                    .get("item", {})
                    .get("img", {})
                    .get("mainList", [{}])[0]
                    .get("url")
                )
                if image_path:
                    output[item_no] = f"https://image.homeplus.kr{image_path}"
            except Exception:
                continue

        return output


def _extract_keyword(url: str) -> str:
    query = parse_qs(urlparse(url).query)
    values = query.get("keyword") or query.get("query") or []
    return values[0].strip() if values else ""


def _extract_price(item: dict) -> Optional[Decimal]:
    for key in ("dcPrice", "salePrice", "singlePrice"):
        raw = _to_text(item.get(key))
        digits = "".join(ch for ch in raw if ch.isdigit())
        if digits:
            return Decimal(digits)
    return None


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
