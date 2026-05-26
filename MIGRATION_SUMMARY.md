# Migration Summary: Better Auth → react-oidc-context

This document summarizes the changes made when converting this POC from Better Auth to react-oidc-context.

## Branch Information

- **Original Branch**: `main` (Better Auth implementation)
- **New Branch**: `react-oidc-context-poc` (react-oidc-context implementation)

## Overview of Changes

### Architecture Change

**Before (Better Auth)**:
```
Browser → Express (Port 8080) → Better Auth Middleware → Vite Dev Server (Port 5173)
                ↓
        Server-side sessions
        (encrypted cookies)
```

**After (react-oidc-context)**:
```
Browser → Vite Dev Server (Port 5173)
    ↓
OIDC Client (react-oidc-context)
    ↓
Okta (direct connection)

API: Express (Port 8081) - separate, no auth middleware
```

## File Changes

### Removed Dependencies
- `better-auth` - Server-side auth library
- `http-proxy-middleware` - No longer need to proxy through Express

### Added Dependencies
- `react-oidc-context` - React wrapper for OIDC client
- `oidc-client-ts` - Core OIDC protocol implementation

### New Files
1. **`src/lib/oidc-config.ts`** - OIDC client configuration
2. **`src/routes/callback.tsx`** - OAuth callback handler
3. **`OKTA_CONFIGURATION.md`** - Comprehensive Okta setup guide
4. **`README.better-auth.md`** - Backup of original README

### Modified Files

#### `package.json`
- Removed `better-auth`
- Added `react-oidc-context` and `oidc-client-ts`
- Renamed `dev:vite` script to `dev:client`

#### `.env.local`
**Before:**
```bash
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:8080
OKTA_ISSUER=...
OKTA_CLIENT_ID=...
OKTA_CLIENT_SECRET=...  # Required
OKTA_API_TOKEN=...
```

**After:**
```bash
VITE_OKTA_ISSUER=https://pubnub.okta.com
VITE_OKTA_CLIENT_ID=...  # No secret needed!
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
```

#### `server/index.ts`
**Before:** Complex Express server with:
- Better Auth handler at `/api/auth/*`
- Custom `/auth/start` endpoint
- Custom `/auth/logout` endpoint
- Proxy to Vite dev server

**After:** Simple API server:
- Just mock API endpoints
- CORS enabled for port 5173
- No auth middleware
- No proxy

#### `src/main.tsx`
**Before:**
```tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
</QueryClientProvider>
```

**After:**
```tsx
<AuthProvider {...oidcConfig}>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
</AuthProvider>
```

#### `src/lib/auth-client.ts`
**Before:**
```typescript
export async function getSession(): Promise<Session | null> {
  const res = await fetch("http://localhost:8080/api/auth/get-session", {
    credentials: "include",
  });
  // ... parse Better Auth response
}

export async function signOut(): Promise<void> {
  await fetch("http://localhost:8080/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function getLoginUrl(callbackURL: string): string {
  return `http://localhost:8080/auth/start?callbackURL=${...}`;
}
```

**After:**
```typescript
// This file is no longer needed with react-oidc-context
// Auth state is managed by the AuthProvider and useAuth hook
export {};
```

#### `src/types/auth.ts`
**Before:**
```typescript
export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    groups?: string;  // JSON string
  };
}
```

**After:**
```typescript
import { User } from "oidc-client-ts";

export interface Session {
  user: User;  // Standard OIDC User type
}
```

#### `src/routes/_authenticated.tsx`
**Before:**
```tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login", search: { callbackURL: location.href } });
    }
    return { session };
  },
  component: AuthenticatedLayout,
});
```

**After:**
```tsx
export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <Spin size="large" />;
  }

  if (!auth.isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const session = { user: auth.user! };
  return <AppLayout session={session}><Outlet /></AppLayout>;
}
```

#### `src/routes/login.tsx`
**Before:**
```tsx
function LoginPage() {
  const { callbackURL } = Route.useSearch();
  const loginUrl = getLoginUrl(callbackURL);

  return (
    <Button type="primary" block href={loginUrl}>
      Login with Okta
    </Button>
  );
}
```

**After:**
```tsx
function LoginPage() {
  const auth = useAuth();

  const handleLogin = () => {
    auth.signinRedirect();
  };

  return (
    <Button type="primary" block onClick={handleLogin}>
      Login with Okta
    </Button>
  );
}
```

#### `src/components/AppLayout.tsx`
**Before:**
```tsx
const handleLogout = async () => {
  await signOut();
  navigate({ to: "/login" });
};

let groups: string[] = [];
try {
  if (session.user.groups) {
    groups = JSON.parse(session.user.groups);  // Parse JSON string
  }
} catch (e) {
  console.error("Failed to parse groups:", e);
}

<strong>{session.user.name || session.user.email}</strong>
```

**After:**
```tsx
const auth = useAuth();

const handleLogout = async () => {
  await auth.signoutRedirect();
};

const groups = (session.user.profile.groups as string[] | undefined) || [];
const userName = session.user.profile.name || session.user.profile.email || "User";

