from pydantic import BaseModel

class ExportRequest(BaseModel):
    database_id: str
    markdown: str

# Alias used in chat.py — keeps the router import consistent
NotionExportRequest = ExportRequest
