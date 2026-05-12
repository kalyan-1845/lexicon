import httpx
from groq import Groq
from app.core.config import settings

class LLMFactory:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)

    async def call_groq(self, messages, temperature=0.7):
        completion = self.groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=temperature
        )
        return completion.choices[0].message.content

    async def call_ollama(self, messages, temperature=0.7):
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        payload = {"model": settings.OLLAMA_MODEL, "messages": messages, "stream": False}
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            data = response.json()
            return data["message"]["content"]

    async def chat(self, messages, provider=None, **kwargs):
        provider = provider or settings.DEFAULT_PROVIDER
        if provider == "groq":
            return await self.call_groq(messages, **kwargs)
        return await self.call_ollama(messages, **kwargs)

llm = LLMFactory()
