# backend/server.py
import os, httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-xxx")
OPENAI_BASE = os.getenv("OPENAI_BASE", "https://api.openai.com/v1")

class Payload(BaseModel):
    model: str
    messages: list
    temperature: float = 0.7
    stream: bool = True

@app.post("/chat/completions")
async def completions(p: Payload):
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream(
            "POST",
            f"{OPENAI_BASE}/chat/completions",
            headers=headers,
            json=p.dict()
        ) as r:
            if r.status_code != 200:
                raise HTTPException(r.status_code, await r.aread())
            async for chunk in r.aiter_text():
                yield chunk