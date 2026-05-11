from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    document_context: str | None = None

class ChatResponse(BaseModel):
    reply: str

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Simulate AI processing delay
    await asyncio.sleep(1)
    
    # Simple mock AI response logic
    reply = f"I am your Lexicon AI assistant. I received your message: '{request.message}'."
    if request.document_context:
        reply += " I also see you have a document active, but I'm still learning how to read it completely!"
        
    return ChatResponse(reply=reply)
