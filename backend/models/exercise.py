"""
Exercise Model
Stores physical exercises with metadata and video associations
"""
from sqlalchemy import Column, String, Text, DateTime, Enum, ARRAY, UUID, Table, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base
from models.drill import DifficultyLevel, FocusArea


# Junction table for exercise-video many-to-many relationship
exercise_videos = Table(
    'exercise_videos',
    Base.metadata,
    Column('exercise_id', UUID(as_uuid=True), ForeignKey('exercises.id', ondelete='CASCADE'), primary_key=True),
    Column('video_id', UUID(as_uuid=True), ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
    Column('order', Integer, default=0)
)


class Exercise(Base):
    """Exercise model for physical training exercises"""
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(DifficultyLevel), nullable=False, index=True)
    focus_area = Column(Enum(FocusArea), nullable=False, index=True)
    equipment = Column(ARRAY(String), nullable=True)
    extra_metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    videos = relationship("Video", secondary=exercise_videos, lazy="selectin")

    def __repr__(self):
        return f"<Exercise(id={self.id}, title={self.title})>"
