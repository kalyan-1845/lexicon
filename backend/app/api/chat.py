from fastapi import APIRouter, HTTPException, Request, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
import os
import hashlib
import json
from groq import Groq
from dotenv import load_dotenv
from app.services.notion_exporter import export_markdown_to_notion
from app.api.schemas import NotionExportRequest
from app.core.database import get_db
from app.models.chat import ChatMessage

load_dotenv()

router = APIRouter()

# Simple in-memory cache for demo purposes
prompt_cache = {}

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY") or "mock-key")

class ChatRequest(BaseModel):
    message: str
    document_context: str | None = None
    user_id: str = "default_user"

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
async def stream_message(request: ChatRequest, db: Session = Depends(get_db)):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Persist the incoming user message
    user_msg = ChatMessage(user_id=request.user_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    async def _persist_and_stream():
        """Wraps the agent stream to accumulate chunks and persist the full reply."""
        accumulated = []
        async for chunk in agent_service.run_streaming_workflow(request.message, request.document_context):
            yield chunk
            # Collect content chunks (skip status events)
            try:
                payload = json.loads(chunk.removeprefix("data: ").strip())
                if "content" in payload:
                    accumulated.append(payload["content"])
            except (json.JSONDecodeError, ValueError):
                pass
        # After stream ends, persist the full assistant reply
        full_reply = "".join(accumulated)
        if full_reply:
            assistant_msg = ChatMessage(user_id=request.user_id, role="assistant", content=full_reply)
            db.add(assistant_msg)
            db.commit()

    return StreamingResponse(_persist_and_stream(), media_type="text/event-stream")

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Persist the incoming user message
    user_msg = ChatMessage(user_id=request.user_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()
    
    # Generate cache key
    cache_key = hashlib.sha256(f"{request.message}:{request.document_context}".encode()).hexdigest()
    if cache_key in prompt_cache:
        return ChatResponse(reply=prompt_cache[cache_key])
    
    try:
        # Construct prompt with document context if available
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

        # Persist the assistant reply
        assistant_msg = ChatMessage(user_id=request.user_id, role="assistant", content=reply)
        db.add(assistant_msg)
        db.commit()

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
        if not summary:
            raise HTTPException(status_code=500, detail="Failed to generate summary")
        return {"summary": summary}
        
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


import re
from datetime import datetime

# --------------- Full-text Conversation Search ---------------

class SearchResult(BaseModel):
    id: int
    user_id: str
    role: str
    content: str
    snippet: str
    timestamp: str

def generate_snippet(content: str, query: str, max_len: int = 150) -> str:
    """
    Extracts a snippet of text around the first match of any query terms,
    and highlights matching terms with HTML tags (e.g., <mark>term</mark>).
    """
    if not content or not query:
        return content[:max_len] + "..." if len(content) > max_len else content

    # Split query into words and escape them for regex
    words = [re.escape(w) for w in query.split() if w]
    if not words:
        return content[:max_len] + "..." if len(content) > max_len else content

    # Create regex pattern matching any of the words case-insensitively
    pattern = re.compile(rf"\b({'|'.join(words)})\b", re.IGNORECASE)
    match = pattern.search(content)

    if match:
        start_idx = match.start()
        # Center the window around the first match
        half_len = max_len // 2
        snippet_start = max(0, start_idx - half_len)
        snippet_end = min(len(content), start_idx + half_len)

        snippet = content[snippet_start:snippet_end]
        prefix = "..." if snippet_start > 0 else ""
        suffix = "..." if snippet_end < len(content) else ""
        snippet_text = prefix + snippet + suffix
        
        # Highlight matches inside the snippet
        highlighted = pattern.sub(r"<mark>\1</mark>", snippet_text)
        return highlighted
    else:
        # Fallback to beginning of content
        snippet = content[:max_len]
        suffix = "..." if len(content) > max_len else ""
        snippet_text = snippet + suffix
        highlighted = pattern.sub(r"<mark>\1</mark>", snippet_text)
        return highlighted

@router.get("/search", response_model=list[SearchResult])
async def search_messages(
    q: str = Query(..., min_length=1, description="Search query string"),
    user_id: str = Query(default=None, description="Optional user_id to scope the search"),
    limit: int = Query(default=20, ge=1, le=100, description="Max results to return"),
    db: Session = Depends(get_db),
):
    """
    Full-text search across all persisted conversation messages.
    Performs a case-insensitive substring match on message content.
    """
    words = [w.strip() for w in q.split() if w.strip()]
    if not words:
        return []

    # Build dynamically filtered query: all words must be present in the content
    query = db.query(ChatMessage)
    for word in words:
        query = query.filter(ChatMessage.content.ilike(f"%{word}%"))

    if user_id:
        query = query.filter(ChatMessage.user_id == user_id)

    results = query.all()

    # Score and sort results based on frequency of the query words in content
    scored_results = []
    for msg in results:
        # Calculate term frequency (simple relevance score)
        score = sum(msg.content.lower().count(w.lower()) for w in words)
        scored_results.append((score, msg))

    # Sort by score descending, then by timestamp descending
    scored_results.sort(key=lambda x: (x[0], x[1].timestamp or datetime.min), reverse=True)

    # Apply limit
    top_results = [msg for _, msg in scored_results[:limit]]

    return [
        SearchResult(
            id=msg.id,
            user_id=msg.user_id,
            role=msg.role,
            content=msg.content,
            snippet=generate_snippet(msg.content, q),
            timestamp=msg.timestamp.isoformat() if msg.timestamp else "",
        )
        for msg in top_results
    ]