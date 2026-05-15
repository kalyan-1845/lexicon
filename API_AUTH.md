# Lexicon AI — API Authentication Guide

This guide outlines how to authenticate with the Lexicon AI backend API.

## Authentication Methods

### 1. API Keys (Recommended for Scripts)
Generate an API key in your Workspace Settings.
```bash
curl -H "X-API-Key: your_key_here" http://localhost:8000/api/chat/message
```

### 2. OAuth2 Bearer Tokens (Web App)
The web application uses standard OAuth2 Password Flow.
```bash
curl -H "Authorization: Bearer your_token_here" http://localhost:8000/api/chat/message
```

## Security Best Practices
- **Rotate keys monthly**: Use the `/api/auth/rotate` endpoint.
- **Scope limitation**: Use scoped tokens for read-only access to specific workspaces.
- **Audit Logs**: All API access is logged with the associated client IP and token ID.

---
*Build securely. — Lexicon API Team*
