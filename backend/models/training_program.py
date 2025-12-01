"""
Training Program Model
Stores structured training programs
"""
from sqlalchemy import Column, String, Text, DateTime, Enum, Integer, UUID, Table, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base
from models.drill import DifficultyLevel


# Junction table for program-video many-to-many relationship
program_videos = Table(
    'program_videos',
    Base.metadata,
    Column('program_id', UUID(as_uuid=True), ForeignKey('training_programs.id', ondelete='CASCADE'), primary_key=True),
    Column('video_id', UUID(as_uuid=True), ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
    Column('order', Integer, default=0)
)


class TrainingProgram(Base):
    """Training Program model for structured training plans"""
    __tablename__ = "training_programs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    duration_weeks = Column(Integer, nullable=False)  # Program duration in weeks
    difficulty = Column(Enum(DifficultyLevel), nullable=False, index=True)
    program_data = Column(JSONB, nullable=False)  # Structured program content (weeks, sessions, exercises)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    videos = relationship("Video", secondary=program_videos, lazy="selectin")

    def __repr__(self):
        return f"<TrainingProgram(id={self.id}, title={self.title}, duration={self.duration_weeks}w)>"
