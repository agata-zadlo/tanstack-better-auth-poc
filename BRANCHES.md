# Branch Structure

This repository contains two authentication implementations for comparison.

## Branches

### `main` - Better Auth Implementation
Server-side authentication using Better Auth library.

**Tech Stack:**
- Better Auth (server-side sessions)
- Express server with auth middleware
- Encrypted JWE cookies
- Authorization Code Flow with PKCE

**Access:** http://localhost:8080

**Documentation:**
- [README.better-auth.md](./README.better-auth.md) - Original README

**To use:**
```bash
git checkout main
npm install
npm run dev
```

**Okta Configuration:**
- Redirect URI: `http://localhost:8080/api/auth/callback/okta`
- Client Secret: Required
- PKCE: Optional

---

### `react-oidc-context-poc` - react-oidc-context Implementation
Client-side authentication using react-oidc-context library.

**Tech Stack:**
- react-oidc-context + oidc-client-ts
- Client-side OIDC
- Browser token storage
- Authorization Code Flow with PKCE

**Access:** http://localhost:5173

**Documentation:**
- [README.md](./README.md) - Full documentation
- [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md) - Detailed Okta setup
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Comparison with Better Auth
- [QUICK_START.md](./QUICK_START.md) - Quick setup guide

**To use:**
```bash
git checkout react-oidc-context-poc
npm install
npm run dev
```

**Okta Configuration:**
- Redirect URI: `http://localhost:5173/callback`
- Client Secret: Not needed
- PKCE: Required

---

## Comparison

| Feature | main (Better Auth) | react-oidc-context-poc |
|---------|-------------------|----------------------|
| **Architecture** | Backend + Frontend | Frontend only |
| **Port** | 8080 (with proxy) | 5173 (direct) + 8081 (API) |
| **Session** | Server-side cookies | Client-side tokens |
| **Complexity** | Higher | Lower |
| **Security** | Tokens hidden from browser | Tokens in browser storage |
| **Scalability** | Requires session store | Fully stateless |
| **Best For** | Enterprise apps | Modern SPAs |

## Quick Switch

**Note:** When switching branches, you'll need to update Okta redirect URIs!

### Switch to Better Auth
```bash
git checkout main
npm install
npm run dev
# Access: http://localhost:8080
```

**Okta redirect URI:** `http://localhost:8080/api/auth/callback/okta`

### Switch to react-oidc-context
```bash
git checkout react-oidc-context-poc
npm install
npm run dev
# Access: http://localhost:5173
```

**Okta redirect URI:** `http://localhost:5173/callback`

## Recommendations

**Use Better Auth (`main`) when:**
- High security requirements
- Need server-side session management
- Want tokens hidden from client
- Building enterprise applications

**Use react-oidc-context (`react-oidc-context-poc`) when:**
- Building modern SPAs
- Want simpler architecture
- Need stateless, scalable auth
- Following OAuth 2.1 best practices
- Want standard OIDC implementation

## Documentation Index

### Better Auth (main branch)
- `README.better-auth.md` - Setup and usage

### react-oidc-context (react-oidc-context-poc branch)
- `README.md` - Full documentation
- `OKTA_CONFIGURATION.md` - Detailed Okta configuration guide
- `MIGRATION_SUMMARY.md` - Detailed comparison with Better Auth
- `QUICK_START.md` - 5-minute setup guide
- `BRANCHES.md` - This file

## Getting Started

1. **First time?** Start with `react-oidc-context-poc` branch (simpler setup)
2. **Read:** [QUICK_START.md](./QUICK_START.md)
3. **Need comparison?** Read [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
4. **Having issues?** Check [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md)

Happy coding! 🚀
