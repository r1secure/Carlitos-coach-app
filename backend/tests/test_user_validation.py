import pytest
import sys
from pathlib import Path

# Add parent directory to path to allow importing app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user import User, UserRole
from routes.users import validate_user, update_permissions
from core.deps import get_current_active_user

# Mock DB Session
@pytest.fixture
def mock_db():
    return MagicMock(spec=Session)

# Mock User
@pytest.fixture
def mock_user():
    user = User(
        id="test-id",
        email="test@example.com",
        role=UserRole.PLAYER,
        is_active=True,
        validation_status="PENDING",
        permissions={}
    )
    return user

@pytest.fixture
def mock_admin():
    user = User(
        id="admin-id",
        email="admin@example.com",
        role=UserRole.ADMIN,
        is_active=True,
        validation_status="APPROVED",
        permissions={}
    )
    return user

@pytest.mark.asyncio
async def test_validate_user_success(mock_db, mock_user, mock_admin):
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    updated_user = await validate_user(
        db=mock_db,
        user_id="test-id",
        status="APPROVED",
        current_user=mock_admin
    )
    
    assert updated_user.validation_status == "APPROVED"
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_validate_user_invalid_status(mock_db, mock_user, mock_admin):
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    with pytest.raises(HTTPException) as excinfo:
        await validate_user(
            db=mock_db,
            user_id="test-id",
            status="INVALID_STATUS",
            current_user=mock_admin
        )
    assert excinfo.value.status_code == 400

@pytest.mark.asyncio
async def test_update_permissions_success(mock_db, mock_user, mock_admin):
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    new_permissions = {"can_view_kb": True}
    
    updated_user = await update_permissions(
        db=mock_db,
        user_id="test-id",
        permissions=new_permissions,
        current_user=mock_admin
    )
    
    assert updated_user.permissions == new_permissions
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_get_current_active_user_pending(mock_user):
    mock_user.validation_status = "PENDING"
    
    with pytest.raises(HTTPException) as excinfo:
        await get_current_active_user(current_user=mock_user)
    
    assert excinfo.value.status_code == 403

@pytest.mark.asyncio
async def test_get_current_active_user_approved(mock_user):
    mock_user.validation_status = "APPROVED"
    
    user = await get_current_active_user(current_user=mock_user)
    assert user == mock_user
