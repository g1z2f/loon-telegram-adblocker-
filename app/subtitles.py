from __future__ import annotations

import datetime as dt
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

import srt

from .script_gen import Script, ScriptSegment
from .utils import ensure_directory

logger = logging.getLogger(__name__)


@dataclass
class SubtitleBundle:
    subtitles: List[srt.Subtitle]
    srt_text: str
    path: Path


def segments_to_subtitles(segments: Iterable[ScriptSegment]) -> List[srt.Subtitle]:
    subs: List[srt.Subtitle] = []
    cursor = dt.timedelta()
    for idx, segment in enumerate(segments, start=1):
        start = cursor
        cursor += dt.timedelta(seconds=segment.duration_seconds)
        end = cursor
        content = segment.text.strip()
        subs.append(srt.Subtitle(index=idx, start=start, end=end, content=content))
    return subs


def write_subtitles(script: Script, output_path: Path) -> SubtitleBundle:
    ensure_directory(output_path.parent)
    subtitles = segments_to_subtitles(script.segments)
    srt_text = srt.compose(subtitles)
    with output_path.open("w", encoding="utf-8") as fh:
        fh.write(srt_text)
    logger.debug("Wrote subtitles to %s", output_path)
    return SubtitleBundle(subtitles=subtitles, srt_text=srt_text, path=output_path)
