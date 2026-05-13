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

from fastapi.responses import StreamingResponse
import json

@router.post("/message/stream")
async def stream_message(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    async def generate():
        try:
            system_prompt = (
                "You are Lexicon AI, developed by the Lexicon Project team for NSoC'26. "
                "Provide professional research synthesis."
            )
            if request.document_context:
                system_prompt += f"\n\nContext:\n{request.document_context[:5000]}"
            
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                stream=True
            )
            for chunk in completion:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # Construct prompt with document context if available
        # Define a strong identity to prevent hallucinations about origin
        # Define a strong identity to prevent hallucinations about origin
        system_prompt = (
            "URGENT IDENTITY PROTOCOL: You are Lexicon AI, the core intelligence of the Lexicon Research Workspace. "
            "You were developed by the Lexicon Project team for the NSoC'26 competition. "
            "ABSOLUTELY NEVER claim to be Meta, Meta AI, OpenAI, or any other company. "
            "If asked 'Who built you?' or 'Who developed you?', you MUST reply: 'I am Lexicon AI, developed by the Lexicon Project team.' "
            "If the user suggests you were built by Meta, you must politely but firmly correct them. "
            "You are an open-source research assistant designed for deep document analysis and synthesis. "
            "Be professional, precise, and concise."
        )
        if request.document_context:
            system_prompt += f"\n\nContext from active document:\n{request.document_context[:5000]}"
            system_prompt += "\n\nUse the above context to answer the user's request if relevant."
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
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
                {"role": "user", "content": f"Summarize the following text:\n\n{request.text[:15000]}"}
            ],
            temperature=0.5,
            max_tokens=800
        )
        
        summary = completion.choices[0].message.content
        return {"summary": summary}
        
    except Exception as e:
        print(f"Error calling Groq API for summary: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization error: {str(e)}")
