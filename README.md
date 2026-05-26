# TanStack Router + react-oidc-context + Okta POC

A proof-of-concept demonstrating OpenID Connect (OIDC) authentication with Okta using TanStack Router and react-oidc-context.

## Overview

This POC demonstrates:
- ✅ Client-side OIDC authentication using `react-oidc-context`
- ✅ TanStack Router with protected routes
- ✅ Okta as the identity provider
- ✅ Authorization Code Flow with PKCE
- ✅ Group claims from Okta displayed in the UI
- ✅ Silent token renewal
- ✅ Logout with redirect

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │           React App (Port 5173)                    │   │
│  │                                                     │   │
│  │  • TanStack Router (routing)                       │   │
│  │  • react-oidc-context (auth)                       │   │
│  │  • oidc-client-ts (OIDC protocol)                  │   │
│  │                                                     │   │
│  │  Protected Routes: /products, /users               │   │
│  │  Public Routes: /login, /callback                  │   │
│  └──────────────┬──────────────────┬──────────────────┘   │
│                 │                  │                        │
└─────────────────┼──────────────────┼────────────────────────┘
                  │                  │
                  │                  │ API Calls
      OIDC Flow  │                  │
   (Direct to    │                  │
     Okta)       │                  ▼
                  │         ┌─────────────────┐
                  │         │   API Server    │
                  │         │  (Port 8081)    │
                  │         │                 │
                  │         │  • GET /users   │
                  │         │  • GET /products│
                  │         └─────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │      Okta      │
         │                │
         │  • Handles     │
         │    login       │
         │  • Issues      │
         │    tokens      │
         │  • Groups      │
         │    claims      │
         └────────────────┘
```

## Tech Stack

### Frontend (Port 5173)
- **React 19** - UI library
- **TanStack Router** - Type-safe routing
- **react-oidc-context** - OIDC authentication provider
- **oidc-client-ts** - OIDC protocol implementation
- **Ant Design** - UI components
- **Vite** - Build tool

### Backend (Port 8081)
- **Express** - Minimal API server
- **CORS** - Cross-origin support

Simple mock API server providing user and product data.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AppLayout.tsx         # Main layout with header, sidebar, logout
│   │   ├── ProductsTable.tsx     # Products listing
│   │   └── UsersTable.tsx        # Users listing
│   ├── lib/
│   │   ├── api.ts                # API client functions
│   │   ├── auth-client.ts        # (deprecated - kept for compatibility)
│   │   ├── menu-config.tsx       # Sidebar menu configuration
│   │   ├── oidc-config.ts        # OIDC configuration for Okta
│   │   └── query-client.ts       # TanStack Query client
│   ├── routes/
│   │   ├── __root.tsx            # Root route
│   │   ├── _authenticated.tsx    # Protected route wrapper
│   │   ├── _authenticated/
│   │   │   ├── products.tsx      # Products page (protected)
│   │   │   └── users.tsx         # Users page (protected)
│   │   ├── callback.tsx          # OIDC callback handler
│   │   ├── index.tsx             # Root redirect
│   │   └── login.tsx             # Login page
│   ├── types/
│   │   └── auth.ts               # Auth-related types
│   ├── main.tsx                  # App entry point with AuthProvider
│   └── index.css                 # Global styles
├── server/
│   └── index.ts                  # Express API server
├── .env.local                    # Environment variables
├── OKTA_CONFIGURATION.md         # Detailed Okta setup guide
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Okta account with an application configured
- See [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md) for detailed Okta setup

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Create a `.env.local` file in the root:

```bash
# Okta OIDC Configuration
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_OKTA_CLIENT_ID=your-client-id-here
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
```

Replace with your actual Okta values.

3. **Configure Okta Application:**

Follow the comprehensive guide in [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md)

Key requirements:
- Application type: Web Application (OIDC)
- Grant type: Authorization Code with PKCE
- Sign-in redirect URI: `http://localhost:5173/callback`
- Trusted Origins: `http://localhost:5173` (CORS + Redirect)
- Groups claim configured in ID token

### Running the Application

Start both the API server and the Vite dev server:

```bash
npm run dev
```

This runs:
- **API Server**: http://localhost:8081
- **React App**: http://localhost:5173

Or run them separately:

```bash
# Terminal 1 - API Server
npm run dev:api

# Terminal 2 - React App
npm run dev:client
```

### Using the Application

1. Navigate to http://localhost:5173
2. You'll be redirected to `/login`
3. Click "Login with Okta"
4. Authenticate with your Okta credentials
5. After successful login, you'll be redirected to `/products`
6. Your user info and groups will appear in the header
7. Navigate between Products and Users using the sidebar

## Authentication Flow

### Login Flow

```
1. User clicks "Login with Okta"
   └─> auth.signinRedirect() is called

2. Browser redirects to Okta authorization endpoint
   └─> Includes: client_id, redirect_uri, scope, code_challenge (PKCE)

3. User authenticates with Okta
   └─> Enters credentials, MFA if required

4. Okta redirects to callback URI with authorization code
   └─> http://localhost:5173/callback?code=...&state=...

5. react-oidc-context automatically exchanges code for tokens
   └─> POST to Okta token endpoint with code_verifier (PKCE)

6. Tokens received and user state updated
   └─> ID token, access token, refresh token (if configured)

7. Callback page redirects to /products
   └─> User is now authenticated
```

