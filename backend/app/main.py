from fastapi import FastAPI
from app.api import chat, upload
from app.core.config import settings
import time

app = FastAPI(title=settings.PROJECT_NAME)

START_TIME = time.time()

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "uptime": f"{round(time.time() - START_TIME, 2)}s",
        "version": "1.3.0",
        "provider": settings.DEFAULT_PROVIDER
    }
