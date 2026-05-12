import asyncio
from typing import List, Dict, Any
from app.services.llm_factory import llm

class AgentService:
    async def run_researcher(self, query: str, context: str | None = None) -> Dict[str, Any]:
        """Researcher agent focuses on data extraction and fact-finding."""
        prompt = (
            f"You are the RESEARCHER agent of Lexicon AI. Your goal is to extract facts and data "
            f"related to the query: '{query}'.\n"
        )
        if context:
            prompt += f"\nUse this document context if relevant:\n{context[:3000]}"
        
        prompt += "\n\nProvide a detailed, fact-based summary of your findings."

        await asyncio.sleep(1) 
        
        content = await llm.chat(
            messages=[
                {"role": "system", "content": "You are a precise data extraction agent. Be factual and detailed."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return {"agent": "Researcher", "content": content}

    async def run_analyst(self, query: str, research_findings: str) -> Dict[str, Any]:
        """Analyst agent focuses on synthesis and critique."""
        prompt = (
            f"You are the ANALYST agent of Lexicon AI. Synthesize the following research findings "
            f"for the query: '{query}'.\n\n"
            f"Findings:\n{research_findings}"
        )

        await asyncio.sleep(1)

        content = await llm.chat(
            messages=[
                {"role": "system", "content": "You are a sophisticated analytical agent."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        return {"agent": "Analyst", "content": content}

    async def run_multi_agent_workflow(self, query: str, context: str | None = None):
        """Orchestrates Researcher and Analyst agents."""
        research_result = await self.run_researcher(query, context)
        analyst_result = await self.run_analyst(query, research_result["content"])
        
        final_prompt = (
            f"User Query: {query}\n\n"
            f"Research: {research_result['content']}\n\n"
            f"Analysis: {analyst_result['content']}\n\n"
            f"As Lexicon AI, combine these into a final professional response."
        )

        content = await llm.chat(
            messages=[
                {"role": "system", "content": "You are Lexicon AI. Unified research-backed answer."},
                {"role": "user", "content": final_prompt}
            ],
            temperature=0.7
        )

        return {
            "reply": content,
            "steps": [
                research_result,
                analyst_result
            ]
        }
