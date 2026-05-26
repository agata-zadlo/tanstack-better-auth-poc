# Okta Configuration for react-oidc-context Integration

This document outlines all the configuration changes required in Okta to make this POC work with `react-oidc-context`.

## Overview

This POC uses standard OpenID Connect (OIDC) with Authorization Code Flow + PKCE. The authentication is handled entirely client-side using the `react-oidc-context` library, which is a React wrapper around `oidc-client-ts`.

## Required Okta Application Configuration

### 1. Create or Update Okta Application

Navigate to **Applications > Applications** in your Okta Admin Console.

#### Application Type
- **Application type**: Web Application (OIDC - OpenID Connect)
- **Grant type allowed**: Authorization Code
- **PKCE**: Required (Enable "Proof Key for Code Exchange")

### 2. Sign-in Redirect URIs

Add the following redirect URI:

```
http://localhost:5173/callback
```

**Note**: In production, replace `http://localhost:5173` with your actual production domain.

The `/callback` route is where Okta redirects users after successful authentication. This is handled by the `src/routes/callback.tsx` component.

### 3. Sign-out Redirect URIs

Add the following sign-out redirect URI:

```
http://localhost:5173
```

**Note**: In production, replace with your production domain.

This is where users are redirected after logout.

### 4. Trusted Origins (CORS)

Navigate to **Security > API > Trusted Origins** and add:

- **Origin URL**: `http://localhost:5173`
- **Type**: Check both:
  - ✅ CORS
  - ✅ Redirect

**Why?** The browser needs to make cross-origin requests to Okta from your React app running on port 5173.

### 5. Login Redirect URI

In the application settings:
- **Login redirect URIs**: `http://localhost:5173/callback`
- **Initiate login URI**: Leave blank or set to `http://localhost:5173/login`

### 6. Assignments

Ensure your test users are assigned to this application:
- Navigate to the **Assignments** tab
- Add users or groups that should have access

## Claims and Scopes Configuration

### Default Scopes

The application requests these scopes:
- `openid` - Required for OIDC
- `profile` - User's profile information (name, etc.)
- `email` - User's email address
- `groups` - User's group memberships

### Configure Groups Claim in ID Token

To include user groups in the authentication response:

1. Navigate to **Security > API > Authorization Servers**
2. Select your authorization server (usually "default")
3. Go to the **Claims** tab
4. Click **Add Claim**

Configure the groups claim:
- **Name**: `groups`
- **Include in token type**: ID Token, Always
- **Value type**: Groups
- **Filter**: Matches regex `.*` (to include all groups)
- **Include in**: Select "Any scope"

Alternatively, you can use:
- **Filter**: Starts with and enter a prefix (e.g., `app-`) to only include specific groups

### Optional: Configure Groups Claim in Access Token

If you need groups in the access token for API authorization:

1. Add another claim with the same configuration
2. **Include in token type**: Access Token, Always

## Authorization Server Configuration

### Default Authorization Server Settings

Navigate to **Security > API > Authorization Servers > default**

#### Access Policies

Ensure you have an access policy that allows your application:

1. Go to **Access Policies** tab
2. Edit or create a policy
3. Add a rule with:
   - **Grant types**: Authorization Code
   - **Scopes**: openid, profile, email, groups
   - **User assignments**: Users assigned to this application

## Environment Variables

After configuring Okta, update your `.env.local` file with these values:

```bash
# Okta Issuer URL (Authorization Server)
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default

# Your Okta Application Client ID
VITE_OKTA_CLIENT_ID=0oa...your-client-id

# Redirect URI after successful login
VITE_REDIRECT_URI=http://localhost:5173/callback

# Redirect URI after logout
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
```

**Important Notes:**
- Replace `your-domain.okta.com` with your actual Okta domain
- Replace `0oa...your-client-id` with your application's client ID
- No client secret is needed because we're using PKCE

## Key Differences from Better Auth Setup

### What Changed

1. **No Backend Auth Routes**
   - Better Auth required: `/api/auth/*`, `/auth/start`, `/auth/logout`
   - react-oidc-context: All auth happens client-side, no custom backend routes needed

2. **No Server-Side Session Management**
   - Better Auth: Server managed sessions with cookies
   - react-oidc-context: Client-side session with tokens stored in browser (sessionStorage/localStorage)

3. **Redirect URIs**
   - Better Auth: `http://localhost:8080/api/auth/callback/okta`
   - react-oidc-context: `http://localhost:5173/callback`

