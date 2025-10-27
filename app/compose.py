from __future__ import annotations

import logging
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Sequence

import numpy as np
from moviepy.editor import (
    AudioFileClip,
    CompositeVideoClip,
    ImageClip,
    VideoClip,
    concatenate_videoclips,
)
from pydub import AudioSegment
from pydub.generators import Sine

from .media import Storyboard
from .script_gen import Script
from .tts import VoiceoverResult
from .utils import ensure_directory

logger = logging.getLogger(__name__)


@dataclass
class VideoComposeResult:
    video_path: Path
    audio_path: Path
    duration: float


# Public API -----------------------------------------------------------

def compose_video(
    script: Script,
    storyboard: Storyboard,
    voiceover: VoiceoverResult,
    config: Dict[str, object],
    output_dir: Path,
) -> VideoComposeResult:
    video_cfg = config.get("video", {})
    audio_cfg = config.get("audio", {})
    fps = int(video_cfg.get("fps", 30))
    resolution_cfg = video_cfg.get("resolution", {"width": 1080, "height": 1920})
    resolution = (int(resolution_cfg.get("width", 1080)), int(resolution_cfg.get("height", 1920)))
    ensure_directory(output_dir)

    logger.info("Compositing %s segments into final video", len(script.segments))
    segments_clips = _build_segment_clips(script, storyboard, resolution)
    base_clip = concatenate_videoclips(segments_clips, method="compose")

    progress_clip = _create_progress_bar_clip(base_clip.duration, resolution, video_cfg)
    watermark_clip = _create_watermark_clip(resolution, video_cfg)

    composite_layers = [base_clip, progress_clip]
    if watermark_clip is not None:
        composite_layers.append(watermark_clip)

    duration = base_clip.duration
    composite = CompositeVideoClip(composite_layers, size=resolution)

    audio_mix_path = _build_audio_mix(voiceover, audio_cfg, output_dir, duration)
    audio_clip = AudioFileClip(str(audio_mix_path))
    composite = composite.set_audio(audio_clip)

    video_path = output_dir / "short.mp4"
    logger.info("Writing video to %s", video_path)
    composite.write_videofile(
        str(video_path),
        fps=fps,
        codec="libx264",
        preset="medium",
        audio_codec="aac",
        threads=2,
        logger=None,
    )
    composite.close()
    base_clip.close()
    audio_clip.close()
    for clip in segments_clips:
        clip.close()
    progress_clip.close()
    if watermark_clip is not None:
        watermark_clip.close()
    return VideoComposeResult(video_path=video_path, audio_path=audio_mix_path, duration=duration)


# Internal helpers -----------------------------------------------------

def _build_segment_clips(script: Script, storyboard: Storyboard, resolution: Sequence[int]):
    clips = []
    for segment, frame_path in zip(script.segments, storyboard.frame_paths):
        clip = ImageClip(str(frame_path)).set_duration(segment.duration_seconds)
        clip = clip.resize(newsize=resolution)
        clips.append(clip)
    return clips


def _create_progress_bar_clip(duration: float, resolution: Sequence[int], config: Dict[str, object]) -> VideoClip:
    colors = config.get("progress_bar", {})
    bar_height = int(colors.get("height", 18))
    margin = int(colors.get("margin", 40))
    fill_color = _hex_to_rgb_tuple(colors.get("fill_color", "#ffd400"))
    background = _hex_to_rgb_tuple(colors.get("background", "#1a1a1a"))

    def make_frame(t: float) -> np.ndarray:
        progress = min(max(t / max(duration, 0.001), 0.0), 1.0)
        return progress_frame(progress, resolution, bar_height, margin, fill_color, background)

    clip = VideoClip(make_frame=make_frame, duration=duration)
    clip = clip.set_position((margin, resolution[1] - margin - bar_height))
    return clip


