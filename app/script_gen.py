from __future__ import annotations

import logging
import random
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

logger = logging.getLogger(__name__)


@dataclass
class ScriptSegment:
    text: str
    keywords: List[str]
    duration_seconds: float


@dataclass
class Script:
    topic: str
    lang: str
    segments: List[ScriptSegment]

    @property
    def total_duration(self) -> float:
        return sum(segment.duration_seconds for segment in self.segments)

    @property
    def full_text(self) -> str:
        return " ".join(segment.text for segment in self.segments)


class ScriptGenerator:
    """Generate lightweight Shorts scripts with predictable timing."""

    def __init__(self, config: dict) -> None:
        script_cfg = config.get("scripts", {})
        self.max_duration_seconds = script_cfg.get("max_duration_seconds", 58)
        self.words_per_minute = script_cfg.get("speech_rate_wpm", 155)
        self.template_dir = Path(config.get("config_dir", "config")) / "prompts"
        compliance_cfg = config.get("compliance", {})
        self.banned_words = {w.lower() for w in compliance_cfg.get("banned_words", [])}
        self.banned_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in compliance_cfg.get("banned_patterns", [])]

    def generate(self, topic: str, lang: str = "en") -> Script:
        logger.info("Generating script for topic '%s' (%s)", topic, lang)
        sentences = list(self._build_outline(topic, lang))
        segments: List[ScriptSegment] = []
        for sentence in sentences:
            filtered = self._filter_sensitive(sentence)
            keywords = self._extract_keywords(filtered)
            duration = self._estimate_duration(filtered)
            segments.append(ScriptSegment(text=filtered, keywords=keywords, duration_seconds=duration))
        total_duration = sum(segment.duration_seconds for segment in segments)
        if total_duration > self.max_duration_seconds:
            logger.debug("Script over budget (%.2fs > %.2fs), scaling", total_duration, self.max_duration_seconds)
            scale = self.max_duration_seconds / total_duration
            for segment in segments:
                segment.duration_seconds *= scale
        return Script(topic=topic, lang=lang, segments=segments)

    # Internal helpers -------------------------------------------------

    def _build_outline(self, topic: str, lang: str) -> Iterable[str]:
        template_path = self.template_dir / f"script_{lang}.txt"
        if template_path.exists():
            logger.debug("Loading custom script template: %s", template_path)
            with template_path.open("r", encoding="utf-8") as fh:
                blocks = [line.strip() for line in fh if line.strip()]
        else:
            logger.debug("Using fallback script template for lang=%s", lang)
            blocks = self._default_template(lang)
        for block in blocks:
            yield block.format(topic=topic)

    def _default_template(self, lang: str) -> Sequence[str]:
        if lang.startswith("zh"):
            return (
                "开场：关于{topic}你知道多少？60秒告诉你。",
                "亮点一：{topic}的核心要点是什么？记住这个关键。",
                "亮点二：再告诉你一个实用技巧，马上就能用上。",
                "亮点三：如果只记住一件事，那就让它是这个超级要点。",
                "收尾：关注获取更多关于{topic}的灵感！",
            )
        return (
            "Hook: Here is what nobody tells you about {topic} in under a minute.",
            "Point 1: The first thing you need to know about {topic} is this key insight.",
            "Point 2: Here's a practical tip you can try today related to {topic}.",
            "Point 3: Remember this final takeaway so {topic} sticks with you.",
            "Outro: Follow for more bite-sized lessons on {topic}!",
        )

    def _filter_sensitive(self, text: str) -> str:
        clean_text = text
        for pattern in self.banned_patterns:
            clean_text = pattern.sub("[redacted]", clean_text)
        for banned in self.banned_words:
            clean_text = re.sub(fr"\b{re.escape(banned)}\b", "[redacted]", clean_text, flags=re.IGNORECASE)
        return clean_text

    def _estimate_duration(self, text: str) -> float:
        words = max(len(re.findall(r"[\w']+", text)), 1)
        minutes = words / max(self.words_per_minute, 80)
        duration = minutes * 60
        duration = max(duration, 2.0)
        return duration

    def _extract_keywords(self, text: str, limit: int = 3) -> List[str]:
        tokens = [token.lower() for token in re.findall(r"[\w']+", text) if len(token) > 3]
        unique = list(dict.fromkeys(tokens))
        baseline_keywords = unique[:limit]
        if not baseline_keywords and tokens:
            baseline_keywords = tokens[:limit]
        if not baseline_keywords:
            baseline_keywords = [text.split()[0]] if text else []
        random.shuffle(baseline_keywords)
        return baseline_keywords[:limit]
