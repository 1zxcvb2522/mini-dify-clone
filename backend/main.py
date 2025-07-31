from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from models import Base, User
from auth import create_token, verify_pw, hash_pw
from vector_store import index_pdf, rag_chain
import os, time

time.sleep(5)      # wait for chroma

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL)
Session = async_sessionmaker(engine, expire_on_commit=False)

oauth2 = OAuth2PasswordBearer(tokenUrl="login")

@app.on_event("startup")
async def on_start():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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
    except:
        raise HTTPException(401, "invalid token")