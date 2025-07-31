import os
import time
import jwt
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from models import Base, User
from auth import create_token, verify_pw, hash_pw
from vector_store import index_pdf, rag_chain

# -----------------------------
# 1. Проверка обязательных env
# -----------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set")

SECRET = os.getenv("JWT_SECRET", "change-me")
ALGO = "HS256"

# -----------------------------
# 2. Инициализация БД и сессии
# -----------------------------
time.sleep(5)  # ждём Chroma
engine = create_async_engine(DATABASE_URL)
Session = async_sessionmaker(engine, expire_on_commit=False)

# -----------------------------
# 3. FastAPI + CORS
# -----------------------------
app = FastAPI()

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

oauth2 = OAuth2PasswordBearer(tokenUrl="login")

# -----------------------------
# 4. Жизненный цикл
# -----------------------------
@app.on_event("startup")
async def on_start():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# -----------------------------
# 5. Энд-поинты
# -----------------------------
@app.post("/register")
async def register(email: str, password: str):
    async with Session() as s:
        u = User(email=email, hashed_password=hash_pw(password))
        s.add(u)
        await s.commit()
        return {"ok": True}


@app.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    async with Session() as s:
        res = await s.execute(select(User).where(User.email == form.username))
        user = res.scalar_one_or_none()
        if not user or not verify_pw(form.password, user.hashed_password):
            raise HTTPException(401, "bad credentials")
        return {"access_token": create_token(str(user.id)), "token_type": "bearer"}


async def get_user(token: str = Depends(oauth2)):
    try:
        uid = jwt.decode(token, SECRET, algorithms=[ALGO])["sub"]
        return uid
    except jwt.InvalidTokenError:
        raise HTTPException(401, "invalid token")
