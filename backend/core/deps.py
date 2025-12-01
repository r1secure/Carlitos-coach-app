from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Generator

from database import get_db
from models.user import User
from schemas.auth import TokenData
from core.security import ALGORITHM, SECRET_KEY

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(sub=user_id)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    if current_user.validation_status != "APPROVED" and current_user.role != "admin": # Admins might be auto-approved or handle themselves
         # Actually, even admins should be approved. But for now let's stick to the plan.
         # If I block here, I need to make sure the frontend handles the 400/403 gracefully.
         # Or I can return the user and let the frontend check status.
         # But the requirement is "Feature guards".
         # Let's add the check.
         pass
         # Wait, if I raise HTTPException here, the "Pending" page won't be able to load anything if it needs this dep.
         # But the Pending page only needs /me, which uses get_current_user.
         # So it is safe to block here.
    
    # However, for now, I will NOT block here to avoid breaking existing flows during transition.
    # The proposal says "Redirect pending users... No access to dashboard".
    # So blocking here is good.
    if current_user.validation_status != "APPROVED":
         raise HTTPException(status_code=403, detail="User account is pending approval")
    return current_user

async def get_current_active_superuser(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user
