import pytest
import sys
from pathlib import Path

# Add parent directory to path to allow importing app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import timedelta
from core.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from jose import jwt
from config import settings

def test_hash_password():
    password = "testpassword"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)

def test_jwt_token_creation():
    user_id = "test-user-id"
    access_token = create_access_token(subject=user_id)
    refresh_token = create_refresh_token(subject=user_id)
    
    # Verify Access Token
    decoded_access = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded_access["sub"] == user_id
    assert "exp" in decoded_access
    
    # Verify Refresh Token
    decoded_refresh = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded_refresh["sub"] == user_id
    assert decoded_refresh["type"] == "refresh"
    assert "exp" in decoded_refresh

def test_token_expiration():
    user_id = "test-user-id"
    # Create token that expires immediately
    token = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-1))
    
    with pytest.raises(jwt.ExpiredSignatureError):
        jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
