from __future__ import annotations

import argparse
import logging
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

from .compose import compose_video
from .media import generate_storyboard
from .metadata import MetadataGenerator
from .script_gen import Script, ScriptGenerator
from .subtitles import write_subtitles
from .thumbnail import generate_thumbnails
from .topics import TopicProvider
from .tts import tts_factory
from .uploader import YouTubeUploader
from .utils import ensure_directory, load_yaml, save_json, save_text

logger = logging.getLogger(__name__)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="YouTube Shorts automation pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)

    shorts = subparsers.add_parser("shorts", help="Generate Shorts content")
    shorts.add_argument("--topic", type=str, help="Topic to generate")
    shorts.add_argument("--csv", type=str, help="CSV file with topic column")
    shorts.add_argument("--upload", action="store_true", help="Upload the resulting video")
    shorts.add_argument("--schedule", type=str, help="ISO datetime for scheduled publishing")
    shorts.add_argument("--lang", type=str, default="zh", help="Language code for generation")
    shorts.add_argument("--no-bgm", action="store_true", help="Disable background music")
    shorts.add_argument("--no-stock", action="store_true", help="Disable stock media lookup")
    shorts.add_argument("--tts", type=str, choices=["piper", "mock", "local", "coqui", "cloud"], help="Override TTS engine")
    shorts.add_argument("--config", type=str, default="config/config.yaml", help="Config file path")
    shorts.add_argument("--output-dir", type=str, help="Override output directory root")

    return parser


def main(argv: Optional[List[str]] = None) -> None:
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    load_dotenv()
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "shorts":
        run_shorts_pipeline(args)
    else:  # pragma: no cover - future commands
        parser.error(f"Unknown command {args.command}")


def run_shorts_pipeline(args: argparse.Namespace) -> None:
    config_path = Path(args.config)
    config = load_yaml(config_path)
    config["config_dir"] = str(config_path.parent)

    if args.no_bgm:
        config.setdefault("audio", {}).setdefault("bgm", {})["enabled"] = False
    if args.no_stock:
        config.setdefault("media", {})["use_stock"] = False
    if args.tts:
        config.setdefault("tts", {})["engine"] = args.tts

    provider = TopicProvider(default_lang=args.lang)
    topics = provider.from_cli(args.topic, Path(args.csv) if args.csv else None)

    defaults = config.get("defaults", {})
    output_root = Path(args.output_dir or defaults.get("output_dir", "outputs"))

    script_gen = ScriptGenerator(config)
    tts_engine = tts_factory(config.get("tts", {}))
    metadata_gen = MetadataGenerator(config)
    uploader: Optional[YouTubeUploader] = YouTubeUploader(config) if args.upload else None

    for topic in topics:
        topic_output_dir = ensure_directory(output_root / topic.slug)
        logger.info("Processing topic '%s'", topic.name)
        script = script_gen.generate(topic.name, lang=topic.lang or args.lang)
        _persist_script(script, topic_output_dir)

        audio_dir = ensure_directory(topic_output_dir / "audio")
        voiceover = tts_engine.synthesize(script, audio_dir)

        frames_dir = ensure_directory(topic_output_dir / "frames")
        storyboard = generate_storyboard(script, config.get("media", {}), frames_dir)

        subtitles_dir = ensure_directory(topic_output_dir / "subtitles")
        subtitle_bundle = write_subtitles(script, subtitles_dir / "captions.srt")

        video_dir = ensure_directory(topic_output_dir / "video")
        compose_cfg = {"video": config.get("video", {}), "audio": config.get("audio", {})}
        video_result = compose_video(script, storyboard, voiceover, compose_cfg, video_dir)

        thumb_dir = ensure_directory(topic_output_dir / "thumbnails")
        key_phrases: List[str] = []
        for segment in script.segments:
            key_phrases.extend(segment.keywords)
        thumbnail_result = generate_thumbnails(script.topic, key_phrases, config.get("media", {}), thumb_dir)

        metadata = metadata_gen.build(script, args.schedule)
        save_json(topic_output_dir / "metadata.json", metadata.to_dict())

        logger.info("Video ready at %s", video_result.video_path)

        if uploader:
            upload_result = uploader.upload(
                video_result.video_path,
                metadata,
                thumbnail_result.paths,
                schedule_time=args.schedule,
                privacy_status=config.get("uploader", {}).get("default_privacy"),
            )
            logger.info("Uploaded video: %s", upload_result.url)
            print(upload_result.url or "Upload failed")
        else:
            print(video_result.video_path)


def _persist_script(script: Script, output_dir: Path) -> None:
    ensure_directory(output_dir)
    save_text(output_dir / "script.txt", script.full_text)


if __name__ == "__main__":
    main()
