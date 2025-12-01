from typing import Optional
from pydantic import BaseModel, EmailStr, HttpUrl, Field
from datetime import datetime, date
from uuid import UUID
from models.user import UserRole, Handedness, BackhandStyle

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.PLAYER
    
    # Profile Fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    ranking: Optional[str] = None
    fft_club: Optional[str] = None
    tenup_profile_url: Optional[str] = None
    handedness: Optional[Handedness] = None
    backhand_style: Optional[BackhandStyle] = None
    play_style: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Profile Fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    ranking: Optional[str] = None
    fft_club: Optional[str] = None
    tenup_profile_url: Optional[str] = None
    handedness: Optional[Handedness] = None
    backhand_style: Optional[BackhandStyle] = None
    play_style: Optional[str] = None

class UserAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    
    # Profile Fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    ranking: Optional[str] = None
    fft_club: Optional[str] = None
    tenup_profile_url: Optional[str] = None
    handedness: Optional[Handedness] = None
    backhand_style: Optional[BackhandStyle] = None
    play_style: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
