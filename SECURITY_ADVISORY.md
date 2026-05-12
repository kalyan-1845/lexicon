# Lexicon AI — Security Advisory

This document tracks known security advisories and mitigations for the Lexicon AI platform.

## 2026-05-12: LLM Injection Mitigation
- **Status**: Mitigated in V1.3.1
- **Description**: Potential for system prompt leakage via adversarial user inputs.
- **Fix**: Implemented strict identity enforcement and output filtering in `agents.py`.

## 2026-05-11: Workspace Data Isolation
- **Status**: Mitigated in V1.2.5
- **Description**: Insecure direct object reference (IDOR) potential in the sharing API.
- **Fix**: Standardized authorization checks in the FastAPI router layer.

---
*Stay secure. — Lexicon Security Team*
