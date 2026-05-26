# Contributing to Lexicon AI

First off, thank you for considering contributing to Lexicon AI! It's people like you that make Lexicon a better research tool for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (be respectful, be inclusive, and follow professional standards).

## How Can I Contribute?

### Reporting Bugs
- Before creating a new issue, please check if the bug has already been reported.
- Use the "Bug Report" template and provide as much detail as possible.

### Suggesting Enhancements
- If you have an idea for a new feature or plugin, open an "Enhancement" issue first to discuss it with the maintainers.

### Pull Requests
1. **Fork the repository** and create your branch from `main`.
2. **Modularize your changes**: We prefer small, focused pull requests over large, monolithic ones.
3. **Follow the style guide**: Use TypeScript for frontend and PEP 8 standards for Python.
4. **Update documentation**: If you add a new feature, update the relevant `README.md` or `docs/` files.
5. **Write tests**: If possible, include unit or integration tests for your logic.

## Project Structure

- `/frontend`: Next.js 14 research workspace.
- `/backend`: FastAPI service for AI orchestration and RAG.
- `/docs`: Project documentation and guides.

## Development Workflow

1. `npm install` in `/frontend`.
2. `pip install -r requirements.txt` in `/backend`.
3. Use `npm run dev` and `uvicorn app.main:app --reload` to start development servers.

Thank you for your contributions!
