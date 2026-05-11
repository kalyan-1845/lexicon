from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    document_context: str | None = None

class ChatResponse(BaseModel):
    reply: str

class SummarizeRequest(BaseModel):
    text: str

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are Lexicon Assistant, a highly intelligent research AI. Your goal is to help users analyze documents and synthesize complex information. Be professional, helpful, and concise."},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=1024,
            stream=False
        )
        
        reply = completion.choices[0].message.content
        return ChatResponse(reply=reply)
        
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.post("/summarize")
async def summarize_document(request: SummarizeRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text to summarize cannot be empty")
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional research assistant. Create a clear, high-level summary of the following document text. Focus on key themes, major findings, and important conclusions. Use bullet points."},
                {"role": "user", "content": f"Summarize the following text:\n\n{request.text[:15000]}"} # Limit input length for now
            ],
            temperature=0.5,
            max_tokens=800
        )
        
        summary = completion.choices[0].message.content
        return {"summary": summary}
        
    except Exception as e:
        print(f"Error calling Groq API for summary: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization error: {str(e)}")
