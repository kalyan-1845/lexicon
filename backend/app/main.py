from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.api import upload, chat
import time
from collections import defaultdict

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 60, window: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Allow health checks and root index without rate limits
        if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean up old requests outside window
        self.requests[client_ip] = [t for t in self.requests[client_ip] if current_time - t < self.window]
        
        if len(self.requests[client_ip]) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded. Maximum {self.limit} requests per {self.window} seconds allowed."}
            )
            
        self.requests[client_ip].append(current_time)
        return await call_next(request)

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

@app.get("/")
def read_root():
    return {"message": "Welcome to Lexicon AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
