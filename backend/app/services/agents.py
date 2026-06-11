import asyncio
import json
from typing import List, Dict, Any, AsyncGenerator
from app.services.llm_factory import llm
from app.services.cache_service import cache  

class AgentService:
    async def run_streaming_workflow(self, query: str, context: str | None = None) -> AsyncGenerator[str, None]:
        """
        Orchestrates Researcher and Analyst agents in a streaming fashion.
        Yields JSON strings formatted as SSE data.
        """
        
        # Phase 1: Research
        yield self._format_status("Researcher", "Scanning document context and extracting factual nodes...")
        await asyncio.sleep(1.2) # Simulate research depth
        
        research_prompt = (
            f"You are the RESEARCHER agent. Extract core facts, key metrics, and supporting evidence for: '{query}'.\n"
            f"Active Document Context: {context[:4500] if context else 'No document context provided.'}\n\n"
            "Methodically parse the context and extract key facts under the following structure:\n"
            "1. Key Findings & Statistics (Extract any numbers, metrics, dates)\n"
            "2. Critical Arguments & Claims\n"
            "3. Contextual Caveats or Technical Specs"
        )
        research_content = cache.get_embedding("researcher", f"{query}:{(context or '')[:500]}")
        if research_content is None:
            research_content = await llm.chat(
            messages=[
                {"role": "system", "content": "You are a precise data extraction agent. Be factual, objective, and structured. Identify exact details, numbers, and core claims from the context."},
                {"role": "user", "content": research_prompt}
            ],
            temperature=0.1
        )
        cache.set_embedding("researcher", f"{query}:{(context or '')[:500]}", research_content)
        
        # Phase 2: Analysis
        yield self._format_status("Analyst", "Critiquing evidence, resolving gaps, and synthesizing insights...")
        await asyncio.sleep(1.0) # Simulate cognitive load
        
        analysis_prompt = (
            f"As the ANALYST, critically evaluate and synthesize the research findings for the user query: '{query}'\n\n"
            f"Extracted Findings:\n{research_content}\n\n"
            "Analyze patterns, contradictions, and connect the dots. Synthesize your assessment into:\n"
            "- Analytical Insights (What does this mean? What are the implications?)\n"
            "- Structural Synthesis (How should this be structured in the final report? Suggest headings/tables)"
        )
        
        analysis_content = cache.get_embedding("analyst", research_content[:1000])
        if analysis_content is None:
            analysis_content = await llm.chat(
            messages=[
                {"role": "system", "content": "You are a sophisticated analytical agent. Critical, logical, and deep. Identify hidden relationships, verify evidence, and propose structural layouts for synthesis."},
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.3
        )
        cache.set_embedding("analyst", research_content[:1000], analysis_content)
        
        # Phase 3: Final Synthesis & Streaming
        yield self._format_status("Lexicon", "Synthesizing master response into markdown panel...")
        
        final_prompt = (
            f"User Query: {query}\n\n"
            f"Research Stage Factsheet:\n{research_content}\n\n"
            f"Analytical Synthesizer Critique:\n{analysis_content}\n\n"
            "You are Lexicon AI. Synthesize the final response. It must be highly professional, detailed, and clean.\n"
            "Structure your output beautifully with the following Markdown components:\n"
            "1. Use header levels (##, ###) for clear categorization.\n"
            "2. Include a brief bolded 'Executive Summary' at the start.\n"
            "3. Provide structured tables or comparison charts when listing metrics or options (use markdown pipe tables like | Head | Head |).\n"
            "4. End with a bulleted list of 'Key Takeaways' or 'Actionable Insights'.\n"
            "Ensure the tone is authoritative and polished."
        )

        # Stream the final response
        try:
            completion = llm.stream_chat(
                messages=[
                    {"role": "system", "content": "You are Lexicon AI, the core intelligence of the Lexicon Research Workspace. Provide the final unified answer, fully formatted with headers, bolding, lists, and tables where applicable."},
                    {"role": "user", "content": final_prompt}
                ],
                temperature=0.5
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
