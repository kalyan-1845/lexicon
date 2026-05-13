from sqlalchemy.orm import Session
from app.models.user import UserProfile
import json

class MemoryService:
    @staticmethod
    async def update_user_memory(db: Session, user_id: str, new_insight: str):
        """Updates the persistent memory context for a user."""
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id, memory_context="")
            db.add(profile)
        
        # Simple memory accumulation with truncation
        updated_memory = f"{profile.memory_context}\n- {new_insight}".strip()
        profile.memory_context = updated_memory[-5000:]  # Keep last 5k chars
        db.commit()
        return profile

    @staticmethod
    async def get_memory_context(db: Session, user_id: str) -> str:
        """Retrieves the long-term memory for system prompt injection."""
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        return profile.memory_context if profile else ""