### Protected Routes

The `_authenticated.tsx` route wrapper:
- Checks if user is authenticated via `useAuth()`
- Shows loading spinner while checking
- Redirects to `/login` if not authenticated
- Renders protected content if authenticated

### Token Management

- **Automatic Renewal**: Tokens are automatically renewed before expiry
- **Storage**: Tokens stored in browser sessionStorage
- **Silent Renewal**: Uses hidden iframe to renew without interrupting user

### Logout Flow

```
1. User clicks "Logout"
   └─> auth.signoutRedirect() is called

2. Local session cleared
   └─> Tokens removed from storage

3. Browser redirects to Okta logout endpoint
   └─> Ends Okta session

4. Okta redirects back to post_logout_redirect_uri
   └─> http://localhost:5173
```

## Key Files Explained

### `src/lib/oidc-config.ts`

Configures the OIDC client:
- Authority (Okta issuer URL)
- Client ID
- Redirect URIs
- Scopes (openid, profile, email, groups)
- Automatic silent renewal
- Callback to clean up URL after login

### `src/main.tsx`

Wraps the app with `AuthProvider`:
```tsx
<AuthProvider {...oidcConfig}>
  <RouterProvider router={router} />
</AuthProvider>
```

### `src/routes/_authenticated.tsx`

Protected route wrapper that:
- Uses `useAuth()` hook to check authentication status
- Handles loading state
- Redirects to login if needed
- Passes user session to child routes

### `src/routes/callback.tsx`

Handles the OAuth callback:
- Receives authorization code from Okta
- `react-oidc-context` automatically processes it
- Redirects to `/products` after completion

## API Integration

The API server is simple and separate:
- No authentication middleware needed
- CORS enabled for http://localhost:5173
- Provides mock data for users and products

In production, you would:
- Add authentication middleware to verify access tokens
- Check user groups/roles for authorization
- Use real database instead of mock data

Example secured endpoint (not implemented in this POC):

```typescript
app.get("/api/users", verifyAccessToken, (req, res) => {
  // Verify token, check groups, return data
});
```

## Accessing User Information

Use the `useAuth()` hook from `react-oidc-context`:

```tsx
import { useAuth } from "react-oidc-context";

function MyComponent() {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    console.log(auth.user?.profile.name);
    console.log(auth.user?.profile.email);
    console.log(auth.user?.profile.groups); // Okta groups
  }
}
```

## Troubleshooting

### Common Issues

**1. Redirect URI Mismatch**
```
Error: redirect_uri_mismatch
```
- Verify redirect URI in Okta matches `.env.local` exactly
- Check for trailing slashes (should not have one)

**2. CORS Errors**
```
Access to fetch at 'https://your-domain.okta.com/...' has been blocked by CORS
```
- Add http://localhost:5173 to Trusted Origins in Okta
- Enable both CORS and Redirect options

**3. Groups Not Showing**
- Verify groups claim is configured in authorization server
- Check "Include in token type" is set to "ID Token, Always"
- Inspect `auth.user.profile` in browser console

**4. Token Expired**
- Tokens automatically refresh if `automaticSilentRenew` is enabled
- Clear browser storage and log in again

**5. User Not Assigned**
- Go to Okta Application → Assignments
- Assign the user or their group

### Debug Mode

Enable OIDC client logs:

```typescript
// In src/lib/oidc-config.ts
export const oidcConfig: AuthProviderProps = {
  // ... other config
  onSigninCallback: () => {
    console.log("Sign-in callback");
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  // Add this for debugging
  monitorSession: true,
};
```

Check browser console for detailed OIDC logs.

## Comparison with Better Auth

| Feature | Better Auth | react-oidc-context |
|---------|-------------|-------------------|
| **Architecture** | Backend + Frontend | Frontend only |
| **Session Storage** | Server-side (cookies) | Client-side (sessionStorage) |
| **Backend Required** | Yes (Express middleware) | No (API only) |
| **Client Type** | Confidential | Public (PKCE) |
| **Complexity** | Higher | Lower |
| **Token Management** | Server-side | Client-side |
| **Scaling** | Requires session store | Stateless |

## Production Considerations

### Security
- ✅ Use HTTPS for all URLs
- ✅ Configure proper token lifetimes in Okta
- ✅ Enable MFA for users
- ✅ Review and restrict groups claim if needed
- ✅ Implement proper API authentication (verify tokens)

### Performance
- ✅ Enable token caching
- ✅ Configure appropriate token lifetimes
- ✅ Use silent renewal to avoid interruptions

### Monitoring
- ✅ Monitor authentication failures in Okta
- ✅ Track token renewal failures
- ✅ Log OIDC errors in production

## Further Reading

- [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md) - Detailed Okta setup
- [react-oidc-context docs](https://github.com/authts/react-oidc-context)
- [oidc-client-ts docs](https://authts.github.io/oidc-client-ts/)
- [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
- [TanStack Router docs](https://tanstack.com/router)

## License

MIT
