from __future__ import annotations

from typing import Optional

from apscheduler.schedulers.blocking import BlockingScheduler

from ..core.config import get_settings
from ..core.db import init_db
from .crawl_service import crawl_once


def run_job(mart: str = "all", category_url: Optional[str] = None) -> tuple[int, int, int]:
    init_db()
    return crawl_once(mart=mart, url=category_url)


def start_daily_scheduler(mart: str = "all", category_url: Optional[str] = None) -> None:
    settings = get_settings()

    scheduler = BlockingScheduler(timezone=settings.timezone)
    scheduler.add_job(
        run_job,
        trigger="cron",
        hour=settings.schedule_hour,
        minute=settings.schedule_minute,
        kwargs={"mart": mart, "category_url": category_url},
        id=f"{mart}-daily-crawl",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )

    print(
        f"Scheduler started: mart={mart} daily {settings.schedule_hour:02d}:{settings.schedule_minute:02d} "
        f"({settings.timezone})"
    )
    scheduler.start()


if __name__ == "__main__":
    count, inserted, updated = run_job(mart="all")
    print(f"total_crawled={count} total_inserted={inserted} total_updated={updated}")
