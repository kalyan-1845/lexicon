# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-08

### Added
- **Multi-Agent Swarm Orchestration**: Added CrewAI agent swarms with dedicated roles: Scholar (researcher), Analyst (validator), and Composer (writer).
- **Stream Ingestion & SSE**: Implemented Server-Sent Events (SSE) for real-time telemetry streaming of AI reasoning processes.
- **Academic Citation Engine**: Created automated lookup, verification, and referencing of academic research citations.
- **Next.js 14 Rewrite**: Ported frontend to Next.js 14 App Router with advanced UI styling, shortcuts panel, and command palette.
- **NSoC'26 Program Support**: Integrated custom contributor workflows, `/assign` auto-assignment actions, and progress logs.

### Changed
- Refactored backend into structured directories: `api/`, `core/`, `models/`, and `services/`.
- Upgraded the design system to a dark-mode-first premium layout with glassmorphism elements.

## [1.0.0] - 2026-05-15

### Added
- **Core RAG Engine**: Added document uploading, processing, and context-aware lexical search capabilities.
- **ChromaDB Database**: Integrated pgvector and ChromaDB vector store for document indexing and retrieval.
- **Docker Compose Setup**: Full multi-container configuration for frontend, backend, PostgreSQL database, and Ollama.
- **Workspace Separation**: Implemented isolated namespace state memory per active project.