<strong>{userName}</strong>
```

#### `src/lib/api.ts`
**Before:**
```typescript
const API_URL = "https://api.fake-rest.refine.dev";
```

**After:**
```typescript
const API_BASE_URL = "http://localhost:8081/api";
```

## Okta Configuration Changes

### Redirect URIs
| Configuration | Better Auth | react-oidc-context |
|--------------|-------------|-------------------|
| Sign-in redirect URI | `http://localhost:8080/api/auth/callback/okta` | `http://localhost:5173/callback` |
| Sign-out redirect URI | `http://localhost:8080` | `http://localhost:5173` |
| Trusted Origin | Port 8080 | Port 5173 |

### Application Settings
| Setting | Better Auth | react-oidc-context |
|---------|-------------|-------------------|
| Application Type | Web Application | Web Application |
| Grant Types | Authorization Code | Authorization Code |
| PKCE | Optional | **Required** |
| Client Secret | Required | **Not needed** |
| Client Type | Confidential | Public |

### Claims Configuration
Both implementations require the `groups` claim in the ID token, configured the same way:
- **Name**: `groups`
- **Include in token type**: ID Token, Always
- **Value type**: Groups
- **Filter**: Matches regex `.*`

## Authentication Flow Comparison

### Better Auth Flow
1. User clicks "Login with Okta"
2. Browser → `/auth/start` on Express server
3. Express → Better Auth handler
4. Better Auth → Generates PKCE parameters
5. Better Auth → Redirects to Okta
6. User authenticates at Okta
7. Okta → Redirects to `/api/auth/callback/okta`
8. Better Auth → Exchanges code for tokens (server-side)
9. Better Auth → Creates encrypted session cookie
10. Browser → Redirected to callback URL

### react-oidc-context Flow
1. User clicks "Login with Okta"
2. `auth.signinRedirect()` called
3. oidc-client-ts → Generates PKCE parameters (client-side)
4. Browser → Redirected to Okta
5. User authenticates at Okta
6. Okta → Redirects to `/callback?code=...`
7. oidc-client-ts → Exchanges code for tokens (client-side)
8. Tokens stored in browser storage
9. React app → Redirects to `/products`

## Session Management Comparison

| Aspect | Better Auth | react-oidc-context |
|--------|-------------|-------------------|
| Storage Location | Server-side cookie | Browser sessionStorage |
| Session Format | Encrypted JWE | JWT tokens |
| Token Access | Through API calls | Direct in browser |
| Token Refresh | Server handles | Client auto-handles |
| Logout | Server endpoint | Client-side + Okta |
| Scalability | Requires shared storage | Fully stateless |

## Security Considerations

### Better Auth
- ✅ Tokens never exposed to client
- ✅ Session encrypted server-side
- ✅ Uses client secret (confidential client)
- ⚠️ Requires secure session store
- ⚠️ Cookies vulnerable to CSRF (mitigated by Better Auth)

### react-oidc-context
- ✅ PKCE provides security without secrets
- ✅ No server-side session management
- ✅ OAuth 2.1 recommended approach for SPAs
- ⚠️ Tokens stored in browser (sessionStorage)
- ⚠️ Vulnerable to XSS if not careful
- ⚠️ Tokens readable in DevTools

## Pros and Cons

### Better Auth

**Pros:**
- More secure (tokens never in browser)
- Better for sensitive applications
- Server controls all auth logic
- Easier to audit and monitor server-side

**Cons:**
- More complex architecture
- Requires backend infrastructure
- Harder to scale (session storage)
- Cookie-based (CORS complications)

### react-oidc-context

**Pros:**
- Simpler architecture (frontend only)
- Easier to scale (stateless)
- Standard OIDC implementation
- No backend auth infrastructure needed
- Better for microservices

**Cons:**
- Tokens exposed to client
- Vulnerable to XSS attacks
- Less suitable for highly sensitive apps
- Client must handle token lifecycle

## Migration Checklist

If migrating from Better Auth to react-oidc-context:

- [ ] Update Okta redirect URIs
- [ ] Enable PKCE in Okta application
- [ ] Update Trusted Origins in Okta
- [ ] Remove server auth routes
- [ ] Add `AuthProvider` to React app
- [ ] Update environment variables
- [ ] Replace `getSession()` calls with `useAuth()`
- [ ] Update logout logic to use `signoutRedirect()`
- [ ] Create `/callback` route
- [ ] Update API endpoints if needed
- [ ] Test full authentication flow
- [ ] Verify groups display correctly
- [ ] Test token refresh
- [ ] Test logout flow

## Testing Both Implementations

### Test Better Auth (main branch)
```bash
git checkout main
npm install
npm run dev
# Access: http://localhost:8080
```

### Test react-oidc-context (react-oidc-context-poc branch)
```bash
git checkout react-oidc-context-poc
npm install
npm run dev
# Access: http://localhost:5173
```

**Note:** You'll need to update Okta redirect URIs when switching between branches!

## Recommendation

**Use Better Auth when:**
- Building enterprise applications with high security requirements
- Need server-side session management
- Have backend infrastructure already
- Want tokens hidden from client
- Need advanced session features (device management, etc.)

**Use react-oidc-context when:**
- Building modern SPAs with microservices
- Want simpler architecture
- Need stateless, scalable auth
- Following OAuth 2.1 best practices
- Don't need backend auth logic
- Want standard OIDC implementation

## Further Reading

- [Better Auth Documentation](https://better-auth.com)
- [react-oidc-context GitHub](https://github.com/authts/react-oidc-context)
- [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
- [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md) - Detailed Okta setup
