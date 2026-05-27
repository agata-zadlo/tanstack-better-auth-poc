# Quick Start Guide

Get this POC running in 5 minutes!

## Prerequisites

- Node.js 18+
- Okta account with admin access
- 10 minutes of your time

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Okta

### Create Application

1. Go to Okta Admin Console → **Applications** → **Create App Integration**
2. Select **OIDC - OpenID Connect**
3. Select **Single-Page Application**
4. Click **Next**

### Configure Application Settings

**General Settings:**
- **App integration name**: TanStack OIDC POC
- **Grant type**: ✅ Authorization Code
- **Refresh Token**: ✅ Enabled (optional)

**Sign-in redirect URIs:**
```
http://localhost:5173/callback
```

**Sign-out redirect URIs:**
```
http://localhost:5173
```

**Controlled access:**
- Allow everyone in your organization to access (or specific groups)

Click **Save**.

### Configure Trusted Origins

1. Go to **Security** → **API** → **Trusted Origins**
2. Click **Add Origin**
3. Configure:
   - **Name**: Local Development
   - **Origin URL**: `http://localhost:5173`
   - **Type**: ✅ CORS, ✅ Redirect
4. Click **Save**

### Configure Groups Claim

1. Go to **Security** → **API** → **Authorization Servers**
2. Click on **default**
3. Go to **Claims** tab
4. Click **Add Claim**
5. Configure:
   - **Name**: `groups`
   - **Include in token type**: ID Token, Always
   - **Value type**: Groups
   - **Filter**: Matches regex `.*`
   - **Include in**: Any scope
6. Click **Create**

## Step 3: Configure Environment Variables

Copy the provided `.env.local` or create one:

```bash
VITE_OKTA_ISSUER=https://YOUR-DOMAIN.okta.com/oauth2/default
VITE_OKTA_CLIENT_ID=YOUR_CLIENT_ID
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
```

**Where to find these values:**
- **OKTA_ISSUER**: In Okta, go to **Security** → **API** → **Authorization Servers** → **default** → copy the Issuer URI
- **CLIENT_ID**: In your application settings, copy the Client ID

## Step 4: Assign Users

1. Go to your application in Okta
2. Click **Assignments** tab
3. Click **Assign** → **Assign to People** or **Assign to Groups**
4. Assign yourself
5. Click **Done**

## Step 5: Run the Application

```bash
npm run dev
```

This starts:
- **React App**: http://localhost:5173

That's it! No backend server needed.

## Step 6: Test It

1. Open http://localhost:5173 in your browser
2. Click **Login with Okta**
3. Enter your Okta credentials
4. You should see your profile page with name and groups
5. Explore:
   - **Profile** - Your user information
   - **Tokens** - OIDC token details

## Troubleshooting

### "redirect_uri_mismatch" Error

**Problem**: Okta redirect URI doesn't match your configuration.

**Solution**:
1. Check `.env.local` has: `VITE_REDIRECT_URI=http://localhost:5173/callback`
2. Check Okta application has: `http://localhost:5173/callback` (exact match, no trailing slash)

### CORS Errors

**Problem**: Browser blocks requests to Okta.

**Solution**:
1. Add `http://localhost:5173` to Trusted Origins in Okta
2. Enable **both** CORS and Redirect checkboxes
3. Wait 2-3 minutes for changes to propagate

### Groups Not Showing

**Problem**: Groups array is empty in the UI.

**Solution**:
1. Verify groups claim is configured in authorization server
2. Check you're a member of groups in Okta (go to **Directory** → **Groups**)
3. Check browser console: `auth.user.profile.groups`

### "User Not Assigned"

**Problem**: Cannot login, Okta says user is not assigned.

**Solution**:
1. Go to application → **Assignments** tab
2. Assign yourself or your group
3. Try again

### Application Won't Start

**Problem**: `npm run dev` fails.

**Solution**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Make sure no other apps are using ports 5173 or 8081

## What You Should See

After successful login:

```
┌────────────────────────────────────────────────┐
│ POC App                                    [≡] │
├────────────────────────────────────────────────┤
│ Products                                       │
│ Users                                          │
│                                                │
│                                                │
│                                                │
│                                                │
│                                                │
│                                                │
└────────────────────────────────────────────────┘

Header should show:
- Your name
- Your groups (if any)
- Logout button
```

## Next Steps

### View the Documentation
- [README.md](./README.md) - Full documentation
- [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md) - Detailed Okta setup
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Comparison with Better Auth

### Explore the Code
- `src/lib/oidc-config.ts` - OIDC configuration
- `src/routes/_authenticated.tsx` - Protected route logic
- `src/routes/callback.tsx` - OAuth callback handler
- `src/components/AppLayout.tsx` - Layout with user info

### Test Features
- Navigate between Products and Users
- Check groups in header
- Logout and login again
- Check browser DevTools → Application → Session Storage

### Customize
- Add more routes in `src/routes/`
- Customize `src/lib/oidc-config.ts` scopes
- Add API authentication to `server/index.ts`
- Style with Ant Design components

## Common Customizations

### Change Scopes

Edit `src/lib/oidc-config.ts`:
```typescript
scope: "openid profile email groups offline_access",
```

### Change Token Storage

Edit `src/lib/oidc-config.ts`:
```typescript
export const oidcConfig: AuthProviderProps = {
  // ... other config
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};
```

### Add Debugging

Edit `src/lib/oidc-config.ts`:
```typescript
export const oidcConfig: AuthProviderProps = {
  // ... other config
  monitorSession: true,
  onSigninCallback: (user) => {
    console.log("Signed in:", user);
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
```

## Production Checklist

Before deploying to production:

- [ ] Update all URLs to production domain (remove localhost)
- [ ] Update Okta redirect URIs for production
- [ ] Update Trusted Origins for production
- [ ] Use HTTPS for all URLs
- [ ] Review token lifetimes in Okta
- [ ] Enable MFA for users
- [ ] Add API authentication (verify access tokens)
- [ ] Set up proper error logging
- [ ] Test full auth flow in production

## Getting Help

**Documentation:**
- This repository's docs (README, OKTA_CONFIGURATION, etc.)
- [react-oidc-context GitHub](https://github.com/authts/react-oidc-context)
- [Okta Developer Docs](https://developer.okta.com/docs/guides/sign-into-spa-redirect/react/main/)

**Common Issues:**
- Check browser console for errors
- Check Okta System Log: **Reports** → **System Log**
- Verify all configuration matches exactly

## Summary

You should now have:
✅ Okta application configured  
✅ Environment variables set  
✅ Application running on http://localhost:5173  
✅ Successful login with Okta  
✅ User info and groups displayed  

**Total setup time: ~10 minutes**

If something isn't working, check the Troubleshooting section above or see the full [OKTA_CONFIGURATION.md](./OKTA_CONFIGURATION.md) for detailed instructions.
