from __future__ import annotations

import argparse
from datetime import datetime

from dotenv import load_dotenv

from .core.db import SessionLocal, init_db
from .services.crawl_service import MART_ORDER, crawl_once
from .services.maintenance import cleanup_legacy_products
from .services.scheduler import start_daily_scheduler

SUPPORTED_MARTS = [*MART_ORDER, "all"]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Mart product crawler")
    sub = parser.add_subparsers(dest="command", required=True)

    initdb = sub.add_parser("init-db", help="DB 생성/테이블 초기화")
    initdb.set_defaults(command="init-db")

    crawl = sub.add_parser("crawl", help="마트 크롤링 1회 실행")
    crawl.add_argument("--mart", choices=SUPPORTED_MARTS, default="all")
    crawl.add_argument("--url", required=False, help="단일 마트 테스트용 URL override")

    cleanup = sub.add_parser("cleanup-db", help="비분류/구버전 데이터 정리")
    cleanup.add_argument("--keep-unclassified", action="store_true", help="비분류 데이터 삭제하지 않고 유지")

    schedule = sub.add_parser("schedule", help="매일 정해진 시간에 크롤링")
    schedule.add_argument("--mart", choices=SUPPORTED_MARTS, default="all")
    schedule.add_argument("--url", required=False, help="단일 마트 테스트용 URL override")

    return parser


def run() -> None:
    load_dotenv()
    parser = build_parser()
    args = parser.parse_args()

    init_db()

    if args.command == "init-db":
        print("database ready")
        return

    if args.command == "crawl":
        total_count, total_inserted, total_updated = crawl_once(mart=args.mart, url=args.url)
        print(
            f"[{datetime.now().isoformat(timespec='seconds')}] "
            f"total_crawled={total_count} total_inserted={total_inserted} total_updated={total_updated}"
        )
        return

    if args.command == "cleanup-db":
        with SessionLocal() as db:
            result = cleanup_legacy_products(db, delete_unclassified=not args.keep_unclassified)
        print(f"cleanup backfilled={result.backfilled} deleted={result.deleted}")
        return

    if args.command == "schedule":
        start_daily_scheduler(mart=args.mart, category_url=args.url)
        return

    raise ValueError(f"Unknown command: {args.command}")


if __name__ == "__main__":
    run()
