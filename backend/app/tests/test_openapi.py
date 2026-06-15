import pytest
import httpx
from httpx import AsyncClient
from app.main import app

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.anyio
async def test_openapi_spec_generation():
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/openapi.json")
        assert response.status_code == 200
        
        openapi_schema = response.json()
        assert "openapi" in openapi_schema
        assert "info" in openapi_schema
        assert "paths" in openapi_schema
        
        # Verify custom details we configured
        assert openapi_schema["info"]["title"] == "Lexicon AI API"
        
        # Verify tags metadata
        assert "tags" in openapi_schema
        tags = [t["name"] for t in openapi_schema["tags"]]
        assert "Uploads" in tags
        assert "Chat" in tags
        assert "Citations" in tags
        
        # Verify security schemes
        components = openapi_schema.get("components", {})
        assert "securitySchemes" in components
        assert "ApiKeyAuth" in components["securitySchemes"]
        assert components["securitySchemes"]["ApiKeyAuth"]["type"] == "apiKey"
        assert components["securitySchemes"]["ApiKeyAuth"]["name"] == "X-API-Key"
        
        # Verify secure requirements are globally present
        assert "security" in openapi_schema
        assert any("ApiKeyAuth" in scheme for scheme in openapi_schema["security"])

@pytest.mark.anyio
async def test_swagger_ui_endpoint():
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/docs")
        assert response.status_code == 200
        assert "swagger-ui" in response.text.lower()
