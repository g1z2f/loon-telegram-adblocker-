from app.metadata import MetadataGenerator
from app.script_gen import Script, ScriptSegment


def test_metadata_generation_produces_variants() -> None:
    config = {
        "metadata": {"tag_count": 5, "hashtag_prefix": "#"},
        "compliance": {"banned_words": ["禁词"], "banned_hashtags": ["#forbidden"]},
    }
    generator = MetadataGenerator(config)
    script = Script(
        topic="生成式 AI",
        lang="zh",
        segments=[
            ScriptSegment(text="介绍禁词", keywords=["生成式", "AI"], duration_seconds=2.2),
            ScriptSegment(text="亮点", keywords=["亮点"], duration_seconds=2.5),
        ],
    )
    metadata = generator.build(script, schedule_time=None)
    assert len(metadata.titles) >= 2
    assert all("禁词" not in title for title in metadata.titles)
    assert metadata.hashtags
    assert len(metadata.tags) <= 5
