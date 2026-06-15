from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    role = Column(String, index=True)  # 'user' or 'assistant'
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
