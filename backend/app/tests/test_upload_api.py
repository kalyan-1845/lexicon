"""
Isolated unit tests for the batch PDF upload API (Issue #506).

We import the upload router directly onto a lightweight FastAPI app to avoid
triggering the Groq / LLM client initialisation in app.main, which requires
a GROQ_API_KEY that is not present in the test environment.

All tests run on asyncio only (trio is not installed here).
"""

import pytest
import fitz  # PyMuPDF
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

# Import ONLY the upload router — avoids Groq/LLM startup cost
from app.api.upload import router as upload_router

# ── Minimal test app ──────────────────────────────────────────────────────────
# Variable is prefixed with _ so pytest doesn't try to collect it as a test.
_app = FastAPI()
_app.include_router(upload_router, prefix="/api/upload")


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_pdf(text: str = "Hello Lexicon") -> bytes:
    """Return bytes of a valid in-memory PDF containing `text`."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def client() -> AsyncClient:
    """Return an HTTPX AsyncClient wired to the test app."""
    return AsyncClient(transport=ASGITransport(app=_app), base_url="http://test")


# ── Tests — all pinned to asyncio; trio is not installed ─────────────────────

@pytest.mark.anyio(backend="asyncio")
async def test_upload_pdf_success():
    """Single valid PDF is parsed and extracted text is returned."""
    pdf_bytes = make_pdf("Lexicon research document text content.")

    async with client() as ac:
        response = await ac.post(
            "/api/upload/pdf",
            files={"file": ("test_doc.pdf", pdf_bytes, "application/pdf")},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_doc.pdf"
    assert data["status"] == "success"
    assert "extracted_character_count" in data
    assert "full_text" in data
    assert "Lexicon research document" in data["full_text"]


@pytest.mark.anyio(backend="asyncio")
async def test_upload_pdf_invalid_format():
    """Non-PDF file must be rejected immediately with HTTP 400."""
    async with client() as ac:
        response = await ac.post(
            "/api/upload/pdf",
            files={"file": ("note.txt", b"plain text content", "text/plain")},
        )

    assert response.status_code == 400
    assert "Only PDF files are allowed" in response.json()["detail"]


@pytest.mark.anyio(backend="asyncio")
async def test_upload_pdf_too_large():
    """PDF whose byte size exceeds 10 MB must be rejected with HTTP 413."""
    small_pdf = make_pdf("Size test")
    # Pad to just over 10 MB using comment lines (valid trailing PDF bytes)
    padding = b"%% padding\n" * ((10 * 1024 * 1024 // 11) + 1)
    oversized = small_pdf + padding

    async with client() as ac:
        response = await ac.post(
            "/api/upload/pdf",
            files={"file": ("huge.pdf", oversized, "application/pdf")},
        )

    assert response.status_code == 413
    assert "10MB" in response.json()["detail"]


@pytest.mark.anyio(backend="asyncio")
async def test_upload_batch_all_valid():
    """Batch endpoint returns HTTP 200 with per-file success for every valid PDF."""
    pdf1 = make_pdf("First research document.")
    pdf2 = make_pdf("Second research document.")

    async with client() as ac:
        response = await ac.post(
            "/api/upload/batch",
            files=[
                ("files", ("doc1.pdf", pdf1, "application/pdf")),
                ("files", ("doc2.pdf", pdf2, "application/pdf")),
            ],
        )

    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 2

    assert results[0]["filename"] == "doc1.pdf"
    assert results[0]["status_code"] == 200
    assert results[0]["status"] == "success"
    assert "First research document." in results[0]["full_text"]

    assert results[1]["filename"] == "doc2.pdf"
    assert results[1]["status_code"] == 200
    assert results[1]["status"] == "success"
    assert "Second research document." in results[1]["full_text"]


@pytest.mark.anyio(backend="asyncio")
async def test_upload_batch_error_isolation():
    """
    Acceptance criteria §2 — if one file in the batch fails (wrong format or
    too large), all other files must still complete successfully and return
    their own isolated status codes.
    """
    valid_pdf = make_pdf("Valid research PDF.")
    small_pdf = make_pdf("Size test")
    padding   = b"%% padding\n" * ((10 * 1024 * 1024 // 11) + 1)
    large_pdf = small_pdf + padding

    async with client() as ac:
        response = await ac.post(
            "/api/upload/batch",
            files=[
                ("files", ("valid.pdf",   valid_pdf,  "application/pdf")),
                ("files", ("invalid.txt", b"not a pdf", "text/plain")),
                ("files", ("large.pdf",   large_pdf,  "application/pdf")),
            ],
        )

    # The batch endpoint always returns HTTP 200; errors are per-file
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 3

    # valid.pdf → success (unaffected by the other two failures)
    assert results[0]["filename"] == "valid.pdf"
    assert results[0]["status_code"] == 200
    assert results[0]["status"] == "success"
    assert "Valid research PDF." in results[0]["full_text"]

    # invalid.txt → format error (isolated)
    assert results[1]["filename"] == "invalid.txt"
    assert results[1]["status_code"] == 400
    assert results[1]["status"] == "error"
    assert "Only PDF" in results[1]["detail"]

    # large.pdf → size-limit error (isolated)
    assert results[2]["filename"] == "large.pdf"
    assert results[2]["status_code"] == 413
    assert results[2]["status"] == "error"
    assert "10MB" in results[2]["detail"]
