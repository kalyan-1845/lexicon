# backend/tests/test_chat_api.py
import pytest
from httpx import AsyncClient
from app.main import app  # adjust if your FastAPI app is in a different path

@pytest.mark.asyncio
async def test_chat_message_valid():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"message": "Hello AI"}
        response = await ac.post("/api/chat/message", json=payload)
        assert response.status_code == 200
        assert "reply" in response.json()

@pytest.mark.asyncio
async def test_chat_message_empty():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"message": ""}
        response = await ac.post("/api/chat/message", json=payload)
        assert response.status_code == 400

@pytest.mark.asyncio
async def test_chat_summarize():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"text": "This is a long text that needs summarizing."}
        response = await ac.post("/api/chat/summarize", json=payload)
        assert response.status_code == 200
        assert "summary" in response.json()

@pytest.mark.asyncio
async def test_chat_share():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"message_id": "12345"}
        response = await ac.post("/api/chat/share", json=payload)
        # Could be 200 or 429 depending on rate limit logic
        assert response.status_code in [200, 429]
