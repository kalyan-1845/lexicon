# 📚 Lexicon AI — Agentic Research Workspace

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-3.10+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![CrewAI](https://img.shields.io/badge/CrewAI-Agentic-blue?style=flat-square)](https://github.com/joaomdmoura/crewai)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-VectorStore-orange?style=flat-square)](https://www.trychroma.com/)

A high-performance, minimalist, privacy-first AI workspace designed for deep literature research, multi-agent orchestration, and localized retrieval-augmented generation (RAG).

```mermaid
graph TD
    User([Researcher]) -->|Uploads PDF/Doc| UI[Next.js Frontend]
    UI -->|JSON Action| API[FastAPI Backend]
    API -->|Index Document| Chroma[(ChromaDB Vector Store)]
    API -->|Init Agents| Crew[CrewAI Agentic Swarm]
    Crew -->|Step 1: Scans & Reads| R[Researcher Agent]
    Crew -->|Step 2: Analysis & Critique| A[Analyst Agent]
    Crew -->|Step 3: Synthesizes Insights| W[Writer Agent]
    W -->|Outputs Draft| MD[Insights Markdown Editor]
    R -->|Semantic Search| Chroma
```

## 🏗 System Architecture (Agentic Workflow)
Lexicon implements a highly decoupled **Multi-Agent Orchestration** design pattern:
1. **The Scholar**: Ingests, parses, and Indexes uploaded scientific documents and online web telemetry.
2. **The Analyst**: Validates factual consistency, resolves contradictory literature, and maps citations.
3. **The Composer**: Formulates final markdown insight documents, outputting them straight to the client.

## ⚡ Key Highlights
- **True Workspace Separation**: isolated vector namespaces and context memory pools per active project.
- **Agentic Telemetry Stream**: Real-time server-sent events (SSE) trace internal reasoning logs and step-by-step logic loops.
- **Localized Embeddings & Inference**: Seamless connection to Ollama for zero-leak local processing.

## 🛠 Technology Stack
- **Frontend Core**: Next.js 14, TypeScript, TailwindCSS
- **Server API**: FastAPI (Asynchronous Python 3.10+)
- **Semantic Store**: ChromaDB Vector Database
- **Swarm Orchestration**: CrewAI & LangChain modules

## 🚀 Quick Setup
1. **Frontend Server**:
   ```bash
   cd frontend && npm install && npm run dev
   ```
2. **Backend Engine**:
   ```bash
   cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
   ```

## 📜 License
MIT License. Developed by Kalyan Reddy for autonomous research environments.
