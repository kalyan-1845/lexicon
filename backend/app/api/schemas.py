from pydantic import BaseModel, Field

class ExportRequest(BaseModel):
    database_id: str = Field(..., description="The Notion database ID to export to", example="1234abcd5678efgh9012ijkl3456mnop")
    markdown: str = Field(..., description="Markdown content to export to Notion", example="# Document title\nThis is some document text.")

class NotionExportRequest(ExportRequest):
    pass

class NotionExportResponse(BaseModel):
    status: str = Field(..., description="Export status (success or error)", example="success")
    notion_url: str = Field(..., description="URL to the exported Notion page", example="https://www.notion.so/my-workspace/page-id")

class DeleteFileResponse(BaseModel):
    message: str = Field(..., description="Result message indicating success or failure", example="File test.pdf deleted successfully")

class UploadPDFResponse(BaseModel):
    filename: str = Field(..., description="Name of the uploaded file", example="scanned_report.pdf")
    ocr_status: str = Field(..., description="Indication if OCR was applied or skipped", example="Success (OCR Applied)")
    status: str = Field(..., description="Status of the upload", example="success")
    message: str = Field(..., description="Response message", example="File successfully uploaded and parsed in-memory.")
    extracted_character_count: int = Field(..., description="Number of characters extracted from the PDF", example=4820)
    full_text: str = Field(..., description="Full text extracted from the PDF", example="Extracted text content from the PDF...")
    preview: str = Field(..., description="Short preview of the first 200 characters of the extracted text", example="Extracted text content...")

class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="Input message query to Lexicon AI", example="What is full-text search?")
    document_context: str | None = Field(default=None, description="Optional PDF document text context for grounded answers", example="Lexicon is a workspace.")
    user_id: str = Field(default="default_user", description="ID of the user sending the message", example="user_123")

class ChatMessageResponse(BaseModel):
    reply: str = Field(..., description="AI generated response message", example="Lexicon AI is an assistant...")
    citations: list[dict] | None = Field(default=None, description="List of generated citations supporting the response", example=[{"style": "APA", "text": "Lexicon AI (2026)..."}])

class ChatSummarizeRequest(BaseModel):
    text: str = Field(..., description="Text content to be summarized", example="This is a long article about AI workspaces...")

class ChatSummarizeResponse(BaseModel):
    summary: str = Field(..., description="Generated summary of the text", example="The article discusses AI workspaces...")

class ChatShareRequest(BaseModel):
    message_id: str = Field(..., description="Unique ID of the message to share", example="12345")

class ChatShareResponse(BaseModel):
    share_url: str = Field(..., description="Shared URL for the conversation/message", example="https://lexicon.ai/share/12345")

class RootResponse(BaseModel):
    message: str = Field(..., description="Welcome message from the API", example="Welcome to Lexicon AI API")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall API health status", example="healthy")
    cache: str = Field(..., description="Cache service connection status", example="connected")
