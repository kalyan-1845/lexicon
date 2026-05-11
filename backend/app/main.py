from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, chat

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

# Register Routers
app.include_router(upload.router, prefix="/api/upload", tags=["Uploads"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Lexicon AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
