import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt

SECRET = os.getenv("JWT_SECRET", "change-me-now")
ALGO = "HS256"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pw(p): return pwd.hash(p)
def verify_pw(p, h): return pwd.verify(p, h)

def create_token(uid: str) -> str:
    return jwt.encode(
        {"sub": uid, "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET,
        algorithm=ALGO,
    )