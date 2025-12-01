"""
Drill Model
Stores tennis drills with metadata and video associations
"""
from sqlalchemy import Column, String, Text, DateTime, Enum, ARRAY, UUID, Table, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from database import Base


class DifficultyLevel(str, enum.Enum):
    """Difficulty levels for drills"""
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class FocusArea(str, enum.Enum):
    """Focus areas for training"""
    technique = "technique"
    physical = "physical"
    mental = "mental"
    tactical = "tactical"


# Junction table for drill-video many-to-many relationship
drill_videos = Table(
    'drill_videos',
    Base.metadata,
    Column('drill_id', UUID(as_uuid=True), ForeignKey('drills.id', ondelete='CASCADE'), primary_key=True),
    Column('video_id', UUID(as_uuid=True), ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
    Column('order', Integer, default=0)  # For sorting videos
)


class Drill(Base):
    """Drill model for tennis drills"""
    __tablename__ = "drills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(DifficultyLevel), nullable=False, index=True)
    focus_area = Column(Enum(FocusArea), nullable=False, index=True)
    equipment = Column(ARRAY(String), nullable=True)  # List of equipment needed
    extra_metadata = Column(JSONB, nullable=True)  # Extensible metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Relationships
    videos = relationship("Video", secondary=drill_videos, lazy="selectin")

    def __repr__(self):
        return f"<Drill(id={self.id}, title={self.title}, difficulty={self.difficulty})>"
