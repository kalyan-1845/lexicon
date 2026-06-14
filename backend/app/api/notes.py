from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import time

from app.core.database import SessionLocal
from app.models.note import Note

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class NoteSyncRequest(BaseModel):
    content: str
    updatedAt: float
    localVersion: int

class NoteSyncResponse(BaseModel):
    content: str
    updatedAt: float
    version: int
    conflict: bool

@router.get("/{workspace_name}")
def get_note(workspace_name: str, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.workspace_name == workspace_name).first()
    if not note:
        note = Note(
            workspace_name=workspace_name,
            content="# Research Notes\n\nStart typing your insights here...",
            updated_at=time.time(),
            version=1
        )
        db.add(note)
        db.commit()
        db.refresh(note)
    
    return {
        "content": note.content,
        "updatedAt": note.updated_at,
        "version": note.version
    }

@router.post("/{workspace_name}/sync", response_model=NoteSyncResponse)
def sync_note(workspace_name: str, req: NoteSyncRequest, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.workspace_name == workspace_name).first()
    if not note:
        note = Note(
            workspace_name=workspace_name,
            content=req.content,
            updated_at=req.updatedAt,
            version=1
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return NoteSyncResponse(
            content=note.content,
            updatedAt=note.updated_at,
            version=note.version,
            conflict=False
        )

    # Last Write Wins (LWW) conflict resolution
    # If the server has a newer timestamp than what the client is trying to save,
    # reject the client's write and send back the server's version.
    if note.updated_at > req.updatedAt:
        return NoteSyncResponse(
            content=note.content,
            updatedAt=note.updated_at,
            version=note.version,
            conflict=True
        )
    
    # Otherwise, accept the client's update
    note.content = req.content
    note.updated_at = req.updatedAt
    note.version += 1
    
    db.commit()
    db.refresh(note)
    
    return NoteSyncResponse(
        content=note.content,
        updatedAt=note.updated_at,
        version=note.version,
        conflict=False
    )
