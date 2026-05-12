# Lexicon AI — Professional Research Workspace

> A high-performance, minimalist AI workspace for deep research, document intelligence, and multi-agent workflows.

![Lexicon AI Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)

## ⚡ Evolution: The "Expert Mode" Redesign
Lexicon AI has evolved from a simple prototype into a **professional-grade research environment**. We have moved away from heavy "glassmorphism" in favor of a **Neutral Professional Design System**—inspired by high-end engineering tools like Linear and Raycast.

### Key Innovations in V1.2 (Current)
*   **Ultra-Compact "Expert" UI**: A high-density, minimalist layout that stays out of your way and focuses on the research canvas.
*   **True Workspace Isolation**: Isolated document libraries and chat histories per research project.
*   **Hierarchical Organization**: Organize multiple Workspaces inside Collections (Folders) for massive scalability.
*   **Unified Right Sidebar**: A streamlined, tabbed panel for Knowledge (PDFs) and Insights (Notes).
*   **Voice AI Integration**: Native "Listening" mode for hands-free AI interaction.
*   **Granular Access Control**: Toggle between Public and Private workspace sharing with a single click.

---

## 🚀 Quick Start

Get Lexicon AI running locally in under 5 minutes:

### 1. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Start the Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🧠 Core Features

1.  **AI Research Engine**: Ask complex questions across multiple uploaded PDFs. Context-aware RAG ensures precise citations.
2.  **Dynamic Workspaces**: Create isolated hubs for different topics (e.g., "Neural Networks", "Market Trends").
3.  **Collection Filtering**: Organize dozens of projects into categorized folders.
4.  **Smart Insights**: A dedicated markdown editor for capturing AI-generated insights alongside your chat.
5.  **Multi-Agent Visualization**: Track the status of your research agents (Researcher, Analyst, Writer) in real-time.
6.  **Secure Sharing**: Generate public research links or keep your workspace 100% private.

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 14, React, TypeScript, TailwindCSS (Professional Neutral Theme)
*   **Backend**: FastAPI, Python 3.10+
*   **AI Engine**: LangChain, Groq (Llama 3), Ollama (Local LLM Support)
*   **Processing**: PyPDF2, SpeechRecognition
*   **Design**: Custom Minimalist Component Library

---

## 🗺 Roadmap Progress
- [x] Phase 1: Core Chat & PDF RAG
- [x] Phase 2: Professional UI Overhaul & UX Unification
- [x] Phase 3: Voice AI & Workspace Persistence
- [ ] Phase 4: Real-time Multi-Agent Orchestration (In Progress)
- [ ] Phase 5: Plugin Ecosystem & Public API

---

## 📜 License
MIT License. Created for the NSoC'26 Competition.
