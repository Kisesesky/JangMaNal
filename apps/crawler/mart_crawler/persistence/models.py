from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("mart", "external_id", name="uq_mart_external_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    mart: Mapped[str] = mapped_column(String(100), index=True)
    external_id: Mapped[str] = mapped_column(String(255), index=True)
    name: Mapped[str] = mapped_column(String(500))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(10), default="KRW")
    image_url: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    product_url: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    source_category: Mapped[Optional[str]] = mapped_column(String(200), nullable=True, index=True)
    normalized_category_major: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    normalized_category_sub: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
