import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_upload_invalid_format():
    files = {"file": ("test.exe", b"invalid content", "application/x-msdownload")}
    response = client.post("/api/upload/pdf", files=files)
    assert response.status_code == 400
    assert "Unsupported" in response.json()["detail"] or "Only PDF" in response.json()["detail"]

def test_chat_empty_message():
    response = client.post("/api/chat/message", json={"message": ""})
    assert response.status_code == 400
