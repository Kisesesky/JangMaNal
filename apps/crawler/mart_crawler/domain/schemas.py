from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional


@dataclass(frozen=True)
class CrawledProduct:
    mart: str
    external_id: str
    name: str
    price: Decimal
    currency: str = "KRW"
    image_url: Optional[str] = None
    product_url: Optional[str] = None
    source_category: Optional[str] = None
    normalized_category_major: Optional[str] = None
    normalized_category_sub: Optional[str] = None
