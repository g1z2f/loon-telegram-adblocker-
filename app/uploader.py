from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

from .metadata import MetadataBundle
from .utils import ensure_directory

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


@dataclass
class UploadResult:
    video_id: Optional[str]
    url: Optional[str]
    uploaded: bool


class YouTubeUploader:
    def __init__(self, config: Dict[str, object]) -> None:
        uploader_cfg = config.get("uploader", {})
        self.client_secrets_file = Path(uploader_cfg.get("client_secrets_file", "client_secret.json"))
        self.credentials_file = Path(uploader_cfg.get("credentials_file", "token.json"))
        self.default_privacy = uploader_cfg.get("default_privacy", "unlisted")
        ensure_directory(self.client_secrets_file.parent)
        ensure_directory(self.credentials_file.parent)

    def upload(
        self,
        video_path: Path,
        metadata: MetadataBundle,
        thumbnail_paths: Iterable[Path],
        schedule_time: Optional[str] = None,
        privacy_status: Optional[str] = None,
    ) -> UploadResult:
        if not video_path.exists():
            raise FileNotFoundError(f"Video path does not exist: {video_path}")
        privacy = privacy_status or self.default_privacy
        body = {
            "snippet": {
                "title": metadata.titles[0],
                "description": f"{metadata.description}\n\n{' '.join(metadata.hashtags)}"
                if metadata.hashtags
                else metadata.description,
                "tags": metadata.tags,
                "categoryId": "22",
            },
            "status": {
                "privacyStatus": privacy,
                "selfDeclaredMadeForKids": False,
            },
        }
        if schedule_time:
            body["status"].update({"privacyStatus": "private", "publishAt": schedule_time})
        credentials = self._get_credentials()
        youtube = build("youtube", "v3", credentials=credentials)
        media = MediaFileUpload(str(video_path), chunksize=-1, resumable=True)
        try:
            request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
            response = request.execute()
            video_id = response.get("id")
            logger.info("Uploaded video %s", video_id)
            for thumbnail in thumbnail_paths:
                if thumbnail.exists():
                    self._set_thumbnail(youtube, video_id, thumbnail)
            return UploadResult(video_id=video_id, url=f"https://youtu.be/{video_id}" if video_id else None, uploaded=True)
        except HttpError as exc:
            logger.error("YouTube upload failed: %s", exc)
            raise

    # Internal helpers -------------------------------------------------

    def _get_credentials(self) -> Credentials:
        if self.credentials_file.exists():
            logger.debug("Loading stored YouTube credentials from %s", self.credentials_file)
            return Credentials.from_authorized_user_file(str(self.credentials_file), SCOPES)
        if not self.client_secrets_file.exists():
            raise FileNotFoundError(
                "Missing Google API client secrets. Provide client_secret.json or set uploader.client_secrets_file",
            )
        flow = InstalledAppFlow.from_client_secrets_file(str(self.client_secrets_file), SCOPES)
        credentials = flow.run_local_server(port=0)
        with self.credentials_file.open("w", encoding="utf-8") as fh:
            fh.write(credentials.to_json())
        logger.info("Saved OAuth credentials to %s", self.credentials_file)
        return credentials

    def _set_thumbnail(self, youtube, video_id: Optional[str], thumbnail_path: Path) -> None:
        if not video_id:
            return
        media = MediaFileUpload(str(thumbnail_path))
        try:
            youtube.thumbnails().set(videoId=video_id, media_body=media).execute()
            logger.debug("Applied thumbnail %s", thumbnail_path)
        except HttpError as exc:
            logger.warning("Failed to set thumbnail %s: %s", thumbnail_path, exc)
