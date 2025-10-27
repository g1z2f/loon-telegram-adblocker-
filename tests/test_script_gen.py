from pathlib import Path

import pytest

from app.script_gen import ScriptGenerator
from app.utils import load_yaml


@pytest.fixture()
def config() -> dict:
    cfg = load_yaml(Path("config/config.yaml"))
    cfg["config_dir"] = "config"
    return cfg


def test_script_within_duration_budget(config: dict) -> None:
    generator = ScriptGenerator(config)
    script = generator.generate("人工智能趋势", lang="zh")
    assert script.total_duration <= config["scripts"]["max_duration_seconds"] + 0.5
    assert script.segments, "Script should contain segments"


def test_sensitive_word_filtering() -> None:
    custom_config = {
        "scripts": {"max_duration_seconds": 50, "speech_rate_wpm": 150},
        "compliance": {"banned_words": ["禁词"]},
        "config_dir": "config",
    }
    generator = ScriptGenerator(custom_config)
    script = generator.generate("禁词话题", lang="zh")
    assert "禁词" not in script.full_text
    assert "[redacted]" in script.full_text
