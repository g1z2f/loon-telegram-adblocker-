from __future__ import annotations

import logging
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Sequence

from PIL import Image, ImageDraw, ImageFont

from .utils import ensure_directory

logger = logging.getLogger(__name__)


@dataclass
class ThumbnailResult:
    paths: List[Path]


def generate_thumbnails(
    topic: str,
    key_phrases: Sequence[str],
    config: Dict[str, object],
    output_dir: Path,
) -> ThumbnailResult:
    ensure_directory(output_dir)
    palette = config.get("palette", {})
    backgrounds = palette.get("backgrounds", ["#111722", "#2f164d", "#0f3b3d", "#3b1427"])
    accent = palette.get("highlight_color", "#ffd400")
    text_color = palette.get("text_color", "#ffffff")
    fonts_cfg = config.get("fonts", {})
    headline_font = _load_font(fonts_cfg.get("primary"), 160)
    sub_font = _load_font(fonts_cfg.get("secondary"), 96)

    phrases = list(key_phrases[:2])
    if len(phrases) < 2:
        phrases.append(topic)

    thumbnails: List[Path] = []
    palette_cycle = backgrounds if backgrounds else ["#121212"]
    for idx in range(2):
        background = palette_cycle[idx % len(palette_cycle)]
        canvas = Image.new("RGB", (1080, 1920), background)
        draw = ImageDraw.Draw(canvas)
        _draw_border(draw, canvas.size, accent)
        _draw_headline(draw, canvas.size, topic, headline_font, text_color, accent, idx)
        _draw_subline(draw, canvas.size, phrases[idx % len(phrases)], sub_font, text_color)
        path = output_dir / f"thumbnail_{idx + 1}.png"
        canvas.save(path)
        thumbnails.append(path)
        logger.debug("Generated thumbnail %s", path)
    return ThumbnailResult(paths=thumbnails)


def _load_font(font_path: str | None, size: int) -> ImageFont.ImageFont:
    if font_path and Path(font_path).exists():
        try:
            return ImageFont.truetype(font_path, size)
        except OSError as exc:
            logger.warning("Failed to load thumbnail font %s: %s", font_path, exc)
    fallback = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-ExtraBold.ttf")
    if fallback.exists():
        return ImageFont.truetype(str(fallback), size)
    return ImageFont.load_default()


def _draw_border(draw: ImageDraw.ImageDraw, size: Sequence[int], color: str) -> None:
    width, height = size
    thickness = 30
    draw.rectangle([(0, 0), (width, height)], outline=color, width=thickness)


def _draw_headline(
    draw: ImageDraw.ImageDraw,
    size: Sequence[int],
    text: str,
    font: ImageFont.ImageFont,
    text_color: str,
    accent_color: str,
    index: int,
) -> None:
    width, _ = size
    text = text.upper()
    max_width = width * 0.9
    wrapped = _wrap_text(text, font, max_width)
    start_y = 300
    step = _font_size(font) * 1.05
    for line in wrapped:
        fill = accent_color if index % 2 == 0 else text_color
        draw.text((_centered_x(font, line, width), start_y), line, font=font, fill=fill)
        start_y += step


def _draw_subline(draw: ImageDraw.ImageDraw, size: Sequence[int], text: str, font: ImageFont.ImageFont, color: str) -> None:
    width, _ = size
    text = text.upper()
    y = 1100
    draw.text((_centered_x(font, text, width), y), text, font=font, fill=color)


def _wrap_text(text: str, font: ImageFont.ImageFont, max_width: float) -> List[str]:
    words = text.split()
    lines: List[str] = []
    current: List[str] = []
    for word in words:
        candidate = " ".join(current + [word])
        if _text_width(font, candidate) > max_width and current:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def _centered_x(font: ImageFont.ImageFont, text: str, width: float) -> float:
    return (width - _text_width(font, text)) / 2


def _font_size(font: ImageFont.ImageFont) -> float:
    if hasattr(font, "size"):
        return float(getattr(font, "size"))
    bbox = font.getbbox("Ag")
    return float(bbox[3] - bbox[1])


def _text_width(font: ImageFont.ImageFont, text: str) -> float:
    if hasattr(font, "getlength"):
        return float(font.getlength(text))
    bbox = font.getbbox(text)
    return float(bbox[2] - bbox[0])
