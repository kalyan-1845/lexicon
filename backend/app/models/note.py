from sqlalchemy import Column, Integer, String, Text, Float
from app.core.database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    workspace_name = Column(String, unique=True, index=True)
    content = Column(Text, default="")
    updated_at = Column(Float, default=0.0)
    version = Column(Integer, default=1)
