from __future__ import annotations

import re
from typing import Optional

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.orm import Session, sessionmaker

from .config import get_settings
from ..persistence.models import Base

_engine: Optional[Engine] = None
SessionLocal = sessionmaker(class_=Session, autoflush=False, autocommit=False)


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(settings.database_url, future=True)
        SessionLocal.configure(bind=_engine)
    return _engine


def ensure_database_exists() -> None:
    settings = get_settings()
    url = make_url(settings.database_url)

    if not url.drivername.startswith("postgresql"):
        return

    target_db = url.database or settings.pg_database
    if not target_db:
        return

    maintenance_db = settings.pg_maintenance_db or "postgres"
    maintenance_url = url.set(database=maintenance_db)
    maintenance_engine = create_engine(maintenance_url, future=True, isolation_level="AUTOCOMMIT")

    with maintenance_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": target_db},
        ).scalar_one_or_none()
        if exists:
            return

        if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", target_db):
            raise ValueError(f"Invalid database name: {target_db}")

        conn.execute(text(f'CREATE DATABASE "{target_db}"'))


def init_db() -> None:
    ensure_database_exists()
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    _ensure_product_category_columns(engine)


def _ensure_product_category_columns(engine: Engine) -> None:
    url = engine.url
    statements: list[str]
    if url.drivername.startswith("postgresql"):
        statements = [
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS source_category VARCHAR(200)",
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS normalized_category_major VARCHAR(100)",
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS normalized_category_sub VARCHAR(150)",
        ]
    elif url.drivername.startswith("sqlite"):
        statements = [
            "ALTER TABLE products ADD COLUMN source_category VARCHAR(200)",
            "ALTER TABLE products ADD COLUMN normalized_category_major VARCHAR(100)",
            "ALTER TABLE products ADD COLUMN normalized_category_sub VARCHAR(150)",
        ]
    else:
        return

    with engine.connect() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
            except Exception:
                # SQLite는 컬럼이 이미 있으면 duplicate column 예외가 발생하므로 무시
                continue
        conn.commit()
