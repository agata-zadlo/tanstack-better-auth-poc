# 🎯 Simplified to Pure OIDC Demo

This POC has been simplified to focus purely on client-side OIDC authentication.

## What Changed

### Removed ❌
- Express API server (no backend needed!)
- TanStack Query (no data fetching)
- CORS, dotenv, concurrently dependencies
- Mock data tables (Products, Users)
- API client and query client files

### What Remains ✅
- React app with TanStack Router
- react-oidc-context for authentication
- Okta OIDC integration
- Protected routes
- User profile display
- Token inspection

## New Pages

### Profile Page (`/products` route)
Shows authenticated user information:
- Name and email
- Groups from Okta
- Email verification status
- Token expiration

### Tokens Page (`/users` route)
Shows OIDC token details:
- ID Token claims (parsed JSON)
- Access Token (encoded JWT)
- Refresh Token status
- Session state

## Running the App

```bash
npm install
npm run dev
```

**That's it!** Just one command, one server (Vite), no backend.

## File Structure

```
src/
├── components/
│   └── AppLayout.tsx              # Layout with sidebar & logout
├── lib/
│   ├── auth-client.ts             # (empty - kept for compat)
│   ├── menu-config.tsx            # Sidebar menu items
│   └── oidc-config.ts             # OIDC configuration
├── routes/
│   ├── __root.tsx
│   ├── _authenticated.tsx         # Protected route wrapper
│   ├── _authenticated/
│   │   ├── products.tsx          # → Profile page
│   │   └── users.tsx             # → Tokens page
│   ├── callback.tsx              # OAuth callback
│   ├── index.tsx                 # Redirects to /products
│   └── login.tsx                 # Login page
├── types/
│   └── auth.ts
└── main.tsx                       # Entry with AuthProvider
```

## What This Demonstrates

✅ **Pure OIDC authentication** - No backend, just browser ↔ Okta  
✅ **Protected routes** - Authentication required  
✅ **User profile** - Name, email, groups from ID token  
✅ **Token management** - Automatic refresh, inspection  
✅ **Groups/claims** - From Okta displayed in UI  
✅ **PKCE flow** - No client secret needed  

## Perfect For

- **Learning OIDC** - See how it works without backend complexity
- **Testing Okta** - Quick integration testing
- **Prototyping** - Fast authentication POC
- **Understanding tokens** - Inspect claims and tokens

## Adding APIs Later

If you need to call APIs:

1. Create your backend (Express, FastAPI, etc.)
2. Send access token: `Authorization: Bearer ${auth.user.access_token}`
3. Backend verifies token with Okta
4. Backend checks groups/claims for authorization

But for just authentication? No backend needed!

## Why This Is Better

### Before
- 2 servers (Express + Vite)
- Backend auth middleware
- Session management
- API mocking
- More dependencies
- More complexity

### After
- 1 server (just Vite)
- No backend code
- No session management
- Pure auth demo
- Minimal dependencies
- Simple & focused

## Stats

- **-508 lines of code** removed
- **-8 dependencies** removed
- **-3 files** (server directory gone)
- **+2 focused pages** (Profile + Tokens)

## Commands

```bash
# Install
npm install

# Run (just Vite)
npm run dev

# Access
http://localhost:5173
```

No backend port, no API server, no complexity!

## Documentation

All docs updated to reflect simplification:
- ✅ README.md - Updated architecture
- ✅ SETUP_COMPLETE.md - Simplified steps
- ✅ QUICK_START.md - Faster setup
- ✅ All references to API server removed

## Migration from Better Auth

This is now even simpler than the Better Auth version:

| Better Auth | react-oidc-context (old) | react-oidc-context (new) |
|-------------|-------------------------|-------------------------|
| Backend required | Backend optional | **No backend at all** |
| Port 8080 | Ports 5173 + 8081 | **Port 5173 only** |
| Complex setup | Moderate setup | **Minimal setup** |
| Data tables | Data tables | **Pure auth demo** |

## Next Steps

1. Run `npm run dev`
2. Open http://localhost:5173
3. Login with Okta
4. Explore Profile and Tokens pages
5. Inspect the code to learn OIDC!

That's it! 🚀
