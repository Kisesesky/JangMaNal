from __future__ import annotations

from datetime import datetime
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Product
from ..domain.schemas import CrawledProduct


def upsert_products(db: Session, items: Iterable[CrawledProduct]) -> tuple[int, int]:
    inserted: int = 0
    updated: int = 0

    for item in items:
        stmt = select(Product).where(
            Product.mart == item.mart,
            Product.external_id == item.external_id,
        )
        existing = db.execute(stmt).scalar_one_or_none()

        if existing is None:
            db.add(
                Product(
                    mart=item.mart,
                    external_id=item.external_id,
                    name=item.name,
                    price=item.price,
                    currency=item.currency,
                    image_url=item.image_url,
                    product_url=item.product_url,
                    source_category=item.source_category,
                    normalized_category_major=item.normalized_category_major,
                    normalized_category_sub=item.normalized_category_sub,
                    updated_at=datetime.utcnow(),
                )
            )
            inserted += 1
            continue

        existing.name = item.name
        existing.price = item.price
        existing.currency = item.currency
        existing.image_url = item.image_url
        existing.product_url = item.product_url
        if not existing.source_category and item.source_category:
            existing.source_category = item.source_category
        if not existing.normalized_category_major and item.normalized_category_major:
            existing.normalized_category_major = item.normalized_category_major
        if not existing.normalized_category_sub and item.normalized_category_sub:
            existing.normalized_category_sub = item.normalized_category_sub
        existing.updated_at = datetime.utcnow()
        updated += 1

    db.commit()
    return inserted, updated
