from database import SessionLocal
from models.user import User, UserRole

db = SessionLocal()
user = db.query(User).filter(User.email == "erwan.leloupp@gmail.com").first()

if user:
    user.role = UserRole.ADMIN
    db.commit()
    print(f"✅ User {user.email} promoted to ADMIN.")
else:
    print("❌ User not found.")
