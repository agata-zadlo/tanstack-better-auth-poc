const authority = import.meta.env.VITE_OKTA_ISSUER;
const client_id = import.meta.env.VITE_OKTA_CLIENT_ID;
const redirect_uri = import.meta.env.VITE_REDIRECT_URI;
const post_logout_redirect_uri = import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI;

if (!authority || !client_id || !redirect_uri) {
  throw new Error(
    "Missing required OIDC configuration. Please check your .env.local file."
  );
}

export const oidcConfig = {
  authority,
  client_id,
  redirect_uri,
  post_logout_redirect_uri,
  scope: "openid profile email groups",
  response_type: "code",
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    // Remove the code and state from the URL after successful login
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
