import asyncio
import json
from typing import List, Dict, Any, AsyncGenerator
from app.services.llm_factory import llm

class AgentService:
    async def run_streaming_workflow(self, query: str, context: str | None = None) -> AsyncGenerator[str, None]:
        """
        Orchestrates Researcher and Analyst agents in a streaming fashion.
        Yields JSON strings formatted as SSE data.
        """
        
        # Phase 1: Research
        yield self._format_status("Researcher", "Fact-finding and context extraction...")
        await asyncio.sleep(1.5) # Simulate research depth
        
        research_prompt = (
            f"You are the RESEARCHER agent. Extract core facts for: '{query}'.\n"
            f"Context: {context[:3000] if context else 'No document context provided.'}"
        )
        
        research_content = await llm.chat(
            messages=[
                {"role": "system", "content": "You are a precise data extraction agent. Be factual and bulleted."},
                {"role": "user", "content": research_prompt}
            ],
            temperature=0.2
        )
        
        # Phase 2: Analysis
        yield self._format_status("Analyst", "Synthesizing findings and identifying patterns...")
        await asyncio.sleep(1.2) # Simulate cognitive load
        
        analysis_prompt = (
            f"As the ANALYST, synthesize these findings for the query: '{query}'\n\n"
            f"Findings:\n{research_content}"
        )
        
        analysis_content = await llm.chat(
            messages=[
                {"role": "system", "content": "You are a sophisticated analytical agent. Critical and deep."},
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.4
        )
        
        # Phase 3: Final Synthesis & Streaming
        yield self._format_status("Lexicon", "Finalizing professional response...")
        
        final_prompt = (
            f"User Query: {query}\n\n"
            f"Research: {research_content}\n\n"
            f"Analysis: {analysis_content}\n\n"
            f"Synthesize the final answer. Be concise and authoritative."
        )

        # Stream the final response
        try:
            completion = await llm.stream_chat(
                messages=[
                    {"role": "system", "content": "You are Lexicon AI. Provide the final unified answer."},
                    {"role": "user", "content": final_prompt}
                ],
                temperature=0.6
            )
            
            async for chunk in completion:
                if chunk:
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    def _format_status(self, agent: str, message: str) -> str:
        return f"data: {json.dumps({'status': message, 'agent': agent})}\n\n"

    async def run_researcher(self, query: str, context: str | None = None) -> Dict[str, Any]:
        """Researcher agent focuses on data extraction and fact-finding."""
        return {"agent": "Researcher", "content": "Deprecated in favor of streaming workflow."}
