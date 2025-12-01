from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from models.user import User, UserRole
from schemas.user import UserResponse, UserUpdate, UserAdminUpdate
from core.deps import get_current_user, get_current_active_superuser

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Update own user.
    """
    # Update fields
    update_data = user_in.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=list[UserResponse])
async def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve users.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: str,
    user_in: UserAdminUpdate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    
    # Prevent self-demotion
    if str(user.id) == str(current_user.id) and user_in.role and user_in.role != UserRole.ADMIN:
         raise HTTPException(
            status_code=400,
            detail="You cannot demote yourself",
        )

    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/validate", response_model=UserResponse)
async def validate_user(
    *,
    db: Session = Depends(get_db),
    user_id: str,
    status: str,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Validate a user (Approve/Reject).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    
    if status not in ["PENDING", "APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    user.validation_status = status
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/permissions", response_model=UserResponse)
async def update_permissions(
    *,
    db: Session = Depends(get_db),
    user_id: str,
    permissions: dict,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update user permissions.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
        
    user.permissions = permissions
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
