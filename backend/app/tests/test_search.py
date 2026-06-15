import pytest
import httpx
from httpx import AsyncClient
from app.main import app
from app.core.database import get_db, Base, engine
from app.models.chat import ChatMessage
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Use a test database for clean testing
TEST_DATABASE_URL = "sqlite:///./test_search.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Override the database dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture(autouse=True)
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    # Clear existing messages
    db.query(ChatMessage).delete()
    
    # Insert dummy messages
    messages = [
        ChatMessage(
            user_id="user_1",
            role="user",
            content="I am developing a full-text search engine for Lexicon workspace."
        ),
        ChatMessage(
            user_id="user_1",
            role="assistant",
            content="That is great! Let me know if you need assistance with Python and database logic."
        ),
        ChatMessage(
            user_id="user_2",
            role="user",
            content="Can we use PostgreSQL or SQLite for indexing documents?"
        )
    ]
    db.add_all(messages)
    db.commit()
    db.close()
    yield
    # Drop tables after test
    Base.metadata.drop_all(bind=test_engine)

@pytest.mark.anyio
async def test_search_word_splitting():
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/chat/search", params={"q": "Lexicon search"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert "developing a full-text search engine" in data[0]["content"]
        assert "<mark>search</mark>" in data[0]["snippet"].lower()
        assert "<mark>lexicon</mark>" in data[0]["snippet"].lower()

@pytest.mark.anyio
async def test_search_user_scoping():
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        # User 1 query should find nothing for PostgreSQL keyword
        response = await ac.get("/api/chat/search", params={"q": "PostgreSQL", "user_id": "user_1"})
        assert response.status_code == 200
        assert len(response.json()) == 0

        # User 2 query should find PostgreSQL keyword
        response = await ac.get("/api/chat/search", params={"q": "PostgreSQL", "user_id": "user_2"})
        assert response.status_code == 200
        assert len(response.json()) == 1

@pytest.mark.anyio
async def test_search_no_results():
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/chat/search", params={"q": "nonexistentkeyword"})
        assert response.status_code == 200
        assert len(response.json()) == 0
