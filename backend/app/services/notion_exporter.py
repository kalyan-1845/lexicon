from notion_client import Client
import os

notion = Client(auth=os.getenv("NOTION_API_KEY"))

def export_markdown_to_notion(database_id: str, markdown_content: str):
    blocks = [
        {
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": markdown_content}}]
            }
        }
    ]

    response = notion.pages.create(
        parent={"database_id": database_id},
        properties={
            "Name": {"title": [{"text": {"content": "Lexicon Export"}}]}
        },
        children=blocks
    )
    return response
