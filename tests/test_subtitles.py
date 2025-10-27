import datetime as dt

import pytest

from app.script_gen import ScriptSegment
from app.subtitles import segments_to_subtitles


def test_segments_to_subtitles_timings() -> None:
    segments = [
        ScriptSegment(text="第一段", keywords=["第一"], duration_seconds=2.5),
        ScriptSegment(text="第二段", keywords=["第二"], duration_seconds=3.0),
    ]
    subtitles = segments_to_subtitles(segments)
    assert len(subtitles) == len(segments)
    assert subtitles[0].start == dt.timedelta()
    total_seconds = sum(segment.duration_seconds for segment in segments)
    assert pytest.approx(total_seconds, rel=1e-3) == subtitles[-1].end.total_seconds()
