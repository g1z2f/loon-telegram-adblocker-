from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

from pydub import AudioSegment
from pydub.generators import Sine

from .script_gen import Script, ScriptSegment
from .utils import ensure_directory

logger = logging.getLogger(__name__)


@dataclass
class VoiceSegment:
    text: str
    start: float
    end: float


@dataclass
class VoiceoverResult:
    audio_path: Path
    segments: List[VoiceSegment]
    total_duration: float


class BaseTTS:
    def __init__(self, config: Dict[str, object]):
        self.config = config
        self.sample_rate = int(config.get("sample_rate", 22050))
        self.voice = str(config.get("voice", "default"))
        self.cache_dir = ensure_directory(Path(config.get("cache_dir", "outputs/cache/tts")))

    def synthesize(self, script: Script, output_dir: Path) -> VoiceoverResult:
        raise NotImplementedError


class MockPiperTTS(BaseTTS):
    """A lightweight offline TTS fallback producing tonal speech-like audio."""

    def __init__(self, config: Dict[str, object]):
        super().__init__(config)
        self.words_per_minute = float(config.get("words_per_minute", 155))
        self.padding_ms = int(config.get("padding_ms", 120))

    def synthesize(self, script: Script, output_dir: Path) -> VoiceoverResult:
        ensure_directory(output_dir)
        cache_key = self._cache_key(script)
        cached = self.cache_dir / f"{cache_key}.wav"
        if cached.exists():
            logger.debug("Using cached TTS audio: %s", cached)
            audio = AudioSegment.from_file(cached)
            voice_segments = self._segments_from_durations(script, audio)
            target = output_dir / cached.name
            audio.export(target, format="wav")
            return VoiceoverResult(audio_path=target, segments=voice_segments, total_duration=audio.duration_seconds)
        logger.info("Synthesizing fallback TTS for topic '%s'", script.topic)
        timeline = AudioSegment.silent(duration=0)
        cursor_ms = 0
        voice_segments: List[VoiceSegment] = []
        for index, segment in enumerate(script.segments):
            spoken = self._render_segment(segment)
            timeline += spoken
            voice_segments.append(
                VoiceSegment(
                    text=segment.text,
                    start=cursor_ms / 1000.0,
                    end=(cursor_ms + len(spoken)) / 1000.0,
                )
            )
            cursor_ms += len(spoken)
            if index < len(script.segments) - 1:
                timeline += AudioSegment.silent(duration=self.padding_ms)
                cursor_ms += self.padding_ms
        ensure_directory(self.cache_dir)
        timeline.export(cached, format="wav")
        target = output_dir / cached.name
        timeline.export(target, format="wav")
        return VoiceoverResult(audio_path=target, segments=voice_segments, total_duration=timeline.duration_seconds)

    def _cache_key(self, script: Script) -> str:
        digest = hashlib.sha256()
        digest.update(script.full_text.encode("utf-8"))
        digest.update(self.voice.encode("utf-8"))
        return digest.hexdigest()

    def _render_segment(self, segment: ScriptSegment) -> AudioSegment:
        duration_seconds = max(segment.duration_seconds, 1.5)
        frequency = 200 + (hash(segment.text) % 400)
        tone = Sine(frequency).to_audio_segment(duration=int(duration_seconds * 1000), sample_rate=self.sample_rate)
        tone = tone.fade_in(30).fade_out(50)
        emphasis_gain = max(-6.0, -12.0 + len(segment.keywords) * 1.5)
        tone = tone.apply_gain(emphasis_gain)
        return tone

    def _segments_from_durations(self, script: Script, audio: AudioSegment) -> List[VoiceSegment]:
        voice_segments: List[VoiceSegment] = []
        cursor_ms = 0
        segment_durations = [max(segment.duration_seconds, 1.5) * 1000 for segment in script.segments]
        for index, (segment, duration_ms) in enumerate(zip(script.segments, segment_durations)):
            voice_segments.append(
                VoiceSegment(
                    text=segment.text,
                    start=cursor_ms / 1000.0,
                    end=(cursor_ms + duration_ms) / 1000.0,
                )
            )
            cursor_ms += duration_ms
            if index < len(script.segments) - 1:
                cursor_ms += self.padding_ms
        return voice_segments


def tts_factory(config: Dict[str, object]) -> BaseTTS:
    engine = str(config.get("engine", "piper")).lower()
    logger.debug("Initializing TTS engine '%s'", engine)
    if engine in {"piper", "mock", "local"}:
        return MockPiperTTS(config)
    raise ValueError(f"Unsupported TTS engine: {engine}")
