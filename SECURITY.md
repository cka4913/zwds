# Security Policy

## 🔒 Reporting a Vulnerability

We take the security of the ZWDS API project seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**Please DO NOT open public issues for security vulnerabilities.**

Instead, please report security issues via:

1. **GitHub Security Advisories** (Preferred):
   - Go to https://github.com/cka4913/zwds/security/advisories/new
   - Fill in the details of the vulnerability

2. **Direct Contact**:
   - Open a new issue with title "SECURITY: [Brief Description]" without revealing sensitive details
   - We will respond with a secure communication channel

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical issues prioritized)

We will acknowledge your contribution in the security advisory once the issue is resolved (if you wish to be credited).

---

## ✅ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## 🛡️ Security Best Practices

### For Users

1. **Never commit sensitive data**:
   - API keys, tokens, passwords
   - Private keys or certificates
   - Database credentials

2. **Use environment variables**:
   - Store sensitive configuration in `.env` files
   - Never commit `.env` files to git
   - Use `.env.example` for templates

3. **Keep dependencies updated**:
   ```bash
   pnpm update
   pnpm audit
   ```

4. **For Cloudflare Workers**:
   - Use `.dev.vars` for local secrets (already gitignored)
   - Use Cloudflare dashboard or Wrangler CLI to set production secrets
   ```bash
   wrangler secret put SECRET_NAME
   ```

### For Contributors

1. **Branch Protection**:
   - All changes require pull requests
   - At least one review before merging
   - CI tests must pass

2. **Code Review**:
   - Check for hardcoded credentials
   - Verify input validation
   - Review error messages for information leakage

3. **Dependency Management**:
   - Only use trusted packages
   - Check for known vulnerabilities before adding dependencies
   - Keep dependencies updated

---

## 🔍 Security Features

This project implements the following security measures:

- ✅ **Automated Dependency Scanning**: Dependabot alerts for vulnerable dependencies
- ✅ **Secret Scanning**: GitHub scans for accidentally committed secrets
- ✅ **Code Scanning**: CodeQL analysis for security vulnerabilities
- ✅ **Protected Branches**: Main branch requires PR reviews
- ✅ **CI/CD Security**: GitHub Actions with minimal permissions

---

## 📚 Security Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/github-security-features)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security/)

---

## 📧 Contact

- **GitHub Issues**: https://github.com/cka4913/zwds/issues (for non-security issues)
- **Security Advisories**: https://github.com/cka4913/zwds/security/advisories

---

**Thank you for helping keep ZWDS API and its users safe!**
