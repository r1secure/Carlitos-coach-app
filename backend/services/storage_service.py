"""
MinIO Storage Service
Handles video upload, retrieval, and deletion from MinIO object storage
"""
import io
import os
import uuid
import subprocess
from datetime import timedelta
from typing import Optional, BinaryIO
from minio import Minio
from minio.error import S3Error
from PIL import Image
import magic
import logging

from config import settings

logger = logging.getLogger(__name__)


class StorageService:
    """Service for managing video storage in MinIO"""

    def __init__(self):
        """Initialize MinIO client"""
        # Internal client for backend operations (upload/delete)
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        
        # External client for generating browser-accessible URLs (signing)
        # This ensures the signature matches the Host header sent by the browser
        # We explicitly set the region to prevent the client from trying to connect
        # to localhost:9000 from inside the container to auto-detect the region.
        self.signer_client = Minio(
            settings.MINIO_EXTERNAL_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
            region="us-east-1"
        )
        
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created MinIO bucket: {self.bucket_name}")
            else:
                logger.info(f"MinIO bucket exists: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error creating bucket: {e}")
            raise

    def upload_video(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str = "video/mp4"
    ) -> tuple[str, int]:
        """
        Upload video file to MinIO
        
        Args:
            file: File-like object
            filename: Original filename
            content_type: MIME type
            
        Returns:
            Tuple of (storage_path, file_size_bytes)
        """
        try:
            # Generate unique storage path
            file_ext = os.path.splitext(filename)[1]
            storage_filename = f"{uuid.uuid4()}{file_ext}"
            storage_path = f"videos/{storage_filename}"

            # Get file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)

            # Upload to MinIO
            self.client.put_object(
                self.bucket_name,
                storage_path,
                file,
                file_size,
                content_type=content_type
            )

            logger.info(f"Uploaded video: {storage_path} ({file_size} bytes)")
            return storage_path, file_size

        except S3Error as e:
            logger.error(f"Error uploading video: {e}")
            raise

    def get_signed_url(
        self,
        storage_path: str,
        expiration: int = 3600
    ) -> str:
        """
        Generate a presigned URL for video access
        
        Args:
            storage_path: Path in MinIO bucket
            expiration: URL expiration in seconds (default 1 hour)
            
        Returns:
            Presigned URL
        """
        try:
            # Use signer_client to generate URL with external endpoint (localhost)
            url = self.signer_client.presigned_get_object(
                self.bucket_name,
                storage_path,
                expires=timedelta(seconds=expiration)
            )
            return url
        except S3Error as e:
            logger.error(f"Error generating signed URL: {e}")
            raise

    def delete_video(self, storage_path: str):
        """
        Delete video from MinIO
        
        Args:
            storage_path: Path in MinIO bucket
        """
        try:
            self.client.remove_object(self.bucket_name, storage_path)
            logger.info(f"Deleted video: {storage_path}")
        except S3Error as e:
            logger.error(f"Error deleting video: {e}")
            raise

    def generate_thumbnail(
        self,
        video_path: str,
        output_path: str,
        timestamp: str = "00:00:01"
    ) -> Optional[str]:
        """
        Generate thumbnail from video using FFmpeg
        
        Args:
            video_path: Local path to video file
            output_path: Local path for thumbnail output
            timestamp: Timestamp to extract frame from (default 1 second)
            
        Returns:
            Path to generated thumbnail or None if failed
        """
        try:
            # Use FFmpeg to extract frame
            cmd = [
                "ffmpeg",
                "-i", video_path,
                "-ss", timestamp,
                "-vframes", "1",
                "-vf", "scale=320:180",  # 16:9 aspect ratio
                "-y",  # Overwrite output file
                output_path
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                logger.info(f"Generated thumbnail: {output_path}")
                return output_path
            else:
                logger.error(f"FFmpeg error: {result.stderr}")
                return None

        except subprocess.TimeoutExpired:
            logger.error("Thumbnail generation timed out")
            return None
        except Exception as e:
            logger.error(f"Error generating thumbnail: {e}")
            return None

    def upload_thumbnail(
        self,
        thumbnail_path: str,
        video_id: str
    ) -> str:
        """
        Upload thumbnail to MinIO
        
        Args:
            thumbnail_path: Local path to thumbnail
            video_id: UUID of the video
            
        Returns:
            Storage path of uploaded thumbnail
        """
        try:
            storage_path = f"thumbnails/{video_id}.jpg"

            with open(thumbnail_path, 'rb') as f:
                file_size = os.path.getsize(thumbnail_path)
                self.client.put_object(
                    self.bucket_name,
                    storage_path,
                    f,
                    file_size,
                    content_type="image/jpeg"
                )

            logger.info(f"Uploaded thumbnail: {storage_path}")
            return storage_path

        except S3Error as e:
            logger.error(f"Error uploading thumbnail: {e}")
            raise

    @staticmethod
    def validate_video_format(file: BinaryIO) -> tuple[bool, str]:
        """
        Validate video file format using python-magic
        
        Args:
            file: File-like object
            
        Returns:
            Tuple of (is_valid, mime_type)
        """
        try:
            # Read first 2048 bytes for magic detection
            file.seek(0)
            header = file.read(2048)
            file.seek(0)

            mime = magic.from_buffer(header, mime=True)
            
            allowed_mimes = [
                "video/mp4",
                "video/quicktime",  # MOV
                "video/x-msvideo"   # AVI
            ]

            is_valid = mime in allowed_mimes
            return is_valid, mime

        except Exception as e:
            logger.error(f"Error validating video format: {e}")
            return False, "unknown"

    @staticmethod
    def get_video_resolution(video_path: str) -> Optional[tuple[int, int]]:
        """
        Get video resolution using FFmpeg
        
        Args:
            video_path: Local path to video file
            
        Returns:
            Tuple of (width, height) or None if failed
        """
        try:
            cmd = [
                "ffprobe",
                "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=s=x:p=0",
                video_path
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                width, height = map(int, result.stdout.strip().split('x'))
                return width, height
            else:
                logger.error(f"FFprobe error: {result.stderr}")
                return None

        except Exception as e:
            logger.error(f"Error getting video resolution: {e}")
            return None


# Create singleton instance
storage_service = StorageService()
