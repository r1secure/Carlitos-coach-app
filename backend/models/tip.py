"""
Tip Model
Stores coaching tips and advice
"""
from sqlalchemy import Column, String, Text, DateTime, Enum, UUID, Table, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base
from models.drill import FocusArea


# Junction table for tip-video many-to-many relationship
tip_videos = Table(
    'tip_videos',
    Base.metadata,
    Column('tip_id', UUID(as_uuid=True), ForeignKey('tips.id', ondelete='CASCADE'), primary_key=True),
    Column('video_id', UUID(as_uuid=True), ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
    Column('order', Integer, default=0)
)


class Tip(Base):
    """Tip model for coaching tips and advice"""
    __tablename__ = "tips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)  # e.g., "serve", "forehand", "mental"
    focus_area = Column(Enum(FocusArea), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    videos = relationship("Video", secondary=tip_videos, lazy="selectin")

    def __repr__(self):
        return f"<Tip(id={self.id}, title={self.title})>"
