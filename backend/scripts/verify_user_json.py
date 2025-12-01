import sys
import os
from pathlib import Path
import asyncio
from httpx import AsyncClient, ASGITransport

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import SessionLocal
from models.user import User
from core.security import create_access_token
from main import app

async def verify_user_json():
    db = SessionLocal()
    try:
        # Get user
        user = db.query(User).filter(User.email == "r1.secure@gmail.com").first()
        if not user:
            print("User not found")
            return

        print(f"User ID: {user.id}")
        print(f"DB Handedness: {user.handedness}")
        print(f"DB Backhand: {user.backhand_style}")

        # Create token
        token = create_access_token(subject=str(user.id))
        
        # Call API
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            headers = {"Authorization": f"Bearer {token}"}
            response = await ac.get("/api/v1/users/me", headers=headers)
            
            print("\nAPI Response:")
            print(response.json())
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(verify_user_json())
