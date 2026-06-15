from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
import fitz  # PyMuPDF
import os
import re

router = APIRouter()

UPLOAD_DIR = "app/storage/uploads"

def sanitize_cite_key(name: str) -> str:
    # Generate a clean alphanumeric citekey
    clean = re.sub(r'[^a-zA-Z0-9]', '', name.lower())
    return clean[:15] if clean else "document"

@router.get("/export", response_class=PlainTextResponse)
async def export_citations():
    # Ensure upload directory exists
    if not os.path.exists(UPLOAD_DIR):
        return PlainTextResponse("% No documents uploaded in this workspace.\n")
        
    files = [f for f in os.listdir(UPLOAD_DIR) if f.endswith('.pdf')]
    if not files:
        return PlainTextResponse("% No PDF documents found in library.\n")
        
    bibtex_entries = []
    
    for filename in files:
        file_path = os.path.join(UPLOAD_DIR, filename)
        cite_key = sanitize_cite_key(filename.replace('.pdf', ''))
        
        title = filename.replace('.pdf', '')
        author = "Unknown Author"
        year = "2026"
        
        try:
            doc = fitz.open(file_path)
            meta = doc.metadata
            if meta:
                if meta.get('title') and meta.get('title').strip():
                    title = meta.get('title').strip()
                if meta.get('author') and meta.get('author').strip():
                    author = meta.get('author').strip()
                if meta.get('creationDate'):
                    # Match first 4 digits in creationDate (representing year)
                    date_match = re.search(r'\d{4}', meta.get('creationDate'))
                    if date_match:
                        year = date_match.group(0)
            doc.close()
        except Exception:
            # Graceful fallback on any PDF read errors
            pass
            
        entry = f"""@article{{{cite_key},
  author = {{{author}}},
  title = {{{title}}},
  journal = {{Lexicon AI Research Library}},
  year = {{{year}}},
  url = {{https://github.com/kalyan-1845/lexicon}},
  note = {{Uploaded research document: {filename}}}
}}"""
        bibtex_entries.append(entry)
        
    bibtex_output = "\n\n".join(bibtex_entries) + "\n"
    
    return PlainTextResponse(
        content=bibtex_output,
        headers={"Content-Disposition": "attachment; filename=lexicon_citations.bib"}
    )
