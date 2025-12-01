"""
Analysis Model
Stores biomechanical analysis results for videos
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from database import Base

class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Analysis(Base):
    """Analysis model for storing pose detection results"""
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, unique=True)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False)
    data = Column(JSONB, nullable=True)  # Stores the list of frames with landmarks
    ai_feedback = Column(JSONB, nullable=True)  # Stores the LLM generated feedback
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    video = relationship("Video", backref="analysis")

    def __repr__(self):
        return f"<Analysis(id={self.id}, video_id={self.video_id}, status={self.status})>"
