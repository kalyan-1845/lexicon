import os
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

class LLMFactory:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"

    async def chat(self, messages, temperature=0.7, max_tokens=1024):
        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=False
        )
        return completion.choices[0].message.content

    async def stream_chat(self, messages, temperature=0.7):
        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            stream=True
        )
        async for chunk in completion:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

llm = LLMFactory()
