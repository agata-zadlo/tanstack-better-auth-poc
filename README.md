# TanStack Router + Better Auth + Okta POC

A proof-of-concept application demonstrating OAuth PKCE authentication with Okta using Better Auth, TanStack Router for routing, TanStack Query for data fetching, and Ant Design for UI components.

## Features

- **Authentication**: Okta OAuth PKCE flow with Better Auth (stateless, cookie-based sessions)
- **Routing**: TanStack Router with file-based routing and authentication guards
- **Data Fetching**: TanStack Query for efficient API data management
- **UI**: Ant Design components with responsive sidebar navigation
- **Protected Routes**: All application pages require authentication

## Architecture

The application uses a dual-server architecture with Express as the main entry point:
- **Express Server** (port 3000): Handles Better Auth endpoints and proxies all other requests to Vite
- **Vite Dev Server** (port 5173): Runs in the background for HMR and asset serving
- **Access**: Everything is accessed through http://localhost:3000

## Prerequisites

- Node.js 18+ and npm
- Okta account with a configured OAuth application

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   The `.env.local` file is already configured with Okta credentials from the reference project. If you need to change them:
   
   ```env
   BETTER_AUTH_SECRET=your-secret-here
   BETTER_AUTH_URL=http://localhost:3000
   OKTA_ISSUER=https://your-okta-domain/oauth2/default
   OKTA_CLIENT_ID=your-client-id
   OKTA_CLIENT_SECRET=your-client-secret
   ```

   **Important**: The Okta application must have the following redirect URI configured:
   - `http://localhost:3000/api/auth/callback/okta`

## Development

Start both the Express API server and Vite dev server:

```bash
npm run dev
```

This will start:
- Express server on http://localhost:3000 (main entry point)
- Vite dev server on http://localhost:5173 (background for HMR)

Open http://localhost:3000 in your browser. You'll be redirected to the login page.

## Project Structure

```
├── server/                    # Express API server
│   ├── index.ts              # Express server with auth routes
│   ├── auth.ts               # Better Auth configuration
│   └── utils.ts              # JWT decoding utilities
├── src/
│   ├── routes/               # TanStack Router file-based routes
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Home (redirects to /products)
│   │   ├── login.tsx         # Login page
│   │   ├── _authenticated.tsx           # Auth guard layout
│   │   └── _authenticated/
│   │       ├── products.tsx  # Products table page
│   │       └── users.tsx     # Users table page
│   ├── components/           # React components
│   │   ├── AppLayout.tsx     # Main layout with sidebar
│   │   ├── ProductsTable.tsx # Products table
│   │   └── UsersTable.tsx    # Users table
│   ├── lib/                  # Utilities and clients
│   │   ├── auth-client.ts    # Auth API client
│   │   ├── query-client.ts   # TanStack Query config
│   │   └── api.ts            # Data fetching functions
│   └── types/
│       └── auth.ts           # TypeScript types
└── .env.local                # Environment variables
```

## Authentication Flow

1. User navigates to a protected route (e.g., `/products`)
2. TanStack Router's `beforeLoad` hook checks for a session
3. If no session exists, user is redirected to `/login` with a callback URL
4. User clicks "Login with Okta"
5. Browser redirects to `/auth/start`, which initiates the OAuth flow
6. Better Auth generates PKCE parameters and redirects to Okta
7. User authenticates with Okta
8. Okta redirects back to `/api/auth/callback/okta`
9. Better Auth exchanges the authorization code for tokens
10. Better Auth creates an encrypted session cookie
11. User is redirected to the original requested page

## Key Technical Details

- **Stateless Sessions**: Better Auth uses encrypted JWE cookies (no database required)
- **PKCE Flow**: Automatically handled by Better Auth for enhanced security
- **Route Guards**: TanStack Router's `beforeLoad` hook provides authentication protection
- **Cookie Sharing**: Vite proxy forwards cookies between the two servers during development
- **Data Sources**: 
  - Products: https://api.fake-rest.refine.dev/products
  - Users: https://api.fake-rest.refine.dev/users

## Available Scripts

- `npm run dev` - Start both servers concurrently
- `npm run dev:api` - Start only the Express API server
- `npm run dev:vite` - Start only the Vite dev server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint

## Testing the Application

After starting the dev servers:

1. Navigate to http://localhost:3000
2. You should be redirected to `/login`
3. Click "Login with Okta"
4. Authenticate with your Okta credentials
5. You should be redirected to `/products` with data displayed
6. Click "Users" in the sidebar to view the users table
7. Click "Logout" to clear your session

## Production Deployment

For production, you would typically:
1. Build the Vite application: `npm run build`
2. Serve both the API and static files from a single Express server
3. Update `BETTER_AUTH_URL` to your production domain
4. Update Okta redirect URIs to match your production domain
