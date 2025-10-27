from __future__ import annotations

import io
import logging
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Sequence

import requests
from PIL import Image, ImageDraw, ImageFont

from .script_gen import Script, ScriptSegment
from .utils import ensure_directory

logger = logging.getLogger(__name__)


@dataclass
class Storyboard:
    frame_paths: List[Path]


def generate_storyboard(script: Script, config: Dict[str, object], output_dir: Path) -> Storyboard:
    ensure_directory(output_dir)
    palette = config.get("palette", {})
    backgrounds = palette.get(
        "backgrounds",
        ["#111722", "#252a3a", "#194a58", "#33224a", "#4a1f35"],
    )
    text_color = palette.get("text_color", "#ffffff")
    highlight_color = palette.get("highlight_color", "#ffd400")
    fonts_cfg = config.get("fonts", {})
    title_font = _load_font(fonts_cfg.get("primary"), size=64)
    body_font = _load_font(fonts_cfg.get("secondary"), size=54)
    use_stock = bool(config.get("use_stock", False))
    provider = str(config.get("stock_provider", "pexels")).lower()
    frame_paths: List[Path] = []
    for idx, segment in enumerate(script.segments, start=1):
        background = None
        if use_stock:
            background = _fetch_stock_background(segment, provider, config)
        if background is None:
            background = _generate_gradient_background(random.choice(backgrounds))
        canvas = background.convert("RGB").resize((1080, 1920))
        draw = ImageDraw.Draw(canvas)
        _draw_keywords_block(draw, canvas.size, segment.keywords, body_font, highlight_color)
        _draw_main_text(draw, canvas.size, segment.text, title_font, text_color, highlight_color, segment.keywords)
        frame_path = output_dir / f"frame_{idx:02d}.png"
        canvas.save(frame_path)
        frame_paths.append(frame_path)
        logger.debug("Rendered storyboard frame %s", frame_path)
    return Storyboard(frame_paths=frame_paths)


def _load_font(font_path: Optional[str], size: int) -> ImageFont.FreeTypeFont:
    if font_path and Path(font_path).exists():
        try:
            return ImageFont.truetype(font_path, size)
        except OSError as exc:
            logger.warning("Failed to load font %s: %s", font_path, exc)
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size) if Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf").exists() else ImageFont.load_default()


def _draw_main_text(
    draw: ImageDraw.ImageDraw,
    size: Sequence[int],
    text: str,
    font: ImageFont.ImageFont,
    color: str,
    highlight_color: str,
    keywords: Sequence[str],
) -> None:
    width, height = size
    x = width * 0.08
    y = height * 0.55
    max_width = width * 0.84
    line_height = _font_size(font) * 1.2
    tokens = text.split()
    current_line: List[str] = []
    for token in tokens:
        trial_line = " ".join(current_line + [token])
        if _text_width(font, trial_line) > max_width and current_line:
            _draw_line(draw, x, y, current_line, font, color, highlight_color, keywords)
            y += line_height
            current_line = [token]
        else:
            current_line.append(token)
    if current_line:
        _draw_line(draw, x, y, current_line, font, color, highlight_color, keywords)


def _draw_line(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    tokens: Sequence[str],
    font: ImageFont.ImageFont,
    color: str,
    highlight_color: str,
    keywords: Sequence[str],
) -> None:
    cursor_x = x
    for token in tokens:
        cleaned = token.strip(",.!?;:").lower()
        fill = highlight_color if cleaned in {k.lower() for k in keywords} else color
        draw.text((cursor_x, y), token + " ", font=font, fill=fill)
        cursor_x += _text_width(font, token + " ")


def _draw_keywords_block(
    draw: ImageDraw.ImageDraw,
    size: Sequence[int],
    keywords: Sequence[str],
    font: ImageFont.ImageFont,
    highlight_color: str,
) -> None:
    if not keywords:
        return
    width, _ = size
    padding = 20
    chip_padding = 16
    cursor_x = padding
    cursor_y = padding
    chip_height = _font_size(font) + chip_padding
    for keyword in keywords:
        text_width = _text_width(font, keyword)
        chip_width = text_width + chip_padding * 2
        if cursor_x + chip_width > width - padding:
            cursor_x = padding
            cursor_y += chip_height + 10
        draw.rounded_rectangle(
            (cursor_x, cursor_y, cursor_x + chip_width, cursor_y + chip_height),
            radius=24,
            fill=highlight_color,
        )
        draw.text((cursor_x + chip_padding, cursor_y + chip_padding / 2), keyword, font=font, fill="#000000")
        cursor_x += chip_width + 10


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


def _generate_gradient_background(base_color: str) -> Image.Image:
    width, height = 1080, 1920
    base = Image.new("RGB", (width, height), base_color)
    overlay = Image.new("RGB", (width, height), "#000000")
    mask = Image.linear_gradient("L").resize((width, height))
    blended = Image.composite(base, overlay, mask)
    return blended


def _fetch_stock_background(segment: ScriptSegment, provider: str, config: Dict[str, object]) -> Optional[Image.Image]:
    if provider not in {"pexels", "pixabay"}:
        return None
    api_key_env = {
        "pexels": "PEXELS_API_KEY",
        "pixabay": "PIXABAY_API_KEY",
    }[provider]
    api_key = config.get(f"{provider}_api_key")
    if not api_key:
        env_var = config.get(f"{provider}_api_key_env")
        if env_var:
            from os import getenv

            api_key = getenv(str(env_var))
    if not api_key:
        logger.debug("No API key provided for %s; skipping stock lookup", provider)
        return None
    headers = {"Authorization": api_key} if provider == "pexels" else {}
    if provider == "pexels":
        url = "https://api.pexels.com/v1/search"
        params = {"query": segment.keywords[0] if segment.keywords else segment.text[:20], "per_page": 1, "orientation": "portrait"}
    else:
        url = "https://pixabay.com/api/"
        params = {
            "key": api_key,
            "q": segment.keywords[0] if segment.keywords else segment.text,
            "image_type": "photo",
            "orientation": "vertical",
            "per_page": 3,
        }
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        if provider == "pexels":
            photos = data.get("photos", [])
            if not photos:
                return None
            image_url = photos[0]["src"].get("large2x") or photos[0]["src"].get("large")
        else:
            hits = data.get("hits", [])
            if not hits:
                return None
            image_url = hits[0].get("largeImageURL")
        if not image_url:
            return None
        img_response = requests.get(image_url, timeout=10)
        img_response.raise_for_status()
        return Image.open(io.BytesIO(img_response.content))
    except Exception as exc:  # pragma: no cover - network dependent
        logger.warning("Stock media lookup failed: %s", exc)
        return None
