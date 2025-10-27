from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Dict, List, Optional

from .script_gen import Script

logger = logging.getLogger(__name__)


@dataclass
class MetadataBundle:
    titles: List[str]
    description: str
    tags: List[str]
    hashtags: List[str]
    schedule_time: Optional[str]

    def to_dict(self) -> Dict[str, object]:
        return {
            "titles": self.titles,
            "description": self.description,
            "tags": self.tags,
            "hashtags": self.hashtags,
            "schedule_time": self.schedule_time,
        }


class MetadataGenerator:
    def __init__(self, config: Dict[str, object]) -> None:
        metadata_cfg = config.get("metadata", {})
        compliance_cfg = config.get("compliance", {})
        self.tag_count = int(metadata_cfg.get("tag_count", 15))
        self.hashtag_prefix = metadata_cfg.get("hashtag_prefix", "#")
        self.banned_words = {w.lower() for w in compliance_cfg.get("banned_words", [])}
        self.banned_hashtags = {h.lower() for h in compliance_cfg.get("banned_hashtags", [])}

    def build(self, script: Script, schedule_time: Optional[str]) -> MetadataBundle:
        titles = self._generate_titles(script)
        description = self._generate_description(script)
        tags = self._generate_tags(script)
        hashtags = self._generate_hashtags(tags)
        logger.debug("Generated metadata titles=%s", titles)
        return MetadataBundle(
            titles=titles,
            description=description,
            tags=tags,
            hashtags=hashtags,
            schedule_time=schedule_time,
        )

    # Internal helpers -------------------------------------------------

    def _generate_titles(self, script: Script) -> List[str]:
        topic = script.topic
        primary = f"{topic}：必知的 3 个快速秘诀"
        alternative = f"{topic} in 60 秒：你现在就能上手" if not script.lang.startswith("zh") else f"一分钟了解 {topic}"
        curiosity = f"Nobody told you this about {topic}" if not script.lang.startswith("zh") else f"没人告诉你的 {topic} 秘密"
        titles = [self._sanitize(primary), self._sanitize(alternative)]
        if curiosity.lower() not in {title.lower() for title in titles}:
            titles.append(self._sanitize(curiosity))
        return titles

    def _generate_description(self, script: Script) -> str:
        summary_lines = [segment.text for segment in script.segments]
        bullet_points = "\n".join(f"- {self._sanitize(line)}" for line in summary_lines)
        call_to_action = "订阅获取更多灵感 🔔" if script.lang.startswith("zh") else "Subscribe for more daily insights 🔔"
        return f"{self._sanitize(script.topic)} Shorts\n\n{bullet_points}\n\n{call_to_action}"

    def _generate_tags(self, script: Script) -> List[str]:
        tags: List[str] = []
        for segment in script.segments:
            for keyword in segment.keywords:
                clean = self._sanitize(keyword)
                if clean and clean.lower() not in self.banned_words:
                    tags.append(clean.replace(" ", ""))
        tags.append(self._sanitize(script.topic).replace(" ", ""))
        unique_tags = list(dict.fromkeys(tag for tag in tags if tag))
        return unique_tags[: self.tag_count]

    def _generate_hashtags(self, tags: List[str]) -> List[str]:
        hashtags: List[str] = []
        for tag in tags:
            candidate = f"{self.hashtag_prefix}{tag.lower()}"
            if candidate.lower() in self.banned_hashtags:
                continue
            hashtags.append(candidate)
        return hashtags[: self.tag_count]

    def _sanitize(self, text: str) -> str:
        lowered = text.strip()
        for banned in self.banned_words:
            lowered = lowered.replace(banned, "")
        return " ".join(lowered.split())