def _create_watermark_clip(resolution: Sequence[int], config: Dict[str, object]):
    watermark_cfg = config.get("watermark", {})
    text = watermark_cfg.get("text")
    if not text:
        return None
    opacity = float(watermark_cfg.get("opacity", 0.6))
    color = _hex_to_rgb_tuple(watermark_cfg.get("color", "#ffffff"), alpha=int(255 * opacity))
    from PIL import Image, ImageDraw, ImageFont

    width, height = resolution
    img = Image.new("RGBA", (int(width * 0.4), 120), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48) if Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf").exists() else ImageFont.load_default()
    draw.text((20, 30), text, fill=color, font=font)
    clip = ImageClip(np.array(img)).set_duration(9999)
    position = watermark_cfg.get("position", "bottom-right")
    offsets = {
        "bottom-right": (width - img.width - 40, height - img.height - 40),
        "bottom-left": (40, height - img.height - 40),
        "top-right": (width - img.width - 40, 40),
        "top-left": (40, 40),
    }
    clip = clip.set_position(offsets.get(position, offsets["bottom-right"]))
    return clip


def _build_audio_mix(voiceover: VoiceoverResult, config: Dict[str, object], output_dir: Path, target_duration: float) -> Path:
    ensure_directory(output_dir)
    voice = AudioSegment.from_file(voiceover.audio_path)
    voice = voice.set_frame_rate(int(config.get("sample_rate", 44100)))
    voice = voice.set_channels(2)
    logger.debug("Voice duration %.2fs", voice.duration_seconds)

    bgm_cfg = config.get("bgm", {})
    if not bool(bgm_cfg.get("enabled", True)):
        logger.info("BGM disabled; using narration only")
        mixed = voice
    else:
        bgm = _load_bgm(bgm_cfg, duration=target_duration)
        mixed = _auto_duck(voice, bgm, bgm_cfg)

    audio_path = output_dir / "audio_mix.wav"
    mixed.export(audio_path, format="wav")
    return audio_path


def _load_bgm(config: Dict[str, object], duration: float) -> AudioSegment:
    library_dir = Path(config.get("library_dir", "assets/bgm"))
    candidates = sorted(list(library_dir.glob("*.mp3"))) + sorted(list(library_dir.glob("*.wav")))
    if candidates:
        track_path = random.choice(candidates)
        logger.debug("Using BGM track %s", track_path)
        track = AudioSegment.from_file(track_path)
    else:
        logger.debug("No BGM assets found, generating synthetic bed")
        track = _generate_bgm(duration)
    return _loop_audio(track, duration)


def _generate_bgm(duration: float) -> AudioSegment:
    tone = Sine(110).to_audio_segment(duration=int(duration * 1000)).apply_gain(-18)
    arp = Sine(220).to_audio_segment(duration=int(duration * 1000)).apply_gain(-24)
    return tone.overlay(arp)


def _loop_audio(audio: AudioSegment, duration: float) -> AudioSegment:
    target_ms = int(duration * 1000)
    if len(audio) >= target_ms:
        return audio[:target_ms]
    looped = audio
    while len(looped) < target_ms:
        looped += audio
    return looped[:target_ms]


def _auto_duck(voice: AudioSegment, bgm: AudioSegment, config: Dict[str, object]) -> AudioSegment:
    reduction_db = float(config.get("ducking_reduction_db", 15))
    target_dbfs = float(config.get("target_dbfs", -18.0))
    bgm = bgm.set_channels(2)
    bgm = bgm - abs(reduction_db)
    voice_level = voice.dBFS if voice.dBFS != float("-inf") else -14.0
    gain_correction = target_dbfs - voice_level
    bgm = bgm.apply_gain(gain_correction)
    mixed = bgm.overlay(voice)
    return mixed


def _hex_to_rgb_tuple(color: str, alpha: int | None = None) -> tuple:
    color = color.lstrip("#")
    if len(color) == 3:
        color = "".join(c * 2 for c in color)
    r, g, b = (int(color[i : i + 2], 16) for i in range(0, 6, 2))
    if alpha is not None:
        return (r, g, b, alpha)
    return (r, g, b)


def progress_frame(
    progress: float,
    resolution: Sequence[int],
    bar_height: int,
    margin: int,
    fill_color: Sequence[int],
    background: Sequence[int],
) -> np.ndarray:
    width, _ = resolution
    bar_width = max(width - margin * 2, 10)
    filled = int(bar_width * progress)
    frame = np.zeros((bar_height, bar_width, 3), dtype=np.uint8)
    frame[:] = background[:3]
    if filled > 0:
        frame[:, :filled] = fill_color[:3]
    return frame
