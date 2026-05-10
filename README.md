# Lexicon AI

> Open-source AI workspace for research, productivity, and collaboration.

## Introduction
Lexicon AI is an open-source AI research and productivity workspace that helps users organize knowledge, analyze documents, automate workflows, and collaborate using intelligent AI systems. Built for developers, researchers, students, and productivity-focused teams.

*[Live Preview Coming Soon! (Vercel & Railway Deployments)]*

## Quick Start

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

## One-Line Tagline
An open-source AI workspace for research, productivity, document intelligence, and team collaboration.

## Project Vision
Lexicon AI is a modern AI-powered productivity and research platform designed to help students, developers, researchers, startups, and teams work smarter using AI. 

The platform combines:
- AI document understanding
- Research assistance
- Note management
- Productivity workflows
- AI chat with files
- Task organization
- Knowledge management

into one unified workspace.

The goal is to create a real-world open-source AI ecosystem where contributors can build production-grade features while helping users improve learning, research, and workflow efficiency.

## Problem Statement
Most AI tools today are isolated, expensive, privacy-invasive, difficult to customize, and not open source. Users constantly switch between ChatGPT, Notion, Google Docs, PDF readers, task managers, and bookmarking apps. 

Lexicon AI solves this by providing:
- One unified AI workspace
- Local or cloud AI support
- Intelligent research tools
- Productivity automation
- Collaborative workflows

## Core Features
1. **AI Research Assistant**: Ask questions from uploaded PDFs, Research summarization, AI-generated notes, Smart references, Context-aware search
2. **AI Chat Workspace**: Multi-chat sessions, Persistent memory, File-aware conversations, Markdown support, Export chats
3. **Document Intelligence**: PDF analysis, Resume analysis, Text extraction, AI summaries, Keyword extraction
4. **Productivity Workspace**: Smart notes, AI task suggestions, Daily planner, Workspace organization, Knowledge storage
5. **Team Collaboration**: Shared workspaces, Team notes, Research sharing, Collaborative editing, Role-based access
6. **AI Workflow Automation**: Research pipelines, AI-generated reports, Automated summarization, Multi-agent task handling

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: FastAPI, Python
- **AI Stack**: LangChain, Ollama, OpenAI APIs, Vector Database
- **Database**: PostgreSQL
- **Authentication**: Clerk/Auth.js
- **Deployment**: Docker, Vercel, Railway

## Open Source Contribution Areas
Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute.

## Future Scope
See the roadmap in [roadmap.md](./roadmap.md) and future scope details.
- AI browser extension
- Mobile app
- AI voice assistant
- Enterprise collaboration
- Offline AI support
- AI operating workspace

## License
MIT License. See [LICENSE](./LICENSE) for more details.
