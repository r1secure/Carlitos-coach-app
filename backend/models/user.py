from sqlalchemy import Column, String, Boolean, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    COACH = "coach"
    PLAYER = "player"

class Handedness(str, enum.Enum):
    RIGHT = "RIGHT"
    LEFT = "LEFT"

class BackhandStyle(str, enum.Enum):
    ONE_HANDED = "ONE_HANDED"
    TWO_HANDED = "TWO_HANDED"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.PLAYER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Profile Fields
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    birth_date = Column(DateTime(timezone=True), nullable=True)
    ranking = Column(String, nullable=True)  # e.g. "30/1", "15/4"
    fft_club = Column(String, nullable=True)
    tenup_profile_url = Column(String, nullable=True)
    handedness = Column(Enum(Handedness), nullable=True)
    backhand_style = Column(Enum(BackhandStyle), nullable=True)
    play_style = Column(String, nullable=True)  # Description
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
