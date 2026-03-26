from __future__ import annotations

import re
from decimal import Decimal
from typing import Iterable, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from .base import BaseMartCrawler
from ..domain.schemas import CrawledProduct


class WiselyCrawler(BaseMartCrawler):
    mart_name = "wisely"

    def __init__(
        self,
        category_url: str,
        timeout: int = 20,
        user_agent: Optional[str] = None,
        source_category: Optional[str] = None,
        normalized_category_major: Optional[str] = None,
        normalized_category_sub: Optional[str] = None,
        category_keywords: Optional[list[str]] = None,
    ):
        self.category_url = category_url
        self.timeout = timeout
        self.user_agent = user_agent or "Mozilla/5.0"
        self.source_category = source_category
        self.normalized_category_major = normalized_category_major
        self.normalized_category_sub = normalized_category_sub
        self.category_keywords = category_keywords or []

    def crawl(self) -> Iterable[CrawledProduct]:
        products = self._crawl_with_playwright()
        if products:
            return products
        return self._crawl_static_html()

    def _crawl_with_playwright(self) -> list[CrawledProduct]:
        try:
            from playwright.sync_api import sync_playwright
        except Exception:
            return []

        all_items: list[dict] = []
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page(user_agent=self.user_agent)
                page.goto(self.category_url, wait_until="domcontentloaded", timeout=self.timeout * 1000)
                page.wait_for_timeout(1800)

                target_urls = self._extract_target_category_urls_with_playwright(page)
                if not target_urls:
                    target_urls = [self.category_url]

                for target_url in target_urls:
                    page.goto(target_url, wait_until="domcontentloaded", timeout=self.timeout * 1000)
                    page.wait_for_timeout(1800)
                    for _ in range(4):
                        page.mouse.wheel(0, 3000)
                        page.wait_for_timeout(250)
                    all_items.extend(self._extract_product_items_with_playwright(page))
                browser.close()
        except Exception:
            return []

        return self._to_products(all_items)

    def _crawl_static_html(self) -> list[CrawledProduct]:
        base_response = requests.get(
            self.category_url,
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent},
        )
        base_response.raise_for_status()

        base_soup = BeautifulSoup(base_response.text, "html.parser")
        category_urls = self._extract_target_category_urls_from_soup(base_soup)
        if not category_urls:
            category_urls = [self.category_url]

        all_items: list[dict] = []
        for category_url in category_urls:
            response = requests.get(
                category_url,
                timeout=self.timeout,
                headers={"User-Agent": self.user_agent},
            )
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            all_items.extend(self._extract_product_items_from_soup(soup))

        return self._to_products(all_items)

    def _extract_target_category_urls_with_playwright(self, page) -> list[str]:
        links = page.evaluate(
            """
            () => {
              return Array.from(document.querySelectorAll('a[href^="/category/"]')).map((a) => ({
                href: a.getAttribute('href') || '',
                text: (a.textContent || '').replace(/\\s+/g, ' ').trim(),
              }));
            }
            """
        )
        return self._select_matching_category_urls(links)

    def _extract_product_items_with_playwright(self, page) -> list[dict]:
        return page.evaluate(
            """
            () => {
              const anchors = Array.from(document.querySelectorAll('a[href^="/products/"]'));
              return anchors.map((a) => {
                const href = a.getAttribute('href') || '';
                const img = a.querySelector('img[src], img[alt]');
                const alt = img ? (img.getAttribute('alt') || '') : '';
                const src = img ? (img.getAttribute('src') || '') : '';
                const text = (a.parentElement ? a.parentElement.textContent : a.textContent) || '';
                return {
                  href,
                  name: (alt || a.textContent || '').trim(),
                  text: text.replace(/\\s+/g, ' ').trim(),
                  image_url: src,
                };
              });
            }
            """
        )

    def _extract_target_category_urls_from_soup(self, soup: BeautifulSoup) -> list[str]:
        links: list[dict[str, str]] = []
        for anchor in soup.select('a[href^="/category/"]'):
            links.append(
                {
                    "href": anchor.get("href") or "",
                    "text": anchor.get_text(" ", strip=True),
                }
            )
        return self._select_matching_category_urls(links)

    def _extract_product_items_from_soup(self, soup: BeautifulSoup) -> list[dict]:
        items: list[dict] = []
        for anchor in soup.select('a[href^="/products/"]'):
            href = anchor.get("href") or ""
            img = anchor.select_one("img[src], img[alt]")
            name = img.get("alt") if img else anchor.get_text(" ", strip=True)
            image_url = img.get("src") if img else None
            parent_text = anchor.parent.get_text(" ", strip=True) if anchor.parent else anchor.get_text(" ", strip=True)
            items.append(
                {
                    "href": href,
                    "name": (name or "").strip(),
                    "text": " ".join((parent_text or "").split()),
                    "image_url": image_url,
                }
            )
        return items

    def _select_matching_category_urls(self, links: list[dict]) -> list[str]:
        selected: list[str] = []
        exact = (self.source_category or "").strip()
        keywords = [k.strip().lower() for k in self.category_keywords if k.strip()]

        for link in links:
            href = (link.get("href") or "").strip()
            text = (link.get("text") or "").strip()
            if not href or not text:
                continue

            text_lower = text.lower()
            is_match = False
            if exact and text == exact:
                is_match = True
            elif keywords and any(k in text_lower for k in keywords):
                is_match = True

            if is_match:
                selected.append(urljoin(self.category_url, href))

        if not selected:
            return []
        return list(dict.fromkeys(selected))

    def _to_products(self, items: list[dict]) -> list[CrawledProduct]:
        products: list[CrawledProduct] = []
        seen: set[tuple[str, str]] = set()

        for item in items:
            href = item.get("href") or ""
            external_id = _extract_product_id(href)
            if not external_id:
                continue

            name = (item.get("name") or "").strip()
            if not name:
                continue

            # search URL이 카테고리 단위라 추가 키워드 필터는 비활성 (오검출 방지보다 누락 방지 우선)
            price = _extract_price_from_text(item.get("text") or "")
            if price is None:
                continue

            key = (self.mart_name, external_id)
            if key in seen:
                continue
            seen.add(key)

            products.append(
                CrawledProduct(
                    mart=self.mart_name,
                    external_id=external_id,
                    name=name,
                    price=price,
                    currency="KRW",
                    image_url=item.get("image_url") or None,
                    product_url=urljoin(self.category_url, href),
                    source_category=self.source_category,
                    normalized_category_major=self.normalized_category_major,
                    normalized_category_sub=self.normalized_category_sub,
                )
            )

        return products


def _extract_product_id(href: str) -> str:
    parts = [p for p in href.split("/") if p]
    if len(parts) >= 2 and parts[0] == "products":
        return parts[1].split("?")[0].strip()
    return ""


def _extract_price_from_text(text: str) -> Optional[Decimal]:
    text = " ".join(text.split())
    match = re.search(r"(\d{1,3}(?:,\d{3})*)\s*원", text)
    if not match:
        return None
    digits = match.group(1).replace(",", "")
    return Decimal(digits)
