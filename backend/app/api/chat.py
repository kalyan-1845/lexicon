from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import hashlib
from groq import Groq
from dotenv import load_dotenv
from app.services.notion_exporter import export_markdown_to_notion
from app.api.schemas import NotionExportRequest

load_dotenv()

router = APIRouter()

# Simple in-memory cache for demo purposes
prompt_cache = {}

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    document_context: str | None = None

class ChatResponse(BaseModel):
    reply: str
    citations: list[dict] | None = None

@router.post("/cite", response_model=ChatResponse)
async def generate_citation(text: str, source: str):
    # Simulated citation generation logic
    return {
        "reply": f"Fact: {text}",
        "citations": [
            {"style": "APA", "text": f"Lexicon AI. (2026). Analysis of {source}. Lexicon Research Hub."},
            {"style": "MLA", "text": f"Lexicon AI. 'Analysis of {source}.' Lexicon Research Hub, 2026."}
        ]
    }

class SummarizeRequest(BaseModel):
    text: str

from app.services.agents import AgentService

agent_service = AgentService()

@router.post("/message/stream")
async def stream_message(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    return StreamingResponse(
        agent_service.run_streaming_workflow(request.message, request.document_context), 
        media_type="text/event-stream"
    )

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Generate cache key
    cache_key = hashlib.sha256(f"{request.message}:{request.document_context}".encode()).hexdigest()
    if cache_key in prompt_cache:
        return ChatResponse(reply=prompt_cache[cache_key])
    
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
        raise HTTPException(status_code=401, detail="Text to summarize cannot be empty")
    
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
        if not summary:
            raise HTTPException(status_code=500, detail="Failed to generate")

        else:
            return {"Summary":summary}

        
    except Exception as e:
        print(f"Error calling Groq API for summary: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization error: {str(e)}")

class ShareRequest(BaseModel):
    workspace_name: str
    is_public: bool
    password: str | None = None

@router.post("/share")
async def share_workspace(request: ShareRequest, req: Request):
    import uuid
    share_id = str(uuid.uuid4())[:8]
    base_url = req.headers.get('origin', req.headers.get('referer', 'http://localhost:3000')).rstrip('/')
    return {
        "workspace_name": request.workspace_name,
        "is_public": request.is_public,
        "share_url": f"{base_url}/w/share-{share_id}"
    }

@router.post("/export/notion")
async def export_to_notion(request: NotionExportRequest):
    try:
        result = export_markdown_to_notion(request.database_id, request.markdown)
        return {"status": "success", "notion_url": result["url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notion export error: {str(e)}")