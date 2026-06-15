from pydantic import BaseModel

class ExportRequest(BaseModel):
    database_id: str
    markdown: str

# Alias used by chat.py
NotionExportRequest = ExportRequest
