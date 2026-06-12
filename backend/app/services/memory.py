from app.services.cache_service import cache
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.user import UserProfile


class MemoryService:
    """
    Service layer for handling persistent
    user memory operations.
    """

    MEMORY_LIMIT = 5000

    @staticmethod
    async def update_user_memory(
        db: Session,
        user_id: str,
        new_insight: str
    ) -> UserProfile:
        """
        Updates the persistent memory context
        for a user.
        """

        try:
            profile = (
                db.query(UserProfile)
                .filter(UserProfile.user_id == user_id)
                .first()
            )

            # Create profile if not exists
            if not profile:
                profile = UserProfile(
                    user_id=user_id,
                    memory_context=""
                )

                db.add(profile)

            # Existing memory
            existing_memory = (
                profile.memory_context or ""
            ).strip()

            # Append new insight
            updated_memory = (
                f"{existing_memory}\n- {new_insight}"
            ).strip()

            # Keep only latest memory limit
            profile.memory_context = (
                updated_memory[-MemoryService.MEMORY_LIMIT:]
            )

            db.commit()
            db.refresh(profile)
            cache.invalidate_memory(user_id)

            return profile

        except SQLAlchemyError as error:
            db.rollback()

            raise Exception(
                f"Failed to update memory context: {str(error)}"
            ) from error

    @staticmethod
    async def get_memory_context(
        db: Session,
        user_id: str
    ) -> str:
        """
        Retrieves the long-term memory
        context for a user.
        """

        try:
            cached = cache.get_memory(user_id)
            if cached is not None:
                return cached
            
            profile = (
                db.query(UserProfile)
                .filter(UserProfile.user_id == user_id)
                .first()
            )

            if not profile:
                return ""

            return profile.memory_context or ""
            cache.set_memory(user_id, result)
            return result

        except SQLAlchemyError as error:
            raise Exception(
                f"Failed to retrieve memory context: {str(error)}"
            ) from error