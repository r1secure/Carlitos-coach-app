from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime
import httpx

from database import get_db
from models.user import User, UserRole
from schemas.auth import Token, UserResponse, GoogleAuthRequest, TokenData
from pydantic import BaseModel
from core.security import create_access_token, create_refresh_token, ALGORITHM, SECRET_KEY
from config import settings

router = APIRouter()

from core.deps import get_current_user, get_current_active_user, oauth2_scheme

@router.post("/auth/login/google", response_model=Token)
async def login_google(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Exchange code for tokens
    # TODO: Remove verify=False in production (used for local dev with SSL issues)
    async with httpx.AsyncClient(verify=False) as client:
        # Get Token
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": request.code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        
        print(f"DEBUG: Token Exchange - Code: {request.code[:10]}...")
        print(f"DEBUG: Token Exchange - Redirect URI: {settings.GOOGLE_REDIRECT_URI}")
        print(f"DEBUG: Token Exchange - Response Status: {token_response.status_code}")
        print(f"DEBUG: Token Exchange - Response Body: {token_response.text}")
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google code")
        
        google_tokens = token_response.json()
        
        # Get User Info
        user_info_response = await client.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={google_tokens['access_token']}"
        )
        
        if user_info_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
            
        user_info = user_info_response.json()
        
    # Find or Create User
    user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(
            email=user_info["email"],
            full_name=user_info.get("name"),
            avatar_url=user_info.get("picture"),
            role=UserRole.PLAYER, # Default role
            validation_status="PENDING",
            permissions={
                "can_view_knowledge_base": True,
                "can_upload_videos": True,
                "can_use_virtual_coach": True
            }
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update info if changed
        user.full_name = user_info.get("name")
        user.avatar_url = user_info.get("picture")
        user.last_login = datetime.utcnow()
        db.commit()
        
    # Generate Tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


class TestLoginRequest(BaseModel):
    email: str

@router.post("/auth/login/test", response_model=Token)
async def login_test(request: TestLoginRequest, db: Session = Depends(get_db)):
    # Find User
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Generate Tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
