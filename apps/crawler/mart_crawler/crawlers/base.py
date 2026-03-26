from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable

from ..domain.schemas import CrawledProduct


class BaseMartCrawler(ABC):
    mart_name: str

    @abstractmethod
    def crawl(self) -> Iterable[CrawledProduct]:
        raise NotImplementedError
