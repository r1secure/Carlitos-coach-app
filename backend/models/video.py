"""
Video Model
Stores video files metadata (uploaded to MinIO)
"""
from sqlalchemy import Column, String, Integer, BigInteger, DateTime, Text, UUID, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base


class Video(Base):
    """Video model for storing video metadata"""
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)  # MinIO path
    thumbnail_url = Column(String(512), nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in seconds
    size_bytes = Column(BigInteger, nullable=False)
    format = Column(String(10), nullable=False)  # mp4, mov, avi
    extra_metadata = Column(JSONB, nullable=True)  # Extensible metadata
    uploaded_by = Column(UUID(as_uuid=True), nullable=True)  # FK to users table (future)
    is_reference = Column(Boolean, default=False, nullable=False)  # Pro/Reference video
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Relationships (will be defined in junction tables)
    # drills = relationship("Drill", secondary="drill_videos", back_populates="videos")
    # exercises = relationship("Exercise", secondary="exercise_videos", back_populates="videos")
    # tips = relationship("Tip", secondary="tip_videos", back_populates="videos")
    # programs = relationship("TrainingProgram", secondary="program_videos", back_populates="videos")

    def __repr__(self):
        return f"<Video(id={self.id}, filename={self.filename})>"
