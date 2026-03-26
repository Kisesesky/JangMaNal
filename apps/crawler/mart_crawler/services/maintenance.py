from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..domain.categories import classify_source_category
from ..persistence.models import Product


@dataclass
class CleanupResult:
    backfilled: int
    deleted: int


def cleanup_legacy_products(db: Session, delete_unclassified: bool = True) -> CleanupResult:
    backfilled = 0
    deleted = 0

    rows = db.execute(
        select(Product).where(
            Product.source_category.is_not(None),
            or_(
                Product.normalized_category_major.is_(None),
                Product.normalized_category_sub.is_(None),
            ),
        )
    ).scalars().all()

    for row in rows:
        major, sub = classify_source_category(row.source_category or "")
        row.normalized_category_major = major
        row.normalized_category_sub = sub
        backfilled += 1

    if delete_unclassified:
        deleted = (
            db.query(Product)
            .filter(
                or_(
                    Product.source_category.is_(None),
                    Product.normalized_category_major.is_(None),
                    Product.normalized_category_sub.is_(None),
                )
            )
            .delete(synchronize_session=False)
        )

    db.commit()
    return CleanupResult(backfilled=backfilled, deleted=deleted)
