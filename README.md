# Lexicon AI — Agentic Research Workspace
> A high-performance, minimalist AI workspace designed for deep research and multi-agent orchestration.

![Lexicon AI Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)

## 💡 The Problem
In the age of LLMs, the problem isn't getting answers—it's **information overload** and **context fragmentation**. Researchers spend more time managing tabs and copy-pasting than actually thinking. Lexicon AI solves this by creating a "Single Source of Truth" where AI agents work *for* you inside isolated, context-aware workspaces.

## 🏗 System Architecture (Agentic Workflow)
Lexicon uses a **Multi-Agent Orchestration** pattern:
1. **The Researcher**: Scans uploaded documents and live web data.
2. **The Analyst**: Synthesizes findings and identifies contradictions.
3. **The Writer**: Drafts reports into the integrated "Insights" markdown editor.

## ⚡ Key Innovations
*   **True Workspace Isolation**: 100% separate vector databases and chat histories per project.
*   **Agentic Status Stream**: Real-time visualization of agent "thought processes" using Server-Sent Events (SSE).
*   **Offline-First Voice AI**: Native "Listening" mode for hands-free research interaction.
*   **Zero-Boilerplate RAG**: High-precision citations mapped directly back to source PDFs.

## 🛠 Tech Stack
*   **Frontend**: Next.js 14, TypeScript, TailwindCSS (Professional Neutral Theme)
*   **Backend**: FastAPI (Asynchronous Python 3.10+)
*   **Agentic Framework**: CrewAI / LangChain
*   **Intelligence**: Groq (Llama 3.3), Ollama (Local Support for privacy-first research)
*   **Storage**: Vector Store (ChromaDB), JSON-based persistence for lightweight workspaces.

## 🚀 Quick Start
1. **Start the Frontend**: `cd frontend && npm install && npm run dev`
2. **Start the Backend**: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`

## 📜 License
MIT License. Created by Bhoompally Kalyan Reddy for the NSoC'26 Competition.
