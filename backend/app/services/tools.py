import httpx
import xml.etree.ElementTree as ET
from typing import Dict, Any, Callable

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Dict[str, Any]] = {}

    def register_tool(self, name: str, description: str, func: Callable):
        self.tools[name] = {"description": description, "func": func}

    async def execute_tool(self, name: str, **kwargs) -> Any:
        if name not in self.tools: return f"Error: Tool '{name}' not found."
        return await self.tools[name]["func"](**kwargs)

    def get_tool_descriptions(self) -> str:
        return "\n".join([f"- {name}: {info['description']}" for name, info in self.tools.items()])

async def arxiv_search(query: str) -> str:
    """Fetches academic papers from ArXiv."""
    url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results=3"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            root = ET.fromstring(response.text)
            papers = []
            for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
                title = entry.find('{http://www.w3.org/2005/Atom}title').text.strip()
                summary = entry.find('{http://www.w3.org/2005/Atom}summary').text.strip()[:300]
                papers.append(f"Title: {title}\nAbstract: {summary}...")
            return "\n\n".join(papers) if papers else "No papers found."
        except Exception as e: return f"Error: {str(e)}"

async def wikipedia_search(query: str) -> str:
    """Fetches summaries from Wikipedia."""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query.replace(' ', '_')}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 404: return f"No Wikipedia page found for '{query}'."
            data = response.json()
            return f"Title: {data.get('title')}\nSummary: {data.get('extract')}"
        except Exception as e: return f"Error: {str(e)}"

registry = ToolRegistry()
registry.register_tool("arxiv_search", "Searches ArXiv for academic papers.", arxiv_search)
registry.register_tool("wikipedia_search", "Fetches summaries from Wikipedia for general knowledge.", wikipedia_search)

