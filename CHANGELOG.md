# Changelog

All notable changes to Lexicon AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-06-14

### Added
- **Real-time Collaboration** — WebSocket-based multiplayer workspace with presence indicators.
- **Notion Export** — Export markdown research insights directly to Notion databases.
- **Mobile Sidebar** — Fully responsive sidebar with overlay and swipe-to-close on mobile devices.
- **Message Timestamps** — Display timestamps on all chat messages.
- **Message Retry** — Retry failed AI responses with a single click.
- **Session Heartbeats** — Backend session keepalive for long research sessions.
- **Copy Button** — One-click copy for code blocks and AI responses.
- **Clear History Modal** — Confirmation dialog before clearing chat history.
- **Auto-save Notes** — Automatic saving of research notes to local storage.
- **Custom Scrollbars** — Styled scrollbars matching the dark theme.

### Fixed
- Fixed mobile sidebar overlay not closing on navigation.
- Fixed multiple default exports in ChatArea.tsx causing build failures.
- Fixed empty message edge case causing API errors.

### Changed
- Renamed NSoC labels from `level-1/2/3` to `level1/2/3` per program requirements.
- Centralized API configuration into a unified config module.

---

## [1.0.0] — 2026-05-15

### Added
- **Multi-Agent AI System** — Scholar, Analyst, and Composer agents powered by CrewAI.
- **PDF Document Ingestion** — Upload and parse research papers with automatic chunking.
- **Semantic Search & RAG** — ChromaDB vector store with retrieval-augmented generation.
- **Real-Time Agent Telemetry** — Server-Sent Events streaming agent reasoning logs.
- **Workspace Isolation** — Isolated vector namespaces per research project.
- **Markdown Insights Editor** — AI-generated research reports as editable markdown.
- **Automated Citation Engine** — Academic-grade citations with cross-reference mapping.
- **Intelligent Chat Interface** — Command palette, keyboard shortcuts, premium UI.
- **Dark Mode & Theming** — Dynamic theme switching with responsive design.
- **Docker Support** — Full-stack Docker Compose configuration.
- **CI/CD Pipeline** — GitHub Actions for linting, testing, and deployment.
- **Vercel Deployment** — Automated frontend deployment to Vercel.

---

## [0.1.0] — 2026-04-01

### Added
- Initial project scaffold with Next.js 14 frontend and FastAPI backend.
- Basic chat interface with single AI agent.
- PDF upload endpoint.
- ChromaDB integration for vector storage.
