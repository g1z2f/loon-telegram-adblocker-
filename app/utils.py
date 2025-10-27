from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any, Dict

import yaml

logger = logging.getLogger(__name__)


def slugify(value: str) -> str:
    """Coerce an arbitrary string into a filesystem-friendly slug."""
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\-\s]+", "", value)
    value = re.sub(r"[\-\s]+", "-", value)
    return value.strip("-") or "short"


def ensure_directory(path: Path) -> Path:
    """Ensure a directory exists and return the path."""
    path.mkdir(parents=True, exist_ok=True)
    return path


def load_yaml(path: Path) -> Dict[str, Any]:
    """Load a YAML configuration file."""
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    with path.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    logger.debug("Loaded YAML config from %s", path)
    return data


def save_yaml(path: Path, payload: Dict[str, Any]) -> None:
    """Persist a dictionary as YAML."""
    ensure_directory(path.parent)
    with path.open("w", encoding="utf-8") as fh:
        yaml.safe_dump(payload, fh, allow_unicode=True, sort_keys=False)
    logger.debug("Saved YAML to %s", path)


def save_text(path: Path, content: str) -> None:
    ensure_directory(path.parent)
    with path.open("w", encoding="utf-8") as fh:
        fh.write(content)
    logger.debug("Saved text file %s", path)


def save_json(path: Path, payload: Dict[str, Any]) -> None:
    ensure_directory(path.parent)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
    logger.debug("Saved JSON to %s", path)
