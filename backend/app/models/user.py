from sqlalchemy import Column, Integer, String, JSON
from app.core.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    preferences = Column(JSON, default={})
    memory_context = Column(String, default="")  # Long-term agent memory

class ResearchHistory(Base):
    __tablename__ = "research_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    query = Column(String)
    summary = Column(String)
    timestamp = Column(Integer)
