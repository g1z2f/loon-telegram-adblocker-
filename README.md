# YouTube Shorts Automation MVP

Automate the production and upload of vertical YouTube Shorts (≤ 60 seconds) from a single topic. This repository provides an end-to-end Python 3.11 pipeline covering script generation, synthetic TTS, storyboard creation, video compositing, thumbnail design, metadata authoring and optional YouTube upload.

> **Goal:** High repeatability (PMR), low marginal cost (< $0.05 per video on default settings), minimal manual intervention.

## ✨ Key Features

- **Topic ingestion** via CLI argument or CSV batch list (with optional pytrends integration).
- **Rule-based script generator** with configurable templates, duration control and compliance filtering.
- **Offline-friendly TTS** implemented with a lightweight Piper-style synthesizer fallback (tone-based envelope) plus hooks for local or cloud providers.
- **Media synthesis** with Pillow based storyboard frames, optional Pexels/Pixabay stock lookup, keyword highlight pills and brand watermark.
- **Video composition** using MoviePy (1080×1920, 30 fps) including burned-in captions, animated progress bar and background music with automatic ducking.
- **Subtitle export** in SRT for accessibility and later reuse.
- **Dual thumbnail generation** with high-contrast typography.
- **Metadata authoring** (multiple title variants, description, tags and hashtags) ready for upload.
- **YouTube Data API v3 upload** with OAuth token caching, private scheduling support and thumbnail attachment.
- **Container Ready**: Dockerfile + docker-compose (optional) to standardise runtime, plus `.env.example`.
- **Quality toolchain**: `black`, `ruff`, `pytest` with representative unit tests.

## 🗂️ Project Layout

```
app/
  __main__.py          # python -m app entry
  main.py              # CLI orchestrator
  topics.py            # topic ingestion (CLI, CSV, pytrends)
  script_gen.py        # script + segment generator
  tts.py               # TTS abstraction + Piper-like fallback
  media.py             # storyboard image synthesis / stock ingestion
  compose.py           # MoviePy composition, progress bar, ducking
  subtitles.py         # SRT generation helpers
  thumbnail.py         # dual thumbnail renderer
  metadata.py          # title/description/tags builder
  uploader.py          # YouTube API client
  utils.py             # shared helpers
config/
  config.yaml          # master configuration
  prompts/             # language specific script templates
assets/bgm/            # place optional royalty-free bgm tracks
outputs/               # default rendering/output root
```

Tests live under `tests/` and cover script budgeting, subtitle timing, metadata creation and progress bar rendering.

## 🚀 Quick Start

### 1. Install System Dependencies

Ensure **Python 3.11+** and **ffmpeg** are available.

macOS (Homebrew):

```bash
brew install python@3.11 ffmpeg
```

Ubuntu / Debian:

```bash
sudo apt-get update && sudo apt-get install -y python3.11 python3.11-venv ffmpeg
```

### 2. Clone & Install Python Dependencies

```bash
git clone <repo-url>
cd <repo>
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements-dev.txt
```

### 3. Configure Environment

1. Copy `.env.example` → `.env` and fill optional API keys.
2. Review `config/config.yaml` for defaults (TTS engine, palette, watermark, BGM library, compliance lists, uploader settings).
3. (Optional) Drop royalty-free background music tracks (mp3/wav) into `assets/bgm/`.

### 4. Obtain YouTube OAuth Credentials (Optional Upload)

1. Visit [Google Cloud Console](https://console.cloud.google.com/apis/dashboard).
2. Create/Select a project → **OAuth consent screen** → configure scopes (YouTube Data API v3) and publish in *Testing* mode.
3. Create OAuth client ID (**Desktop App**) and download `client_secret.json`.
4. Place the file at `secrets/client_secret.json` (matches `config.yaml` defaults) or point `uploader.client_secrets_file` to your location.
5. First upload run will launch a local server to complete OAuth. Resulting tokens persist in `secrets/token.json`.

## 🛠️ CLI Usage

Generate one Shorts package without uploading:

```bash
python -m app.main shorts \
  --topic "AIGC 市场趋势" \
  --lang zh
```

Batch from CSV (with a `topic` column):

```bash
python -m app.main shorts --csv data/topics.csv --lang en
```

Enable upload & schedule publish:

```bash
python -m app.main shorts \
  --topic "Morning routine hacks" \
  --upload \
  --schedule "2025-01-01T10:00:00Z" \
  --lang en
```

Flags:

| Flag | Description |
|------|-------------|
| `--topic` | Single topic string. |
| `--csv` | CSV path with `topic` (and optional `lang`) columns for batch mode. |
| `--upload` | Perform YouTube upload (requires OAuth setup). |
| `--schedule` | ISO 8601 publish datetime (Short stored as private until release). |
| `--lang` | Override language template (default `zh`). |
| `--no-bgm` | Disable background music. |
| `--no-stock` | Disable stock media APIs (always uses generated backdrops). |
| `--tts` | Force TTS engine (`piper`, `mock`, `local`, `coqui`, `cloud`). |
| `--output-dir` | Override output root (default `outputs/`). |
| `--config` | Custom YAML config path. |

Each topic renders to `outputs/<slug>/` containing:

- `script.txt`
- `audio/voiceover.wav`
- `frames/frame_*.png`
- `video/short.mp4`
- `subtitles/captions.srt`
- `thumbnails/thumbnail_1.png`, `thumbnail_2.png`
- `metadata.json`

If `--upload` is used, the CLI prints the resulting video URL or upload status.

## 🐳 Docker

Build & run inside a containerised runtime:

```bash
docker build -t shorts-automation .
docker run --rm -v "$(pwd)/outputs:/app/outputs" \
  -v "$(pwd)/secrets:/app/secrets" \
  --env-file .env \
  shorts-automation python -m app.main shorts --topic "AI news" --lang en
```

> Note: OAuth authentication requires a browser. Generate tokens locally first, then mount `secrets/token.json` inside the container.

## 🧪 Tests & Quality

Run unit tests:

```bash
pytest
```

Apply linters/formatters:

```bash
ruff check app tests
black app tests
```

## 🔧 Configuration Reference (`config/config.yaml`)

- `defaults`: global output directory & default language.
- `scripts`: duration budget, speech rate, prompt templates.
- `tts`: engine selection, caching, sample rate.
- `media`: stock toggle, fonts, palette, watermark message.
- `video`: render settings, progress bar styling.
- `audio`: background music library, ducking controls.
- `metadata`: tag / hashtag policies.
- `compliance`: banned words & hashtags (applied both to script content and metadata).
- `uploader`: YouTube OAuth file locations and default privacy state.

## 📈 Extending the Pipeline

- Plug a real Piper / Coqui XTTS voice by implementing a new engine in `app/tts.py` and switching `tts.engine`.
- Swap storyboard logic to real stock footage or LLM-driven image generation in `app/media.py`.
- Connect an LLM for script creation by replacing `_default_template` in `app/script_gen.py`.
- Enforce advanced moderation or prompt guardrails by expanding `compliance` configuration.

## 📄 License

This project remains under the MIT License. See [LICENSE](LICENSE).

---

Questions or ideas? Open an issue with the generated video sample and logs — reproducibility is at the heart of this MVP.
