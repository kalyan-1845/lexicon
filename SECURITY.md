# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 2.x.x   | ✅ Actively supported |
| 1.x.x   | ⚠️ Critical fixes only |
| < 1.0   | ❌ No longer supported |

## Reporting a Vulnerability

We take the security of Lexicon AI seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Email us directly at: **connect.lexicon.ai@gmail.com**
3. Include the following in your report:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment** — We will acknowledge your report within **48 hours**.
- **Assessment** — We will investigate and assess the severity within **5 business days**.
- **Resolution** — Critical vulnerabilities will be patched and released as soon as possible.
- **Credit** — With your permission, we will credit you in our security advisories.

### Scope

The following are in scope for security reports:
- Authentication and authorization flaws
- Data exposure or leakage
- Injection vulnerabilities (SQL, XSS, etc.)
- Server-side request forgery (SSRF)
- Insecure API endpoints
- Dependency vulnerabilities

### Out of Scope

- Denial of service (DoS) attacks
- Social engineering
- Physical security
- Issues in third-party dependencies that are already publicly disclosed

## Security Best Practices

When contributing to Lexicon AI, please follow these security guidelines:

- Never commit API keys, secrets, or credentials to the repository.
- Use environment variables (`.env`) for all sensitive configuration.
- Validate and sanitize all user inputs.
- Keep dependencies up to date.

Thank you for helping keep Lexicon AI secure! 🔒
