from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.api import upload, chat, citations
import time
from collections import defaultdict

import json

class RateLimitMiddleware:
    def __init__(self, app, limit: int = 60, window: int = 60):
        self.app = app
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        # Allow health checks, docs, root, and CORS preflight OPTIONS requests
        if path in ["/", "/health", "/docs", "/openapi.json"] or scope.get("method") == "OPTIONS":
            await self.app(scope, receive, send)
            return
            
        client = scope.get("client")
        client_ip = client[0] if client else "unknown"
        current_time = time.time()
        
        # Clean up old requests outside window
        self.requests[client_ip] = [t for t in self.requests[client_ip] if current_time - t < self.window]
        
        if len(self.requests[client_ip]) >= self.limit:
            response_body = json.dumps({
                "detail": f"Rate limit exceeded. Maximum {self.limit} requests per {self.window} seconds allowed."
            }).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 429,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"access-control-allow-origin", b"*"),
                ]
            })
            await send({
                "type": "http.response.body",
                "body": response_body,
            })
            return
            
        self.requests[client_ip].append(current_time)
        await self.app(scope, receive, send)

app = FastAPI(
    title="Lexicon AI API",
    description="Backend API for the Lexicon AI Workspace",
    version="1.0.0"
)

# Configure CORS so the Next.js frontend can communicate with the backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, limit=60, window=60)

# Register Routers
app.include_router(upload.router, prefix="/api/upload", tags=["Uploads"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(citations.router, prefix="/api/citations", tags=["Citations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Lexicon AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
