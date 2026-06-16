from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from fastapi.security import APIKeyHeader
from starlette.middleware.base import BaseHTTPMiddleware
from app.api import upload, chat, citations, notes, documents
from app.api.schemas import RootResponse, HealthResponse
from app.websocket_manager import ConnectionManager
from app.services.cache_service import cache
from app.core.database import engine, Base
from app.models import user
from app.models import chat as chat_model
from app.models import note

import os
import time
import json
from collections import defaultdict
from app.api import documents

# Initialize database schemas
Base.metadata.create_all(bind=engine)

manager = ConnectionManager()

# --- API Key Authentication ---
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    """Validates the X-API-Key header against the server's configured key.
    If no key is configured on the server, authentication is skipped (open access)."""
    expected_key = os.getenv("API_KEY")
    if expected_key and api_key != expected_key:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return api_key

tags_metadata = [
    {
        "name": "Uploads",
        "description": "Operations with documents, parsing PDFs, and deletion of uploaded research contexts.",
    },
    {
        "name": "Chat",
        "description": "Interaction with Lexicon AI, summarizing documents, sharing messages, full-text message search, and exporting to Notion.",
    },
    {
        "name": "Notes",
        "description": "Operations with collaborative and smart notes.",
    },
    {
        "name": "Citations",
        "description": "Generating and exporting BibTeX bibliography files from the uploaded document library.",
    },
    {
        "name": "Health",
        "description": "API liveness and readiness probes.",
    },
]

app = FastAPI(
    title="Lexicon AI API",
    description="Backend API for the Lexicon AI Workspace",
    version="1.0.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "Lexicon Project Team",
        "url": "https://github.com/kalyan-1845/lexicon",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {"url": "http://localhost:8000", "description": "Local development"},
    ],
)

# Custom OpenAPI schema generation
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Lexicon AI API",
        version="1.0.0",
        description="Comprehensive Backend API documentation for the Lexicon AI Workspace",
        routes=app.routes,
        tags=tags_metadata
    )
    # Define Security Scheme
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "Standard header-based API key authentication for secure routes."
        }
    }
    # Apply Security globally to all routes
    openapi_schema["security"] = [{"ApiKeyAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

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
        if path in ["/", "/health", "/docs", "/redoc", "/openapi.json"] or scope.get("method") == "OPTIONS":
            await self.app(scope, receive, send)
            return
            
        # Get client IP, checking x-forwarded-for for proxies like Vercel
        client_ip = None
        for header_name, header_value in scope.get("headers", []):
            if header_name == b"x-forwarded-for":
                client_ip = header_value.decode("utf-8").split(",")[0].strip()
                break
        
        if not client_ip:
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

class PrefixStrippingMiddleware:
    def __init__(self, app, prefix: str = "/_/backend"):
        self.app = app
        self.prefix = prefix

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path.startswith(self.prefix):
                scope["path"] = path[len(self.prefix):]
                if not scope["path"]:
                    scope["path"] = "/"
                
                if "raw_path" in scope:
                    raw_path = scope["raw_path"].decode("utf-8", errors="ignore")
                    if raw_path.startswith(self.prefix):
                        new_raw = raw_path[len(self.prefix):]
                        if not new_raw:
                            new_raw = "/"
                        scope["raw_path"] = new_raw.encode("utf-8")
        await self.app(scope, receive, send)

# Configure CORS so the Next.js frontend can communicate with the backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, limit=60, window=60)
app.add_middleware(PrefixStrippingMiddleware, prefix="/_/backend")

# Register Routers
app.include_router(upload.router, prefix="/api/upload", tags=["Uploads"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(citations.router, prefix="/api/citations", tags=["Citations"])
app.include_router(documents.router, prefix="/api/documents")
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])

@app.websocket("/ws/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: str):
    await manager.connect(workspace_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast to all clients in the workspace
            await manager.broadcast(workspace_id, f"Message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(workspace_id, websocket)
        await manager.broadcast(workspace_id, "A user disconnected")

@app.get(
    "/",
    response_model=RootResponse,
    summary="API root",
    description="Returns a welcome message confirming the API is reachable.",
    tags=["Health"],
)
def read_root():
    return {"message": "Welcome to Lexicon AI API"}

@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns the operational status of the API and its connected services (cache, database).",
    tags=["Health"],
)
def health_check():
    return {
        "status": "healthy",
        "cache": "connected" if cache.is_available else "unavailable (fallback active)",
    }