4. **No Client Secret Required**
   - Better Auth: Required client secret (confidential client)
   - react-oidc-context: Uses PKCE instead (public client pattern)

### Okta Configuration Updates Required

If you're migrating from Better Auth to react-oidc-context:

1. ✅ **Update Sign-in redirect URIs**:
   - Remove: `http://localhost:8080/api/auth/callback/okta`
   - Add: `http://localhost:5173/callback`

2. ✅ **Update Trusted Origins**:
   - Change from port 8080 to 5173
   - Origin: `http://localhost:5173`

3. ✅ **Enable PKCE**: 
   - Ensure "Proof Key for Code Exchange (PKCE)" is required
   - This is crucial for security with public clients

4. ✅ **Verify Grant Types**:
   - Ensure "Authorization Code" is enabled
   - "Client Credentials" not needed for this flow

## Testing the Configuration

### 1. Verify OIDC Discovery Endpoint

Visit in your browser:
```
https://your-domain.okta.com/oauth2/default/.well-known/openid-configuration
```

You should see a JSON response with all OIDC endpoints.

### 2. Test Login Flow

1. Start the application: `npm run dev`
2. Navigate to `http://localhost:5173`
3. You should be redirected to `/login`
4. Click "Login with Okta"
5. Authenticate with Okta
6. You should be redirected to `/callback`, then to `/products`
7. Your groups should appear in the header

### 3. Check Browser Console

Open browser DevTools and check for:
- OIDC logs from `oidc-client-ts`
- User profile in the session
- Groups in `user.profile.groups`

### 4. Verify Groups Display

After login, you should see:
- User name in the header
- Groups displayed below the name (if you belong to any groups)

## Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Ensure the redirect URI in Okta exactly matches what's in `.env.local`:
- Okta: `http://localhost:5173/callback`
- .env.local: `VITE_REDIRECT_URI=http://localhost:5173/callback`
- No trailing slash, exact match required

### Issue: CORS errors in browser console

**Solution**: 
1. Add `http://localhost:5173` to Trusted Origins in Okta
2. Enable both CORS and Redirect options
3. Wait a few minutes for the change to propagate

### Issue: Groups not showing in user profile

**Solution**:
1. Verify the groups claim is configured in the authorization server
2. Check "Include in token type" is set to "ID Token, Always"
3. Ensure the user is actually a member of groups in Okta
4. Check browser console for the user object: `auth.user.profile.groups`

### Issue: User is not assigned to application

**Solution**: 
1. Go to Application > Assignments
2. Assign the user or their group to the application
3. Try logging in again

### Issue: Token expired or invalid

**Solution**: 
- The library automatically handles token refresh with `automaticSilentRenew: true`
- Clear browser storage and log in again if issues persist
- Check that your authorization server access policy allows refresh tokens

## Production Deployment Checklist

When deploying to production:

- [ ] Update all redirect URIs to production domain
- [ ] Update Trusted Origins to production domain
- [ ] Update `.env` file with production values
- [ ] Use HTTPS for all URLs (required in production)
- [ ] Review and restrict groups claim filter if needed
- [ ] Set appropriate token lifetimes in Okta
- [ ] Enable MFA for users if not already enabled
- [ ] Review access policies and assignments
- [ ] Test the full authentication flow in production
- [ ] Monitor authentication logs in Okta

## Security Considerations

### PKCE vs Client Secret

This implementation uses PKCE (Proof Key for Code Exchange) instead of a client secret because:
- The app runs entirely in the browser (public client)
- Client secrets cannot be safely stored in browser code
- PKCE provides equivalent security without requiring secrets
- This is the OAuth 2.1 recommended approach for SPAs

### Token Storage

By default, `oidc-client-ts` stores tokens in:
- **sessionStorage** for the user state
- **In-memory** for sensitive tokens (if configured)

You can configure this in `src/lib/oidc-config.ts` if needed.

### Silent Token Renewal

The config enables `automaticSilentRenew: true` which:
- Automatically refreshes tokens before expiry
- Uses a hidden iframe to renew without user interaction
- Requires proper CORS configuration in Okta

## Additional Resources

- [Okta OIDC Documentation](https://developer.okta.com/docs/concepts/oauth-openid/)
- [react-oidc-context GitHub](https://github.com/authts/react-oidc-context)
- [oidc-client-ts Documentation](https://authts.github.io/oidc-client-ts/)
- [OAuth 2.0 for Browser-Based Apps (BCP)](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
