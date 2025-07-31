# auth.py
import os
from datetime import datetime, timedelta
from typing import Any, Dict
from passlib.context import CryptContext
from jose import jwt, JWTError

# --------------------------
# 1. Настройки JWT
# --------------------------
SECRET = os.getenv("JWT_SECRET")
if not SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required")

ALGO = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# --------------------------
# 2. Контекст паролей
# --------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --------------------------
# 3. Утилиты
# --------------------------
def hash_pw(plain_password: str) -> str:
    """Хэш пароля."""
    return pwd_context.hash(plain_password)


def verify_pw(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля."""
    return pwd_context.verify(plain_password, hashed_password)


def create_token(uid: str) -> str:
    """Создать JWT-токен."""
    payload: Dict[str, Any] = {
        "sub": uid,
        "exp": datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)


def decode_token(token: str) -> str:
    """Декодировать JWT и вернуть user-id."""
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        uid: str = payload.get("sub")
        if uid is None:
            raise ValueError("Token missing 'sub' claim")
        return uid
    except JWTError as e:
        raise ValueError("Invalid token") from e
