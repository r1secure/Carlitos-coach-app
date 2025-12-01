"""
Application Configuration
Loads environment variables and provides settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:2000",  # Next.js dev server
        "http://localhost:2000",  # Next.js production (Docker)
    ]
    
    # Database
    DATABASE_URL: str = ""
    
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_BUCKET_NAME: str = ""
    MINIO_SECURE: bool = False  # Use HTTPS
    MINIO_EXTERNAL_ENDPOINT: str = "localhost:9000"  # For browser access
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Storage
    MAX_VIDEO_SIZE_MB: int = 100
    MAX_VIDEO_SIZE_BYTES: int = MAX_VIDEO_SIZE_MB * 1024 * 1024
    #MIN_VIDEO_RESOLUTION: tuple = (1280, 720)  # 720p minimum
    MIN_VIDEO_RESOLUTION: tuple = (864, 480)  # 720p minimum

    ALLOWED_VIDEO_FORMATS: List[str] = ["mp4", "mov", "avi"]
    USER_STORAGE_QUOTA_GB: int = 1
    USER_STORAGE_QUOTA_BYTES: int = USER_STORAGE_QUOTA_GB * 1024 * 1024 * 1024
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:2000/auth/callback"

    # LLM
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "openai"  # Use 'openai' provider for generic LiteLLM/OpenAI-compatible endpoints
    LLM_MODEL: str = "bedrock-claude-4-5-sonnet"
    LITELLM_API_BASE: str
    LITELLM_API_KEY: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
