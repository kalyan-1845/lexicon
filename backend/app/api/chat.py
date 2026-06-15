from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
import os
import hashlib
from groq import Groq
from dotenv import load_dotenv
from app.services.notion_exporter import export_markdown_to_notion
from app.api.schemas import (
    NotionExportRequest,
    NotionExportResponse,
    ChatMessageRequest as ChatRequest,
    ChatMessageResponse as ChatResponse,
    ChatSummarizeRequest as SummarizeRequest,
    ChatSummarizeResponse,
    ChatShareRequest as ShareRequest,
    ChatShareResponse
)

load_dotenv()

router = APIRouter()

# Simple in-memory cache for demo purposes
prompt_cache = {}

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY") or "mock-key")

@router.post(
    "/cite",
    response_model=ChatResponse,
    summary="Generate citations for a source text",
    description="Simulates citation extraction for a given research text block and source metadata, returning formatted citation styles."
)
async def generate_citation(
    text: str = Query(..., description="The research text block to generate citations for"),
    source: str = Query(..., description="The source metadata label (e.g. paper title or URL)")
):
    # Simulated citation generation logic
    return {
        "reply": f"Fact: {text}",
        "citations": [
            {"style": "APA", "text": f"Lexicon AI. (2026). Analysis of {source}. Lexicon Research Hub."},
            {"style": "MLA", "text": f"Lexicon AI. 'Analysis of {source}.' Lexicon Research Hub, 2026."}
        ]
    }

from app.services.agents import AgentService

agent_service = AgentService()

@router.post(
    "/message/stream",
    response_class=StreamingResponse,
    summary="Send a message with streaming response",
    description="Streams the response from Lexicon AI's underlying agents (Researcher & Analyst) using Server-Sent Events (SSE)."
)
async def stream_message(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    return StreamingResponse(
        agent_service.run_streaming_workflow(request.message, request.document_context), 
        media_type="text/event-stream"
    )

@router.post(
    "/message",
    response_model=ChatResponse,
    summary="Send a message with static response",
    description="Queries the AI LLM model synchronously and returns a static JSON answer response. Leverages internal caching."
)
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

@router.post(
    "/summarize",
    response_model=ChatSummarizeResponse,
    summary="Summarize research document text",
    description="Sends up to 15,000 characters of document text context to the AI model to generate a high-level summary with bullet points."
)
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
        
        return ChatSummarizeResponse(summary=summary)
        
    except Exception as e:
        print(f"Error calling Groq API for summary: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization error: {str(e)}")

@router.post(
    "/share",
    response_model=ChatShareResponse,
    summary="Share a workspace or chat history",
    description="Generates a unique reference link to share a workspace with others, supporting optional password protection and public access flags."
)
async def share_workspace(request: ShareRequest, req: Request):
    import uuid
    share_id = str(uuid.uuid4())[:8]
    base_url = req.headers.get('origin', req.headers.get('referer', 'http://localhost:3000')).rstrip('/')
    return ChatShareResponse(
        share_url=f"{base_url}/w/share-{share_id}"
    )

@router.post(
    "/export/notion",
    response_model=NotionExportResponse,
    summary="Export document/chat to Notion",
    description="Exports formatted markdown text content to a specified Notion database using the Notion Workspace Integrations API."
)
async def export_to_notion(request: NotionExportRequest):
    try:
        result = export_markdown_to_notion(request.database_id, request.markdown)
        return NotionExportResponse(status="success", notion_url=result["url"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notion export error: {str(e)}")