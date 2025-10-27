from __future__ import annotations

import csv
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional

from .utils import slugify

logger = logging.getLogger(__name__)

try:  # pragma: no cover - optional import
    from pytrends.request import TrendReq  # type: ignore
except Exception:  # pragma: no cover - optional import
    TrendReq = None  # type: ignore


@dataclass
class Topic:
    name: str
    lang: str = "en"
    metadata: Optional[dict] = None

    @property
    def slug(self) -> str:
        return slugify(self.name)


class TopicProvider:
    """Resolve topics from CLI flags, CSV files, or trending services."""

    def __init__(self, default_lang: str = "en") -> None:
        self.default_lang = default_lang

    def from_cli(self, topic: Optional[str], csv_path: Optional[Path]) -> List[Topic]:
        topics: List[Topic] = []
        if topic:
            topics.append(Topic(name=topic, lang=self.default_lang))
        if csv_path:
            topics.extend(self._from_csv(csv_path))
        if not topics:
            raise ValueError("No topics provided. Use --topic or --csv")
        logger.info("Loaded %s topic(s)", len(topics))
        return topics

    def _from_csv(self, path: Path) -> Iterable[Topic]:
        if not path.exists():
            raise FileNotFoundError(f"CSV path does not exist: {path}")
        logger.debug("Loading topics from CSV: %s", path)
        with path.open("r", encoding="utf-8-sig") as fh:
            reader = csv.DictReader(fh)
            if "topic" not in reader.fieldnames:
                raise ValueError("CSV must contain a 'topic' column")
            for row in reader:
                topic_value = (row.get("topic") or "").strip()
                if not topic_value:
                    continue
                lang = (row.get("lang") or self.default_lang).strip()
                metadata = {k: v for k, v in row.items() if k not in {"topic", "lang"}}
                yield Topic(name=topic_value, lang=lang or self.default_lang, metadata=metadata)

    def trending(self, lang: Optional[str] = None, region: str = "united_states", limit: int = 5) -> List[Topic]:
        """Fetch lightweight trending topics via pytrends if available."""
        if TrendReq is None:
            logger.warning("pytrends is not installed; skipping trending topics fetch")
            return []
        language = lang or self.default_lang
        try:
            pytrends = TrendReq(hl=language, tz=360)
            df = pytrends.trending_searches(pn=region)  # type: ignore[arg-type]
        except Exception as exc:  # pragma: no cover - dependent on network
            logger.warning("Failed to fetch trending topics: %s", exc)
            return []
        topics: List[Topic] = []
        for _, row in df.head(limit).iterrows():  # type: ignore[call-arg]
            name = str(row[0])
            topics.append(Topic(name=name, lang=language))
        logger.info("Fetched %s trending topics via pytrends", len(topics))
        return topics
