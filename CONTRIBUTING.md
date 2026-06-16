# Contributing to Lexicon AI

Thank you for your interest in contributing to **Lexicon AI**! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 🌟 NSoC'26 Contributors

Lexicon AI is proudly participating in **Nexus Spring of Code 2026**. If you're an NSoC participant, check our [open issues](https://github.com/kalyan-1845/lexicon/issues) for tasks labeled with difficulty levels:

| Label | Difficulty | Points |
|-------|-----------|--------|
| `level1` | 🟢 Beginner — UI tweaks, docs, small fixes | 3 pts |
| `level2` | 🟡 Intermediate — API, logic, features | 5 pts |
| `level3` | 🔴 Advanced — Architecture, AI, performance | 10 pts |

### Claiming an Issue

1. Comment on the issue you'd like to work on and request assignment.
2. Wait for a maintainer to assign it to you before starting.
3. **One issue per contributor at a time** — please complete your current task before claiming another.

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/lexicon.git
cd lexicon
```

### 2. Set Up Your Environment

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt
```

### 3. Create a Feature Branch

Use a descriptive branch name that reflects your change:

```bash
git checkout -b feat/your-feature-name    # For new features
git checkout -b fix/your-bug-fix          # For bug fixes
git checkout -b docs/your-doc-update      # For documentation
```

### 4. Make Your Changes

- Write clean, readable code.
- Follow the existing code style and conventions in the project.
- Add comments where logic is non-obvious.
- Test your changes locally before submitting.

### 5. Commit Your Changes

Write clear, descriptive commit messages using [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(chat): add message retry button"
git commit -m "fix(ui): resolve sidebar overlap on mobile"
git commit -m "docs: update API endpoint documentation"
```

### 6. Push & Open a Pull Request

```bash
git push origin feat/your-feature-name
```

Then open a Pull Request on GitHub against the `main` branch. Fill out the PR template completely.

---

## 📐 Code Standards

### Frontend (Next.js / TypeScript)
- Use **TypeScript** for all new components.
- Follow the existing component patterns in `src/components/`.
- Use **TailwindCSS** for styling — avoid inline styles.
- Ensure responsive design works on mobile, tablet, and desktop.

### Backend (Python / FastAPI)
- Follow **PEP 8** style guidelines.
- Use **type hints** on all function signatures.
- Add docstrings to public functions and classes.
- Handle errors gracefully with appropriate HTTP status codes.

---

## 🔍 Pull Request Guidelines

- **One PR per feature/fix** — keep changes focused and reviewable.
- **Link the related issue** in your PR description (e.g., `Closes #123`).
- **Describe your changes** clearly in the PR body.
- **Include screenshots** for any UI changes.
- **Ensure the build passes** — run `npm run build` in the frontend before submitting.

---

## 🐛 Reporting Bugs

Use the [Bug Report template](https://github.com/kalyan-1845/lexicon/issues/new?template=bug_report.yml) and include:
- Steps to reproduce the issue
- Expected vs. actual behavior
- Browser/OS information
- Screenshots or error logs if applicable

---

## 💡 Suggesting Features

Use the [Feature Request template](https://github.com/kalyan-1845/lexicon/issues/new?template=feature_request.yml) and describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for helping make Lexicon AI better! 🎉
