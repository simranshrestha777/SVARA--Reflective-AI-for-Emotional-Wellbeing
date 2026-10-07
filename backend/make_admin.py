"""Promote an existing user to admin:  python make_admin.py you@example.com"""
import sys
from app.database import SessionLocal
from app import models

if len(sys.argv) != 2:
    sys.exit("Usage: python make_admin.py <email>")

db = SessionLocal()
user = db.query(models.User).filter(models.User.email == sys.argv[1]).first()
if not user:
    sys.exit("No user with that email. Register in the app first.")
user.is_admin = True
db.commit()
print(f"{user.email} is now an admin.")
